import { create } from '@storybook/theming';
import logo from './logo.svg';
import { addons } from '@storybook/manager-api';
import { defaultConfig, type TagBadgeParameters } from 'storybook-addon-tag-badges';

const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const theme = create({
  base: prefersDark ? 'dark' : 'light',
  brandTitle: 'use-wc',
  brandImage: logo,
});

addons.setConfig({
  theme,
  tagBadges: [
    {
      tags: 'input',
      badge: {
        text: 'Input',
        bgColor: '#0005',
        fgColor: '#fff',
        tooltip: 'Submits data when inside a form',
      },
      display: {
        sidebar: ['docs'],
        toolbar: ['docs'],
      },
    },
    {
      tags: 'utility',
      badge: {
        text: 'Utility',
        bgColor: '#0005',
        fgColor: '#fff',
        tooltip: 'Adds standardized control patterns to your native elements',
      },
      display: {
        sidebar: ['docs'],
        toolbar: ['docs'],
      },
    },
    // Place the default config after your custom matchers.
    ...defaultConfig,
  ] satisfies TagBadgeParameters,
});
