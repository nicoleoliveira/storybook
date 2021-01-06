/* eslint-disable no-param-reassign */
import { Type } from '@angular/core';
import { Args, DecoratorFunction } from '@storybook/addons';
import { computesTemplateFromComponent } from '../angular-beta/ComputesTemplateFromComponent';
import { ICollection, NgModuleMetadata, StoryFnAngularReturnType } from '../types';

export const moduleMetadata = (metadata: Partial<NgModuleMetadata>) => (storyFn: () => any) => {
  const story = storyFn();
  const storyMetadata = story.moduleMetadata || {};
  metadata = metadata || {};

  return {
    ...story,
    moduleMetadata: {
      declarations: [...(metadata.declarations || []), ...(storyMetadata.declarations || [])],
      entryComponents: [
        ...(metadata.entryComponents || []),
        ...(storyMetadata.entryComponents || []),
      ],
      imports: [...(metadata.imports || []), ...(storyMetadata.imports || [])],
      schemas: [...(metadata.schemas || []), ...(storyMetadata.schemas || [])],
      providers: [...(metadata.providers || []), ...(storyMetadata.providers || [])],
    },
  };
};

export const componentDecorator = (
  component: Type<unknown>,
  props?: ICollection | ((args: Args) => ICollection)
): DecoratorFunction<StoryFnAngularReturnType> => (storyFn, { args }) => {
  const story = storyFn();

  const currentProps = typeof props === 'function' ? props(args) : props;

  const template = computesTemplateFromComponent(component, currentProps, story.template);

  // Combine props with the story one. Story props override decorator props, if happen
  return {
    ...story,
    template,
    ...(currentProps || story.props
      ? {
          props: {
            ...currentProps,
            ...story.props,
          },
        }
      : {}),
  };
};

export const templateDecorator = (
  template: (story: string) => string,
  props?: ICollection | ((args: Args) => ICollection)
): DecoratorFunction<StoryFnAngularReturnType> => (storyFn, { args }) => {
  const story = storyFn();

  const currentProps = typeof props === 'function' ? props(args) : props;

  // Combine props with the story one. Story props override decorator props, if happen
  return {
    ...story,
    template: template(story.template),
    ...(currentProps || story.props
      ? {
          props: {
            ...currentProps,
            ...story.props,
          },
        }
      : {}),
  };
};
