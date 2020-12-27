import React from 'react';
import { RendererService } from '@storybook/angular/renderer';
import { IStory, StoryContext } from '@storybook/angular';
import { StoryFn } from '@storybook/addons';

const customElementsVersions: Record<string, number> = {};

export const prepareForInline = (storyFn: StoryFn<IStory>, { id, parameters }: StoryContext) => {
  // Upgrade story version in order that the next defined component has a unique key
  customElementsVersions[id] =
    customElementsVersions[id] !== undefined ? customElementsVersions[id] + 1 : 0;

  const customElementsName = `${id}_${customElementsVersions[id]}`;

  const Story = class Story extends React.Component {
    wrapperRef: React.RefObject<unknown>;

    elementName: string;

    constructor(props: any) {
      super(props);
      this.wrapperRef = React.createRef();
    }

    async componentDidMount() {
      const rendererService = RendererService.getInstance();

      // eslint-disable-next-line no-undef
      customElements.define(
        customElementsName,
        await rendererService.renderAngularElement({
          storyFnAngular: storyFn(),
          parameters,
        })
      );
    }

    render() {
      return React.createElement(customElementsName, {
        ref: this.wrapperRef,
      });
    }
  };
  return React.createElement(Story);
};
