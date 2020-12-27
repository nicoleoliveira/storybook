import { extractArgTypes, extractComponentDescription } from './compodoc';
import { prepareForInline } from './prepareForInline';

export const parameters = {
  docs: {
    extractArgTypes,
    extractComponentDescription,
    inlineStories: false,
    prepareForInline,
  },
};
