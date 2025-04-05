import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { UseFocusgroup } from './use-focusgroup';

const meta: Meta<UseFocusgroup> = {
  component: 'use-focusgroup',
  title: 'Web Components/use-focusgroup',
  tags: ['autodocs', '!dev', 'utility'],
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
        <button type="button">hello</button>
        <button type="button">hello</button>
        <button type="button">hello</button>
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

export const Block: Story = {
  args: {
    features: 'block',
  },
  render: () => {
    return html`
      <use-focusgroup features="block" style="display: flex; gap: 1rem; flex-direction: column;">
        <button type="button">hello</button>
        <button type="button">hello</button>
        <button type="button">hello</button>
      </use-focusgroup>
    `;
  }
};

export const Wrap: Story = {
  args: {
    features: 'wrap',
  },
};

export const NoMemory: Story = {
  args: {
    features: 'no-memory',
  },
};

export const Nested: Story = {
  render: () => {
    return html`
      <use-focusgroup features="inline" style="display: flex; gap: 1rem; flex-direction: row;">
        <button type="button">hello</button>
        <use-focusgroup features="block" style="display: flex; gap: 1rem; flex-direction: column;">
          <button type="button">hello</button>
          <button type="button">hello</button>
          <button type="button">hello</button>
        </use-focusgroup>
        <button type="button">hello</button>
      </use-focusgroup>
    `;
  },
};

export const Toolbar: Story = {
  render: () => {
    return html`
      <style>
        .custom-toolbar {
          display: flex;
          gap: 1rem;
        }
      </style>
      <use-focusgroup role="toolbar" features="inline" aria-orientation="horizontal" class="custom-toolbar">
        <use-dropdown label="font">
          <button type="button" role="menuitem">Arial</button>
          <button type="button" role="menuitem">Times New Roman</button>
          <button type="button" role="menuitem">Courier New</button>
        </use-dropdown>
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

export const WithWidgets: Story = {
  render: () => html`
    <use-focusgroup>
      <button type="button">hello</button>
      <button type="button">hello</button>
      <button type="button">hello</button>
      <use-widget>
        <button type="button">hello</button>
        <button type="button">hello</button>
        <button type="button">hello</button>
      </use-widget>
    </use-focusgroup>
  `,
};

export const Disclosure: Story = {
  render: () => html`
    <use-focusgroup>
      <button type="button">hello</button>
      <button type="button">hello</button>
      <button type="button">hello</button>
      <details>
        <summary>hello</summary>
        <button type="button">hello</button>
        <button type="button">hello</button>
        <button type="button">hello</button>
      </details>
    </use-focusgroup>
  `,
};
