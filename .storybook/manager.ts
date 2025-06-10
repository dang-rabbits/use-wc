import { create } from 'storybook/theming';
import logo from './logo.svg';
import { addons } from 'storybook/manager-api';

const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const theme = create({
  base: prefersDark ? 'dark' : 'light',
  brandTitle: 'use-wc',
  brandImage: logo,
});

addons.setConfig({
  theme,
});
