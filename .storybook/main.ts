import type { StorybookConfig } from '@storybook/web-components-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-links', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      optimizeDeps: {
        include: ['@storybook/addon-docs'],
      },
      plugins: [
        {
          name: 'fix-mdx-react-shim',
          enforce: 'pre',
          resolveId(source) {
            if (source.startsWith('file://') && source.includes('mdx-react-shim.js')) {
              // Convert file:///... path to normal filesystem path for Vite
              return new URL(source).pathname;
            }
            return null;
          },
        },
      ],
    });
  },
};
export default config;
