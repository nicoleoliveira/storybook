import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Subscription, Subject } from 'rxjs';
import { map, skip } from 'rxjs/operators';

import { ICollection } from '../types';
import { STORY_PROPS } from './StorybookProvider';
import { ComponentInputsOutputs, getComponentInputsOutputs } from './utils/NgComponentAnalyzer';
import { RendererService } from './RendererService';

const getNonInputsOutputsProps = (
  ngComponentInputsOutputs: ComponentInputsOutputs,
  props: ICollection = {}
) => {
  const inputs = ngComponentInputsOutputs.inputs
    .filter((i) => i.templateName in props)
    .map((i) => i.templateName);
  const outputs = ngComponentInputsOutputs.outputs
    .filter((o) => o.templateName in props)
    .map((o) => o.templateName);
  return Object.keys(props).filter((k) => ![...inputs, ...outputs].includes(k));
};

/**
 * Wraps the story template into a component
 *
 * @param storyComponent
 * @param initialProps
 */
export const createStorybookWrapperComponent = (
  template: string,
  storyComponent: Type<unknown>,
  styles: string[],
  initialProps?: ICollection
): Type<any> => {
  @Component({
    selector: RendererService.SELECTOR_STORYBOOK_WRAPPER,
    template,
    styles,
  })
  class StorybookWrapperComponent implements AfterViewInit, OnDestroy {
    private storyPropsSubscription: Subscription;

    @ViewChild(storyComponent ?? '', { static: true }) storyComponentElementRef: ElementRef;

    @ViewChild(storyComponent ?? '', { read: ViewContainerRef, static: true })
    storyComponentViewContainerRef: ViewContainerRef;

    constructor(
      @Inject(STORY_PROPS) private storyProps$: Subject<ICollection | undefined>,
      private changeDetectorRef: ChangeDetectorRef
    ) {
      // Initializes Inputs/Outputs values
      Object.assign(this, initialProps);
    }

    ngAfterViewInit(): void {
      // Bind properties to component, if the story have component
      if (this.storyComponentElementRef) {
        const ngComponentInputsOutputs = getComponentInputsOutputs(storyComponent);

        const initialOtherProps = getNonInputsOutputsProps(ngComponentInputsOutputs, initialProps);

        // Initializes properties that are not Inputs | Outputs
        // Allows story props to override local component properties
        initialOtherProps.forEach((p) => {
          (this.storyComponentElementRef as any)[p] = initialProps[p];
        });
        // `markForCheck` the component in case this uses changeDetection: OnPush
        // And then forces the `detectChanges`
        this.storyComponentViewContainerRef.injector.get(ChangeDetectorRef).markForCheck();
        this.changeDetectorRef.detectChanges();

        // Once target component has been initialized, the storyProps$ observable keeps target component inputs up to date
        this.storyPropsSubscription = this.storyProps$
          .pipe(
            skip(1),
            map((props) => {
              // removes component output in props
              const outputsKeyToRemove = ngComponentInputsOutputs.outputs.map(
                (o) => o.templateName
              );
              return Object.entries(props).reduce(
                (prev, [key, value]) => ({
                  ...prev,
                  ...(!outputsKeyToRemove.includes(key) && {
                    [key]: value,
                  }),
                }),
                {} as ICollection
              );
            }),
            map((props) => {
              // In case a component uses an input with `bindingPropertyName` (ex: @Input('name'))
              // find the value of the local propName in the component Inputs
              // otherwise use the input key
              return Object.entries(props).reduce((prev, [propKey, value]) => {
                const input = ngComponentInputsOutputs.inputs.find(
                  (o) => o.templateName === propKey
                );

                return {
                  ...prev,
                  ...(input ? { [input.propName]: value } : { [propKey]: value }),
                };
              }, {} as ICollection);
            })
          )
          .subscribe((props) => {
            // Replace inputs with new ones from props
            Object.assign(this.storyComponentElementRef, props);

            // `markForCheck` the component in case this uses changeDetection: OnPush
            // And then forces the `detectChanges`
            this.storyComponentViewContainerRef.injector.get(ChangeDetectorRef).markForCheck();
            this.changeDetectorRef.detectChanges();
          });
      }
    }

    ngOnDestroy(): void {
      if (this.storyPropsSubscription != null) {
        this.storyPropsSubscription.unsubscribe();
      }
    }
  }
  return StorybookWrapperComponent;
};
