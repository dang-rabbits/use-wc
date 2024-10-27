import { fn } from '@storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components';

const meta = {
  title: 'Anatomy/Entry',
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  args: {
    onLogin: fn(),
    onLogout: fn(),
    onCreateAccount: fn(),
  },
};

export default meta;

type Story = StoryObj;
