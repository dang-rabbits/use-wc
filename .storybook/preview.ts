import type { Preview } from "@storybook/web-components";
import { setCustomElementsManifest } from '@storybook/web-components';
import { themes } from '@storybook/theming';

import '../src/elements';

import customElements from '../custom-elements.json';

setCustomElementsManifest(customElements);

const preview: Preview = {
  parameters: {
    docs: {
      theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? themes.dark : themes.normal,
    },
  },
};

export default preview;
