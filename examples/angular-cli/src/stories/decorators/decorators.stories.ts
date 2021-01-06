// your-component.stories.ts

import { componentDecorator, Meta, moduleMetadata, templateDecorator } from '@storybook/angular';
import ChildComponent from './child.component';
import ParentComponent from './parent.component';

export default {
  title: 'Core / Decorators',
  component: ChildComponent,
  decorators: [
    templateDecorator(
      (story) => `Grandparent<br><div style="margin: 3em; border:solid;">${story}</div>`
    ),
  ],
  args: { childText: 'Child text', childPrivateText: 'Child private text' },
  argTypes: { onClickChild: { action: 'onClickChild' } },
} as Meta;

export const WithTemplate = (args) => ({
  template: `Child Template`,
  props: {
    ...args,
  },
});

export const WithComponent = (args) => ({
  props: {
    ...args,
  },
});

export const WithLegacyComponent = (args) => ({
  component: ChildComponent,
  props: {
    ...args,
  },
});

export const WithComponentDecorator = (args) => ({
  component: ChildComponent,
  props: {
    ...args,
  },
});
WithComponentDecorator.decorators = [
  moduleMetadata({ declarations: [ParentComponent] }),
  componentDecorator(ParentComponent),
];

export const WithComponentDecoratorAndProps = (args) => ({
  component: ChildComponent,
  props: {
    ...args,
  },
});
WithComponentDecoratorAndProps.decorators = [
  moduleMetadata({ declarations: [ParentComponent] }),
  componentDecorator(ParentComponent, {
    parentText: 'Parent text',
    onClickParent: () => {
      console.log('onClickParent');
    },
  }),
];

export const WithComponentDecoratorAndArgs = (args) => ({
  component: ChildComponent,
  props: {
    ...args,
  },
});
WithComponentDecoratorAndArgs.argTypes = {
  parentText: { control: { type: 'text' } },
  onClickParent: { action: 'onClickParent' },
};
WithComponentDecoratorAndArgs.decorators = [
  moduleMetadata({ declarations: [ParentComponent] }),
  componentDecorator(ParentComponent, (args) => ({
    parentText: args.parentText,
    onClickParent: args.onClickParent,
  })),
];

export const WithCustomDecorator = (args) => ({
  template: `Child Template`,
  props: {
    ...args,
  },
});
WithCustomDecorator.decorators = [
  (storyFunc) => {
    const story = storyFunc();

    return {
      ...story,
      template: `Custom Decorator <div style="margin: 3em">${story.template}</div>`,
    };
  },
];

export const AngularLegacyRendering = (args) => ({
  template: `Child Template`,
  props: {
    ...args,
  },
});
AngularLegacyRendering.parameters = { angularLegacyRendering: true };
AngularLegacyRendering.decorators = [
  (storyFunc) => {
    const story = storyFunc();

    return {
      ...story,
      template: `Custom Decorator <div style="margin: 3em">${story.template}</div>`,
    };
  },
];
