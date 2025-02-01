import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { UseFocusgroup } from './use-focusgroup';

const meta: Meta<UseFocusgroup> = {
  component: 'use-focusgroup',
  title: 'Web Components/use-focusgroup',
  tags: ['autodocs', '!dev'],
  args: {
    features: '',
  },
  argTypes: {
    features: {
      control: {
        type: 'text',
        options: 'inline',
      },
    }
  },
  render: (args: UseFocusgroup) => {
    return html`
      <use-focusgroup features=${args.features}>
        <button>hello</button>
        <button>hello</button>
        <button>hello</button>
      </use-focusgroup>
    `;
  },
};

export default meta;
type Story = StoryObj<UseFocusgroup>;

export const Default: Story = {};

export const Inline: Story = {
  args: {
    features: 'inline',
  },
};

export const Nested: Story = {
  render: (args: UseFocusgroup) => {
    return html`
      <use-focusgroup features="inline" style="display: flex; gap: 1rem; flex-direction: row;">
        <button>hello</button>
        <use-focusgroup features="block" style="display: flex; gap: 1rem; flex-direction: column;">
          <button>hello</button>
          <button>hello</button>
          <button>hello</button>
        </use-focusgroup>
        <button>hello</button>
      </use-focusgroup>
    `;
  },
};

export const Toolbar: Story = {
  render: (args: UseFocusgroup) => {
    return html`
      <style>
        .custom-toolbar {
          display: flex;
          gap: 1rem;
        }
      </style>
      <use-focusgroup role="toolbar" inline aria-orientation="horizontal" class="custom-toolbar">
        <div role="group" aria-label="text formatting">
          <button type="button">bold</button>
          <button type="button">italic</button>
          <button type="button">underline</button>
        </div>
        <div role="group" aria-label="text alignment">
          <button type="button">left</button>
          <button type="button">center</button>
          <button type="button">right</button>
        </div>
        <div role="group" aria-label="text indent">
          <button type="button">indent</button>
          <button type="button">outdent</button>
        </div>
      </use-focusgroup>
    `;
  },
};
