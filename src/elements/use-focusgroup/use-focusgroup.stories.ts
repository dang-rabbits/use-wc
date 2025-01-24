import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { UseFocusgroup } from './use-focusgroup';

const meta: Meta<UseFocusgroup> = {
  component: 'use-focusgroup',
  title: 'Web Components/use-focusgroup',
  tags: ['autodocs', '!dev'],
  args: {},
  render: (args: UseFocusgroup) => {
    return html`
      <use-focusgroup>
        <button>hello</button>
        <button>hello</button>
        <button>hello</button>
        <use-dropdown label="Menu">
          <button>hello</button>
          <button>hello</button>
        </use-dropdown>
        <use-listbox>
          <use-option>hello</use-option>
          <use-option>world</use-option>
        </use-listbox>
      </use-focusgroup>
      <use-dropdown label="Menu">
        <button>hello</button>
        <button>hello</button>
      </use-dropdown>
  `;
  },
};

export default meta;
type Story = StoryObj<UseFocusgroup>;

export const Default: Story = {};

export const Polyfill: Story = {
  render: () => html`
    <div focusgroup="inline">
      <button>hello</button>
      <button>hello</button>
      <use-widget>
        <input />
      </use-widget>
      <use-dropdown label="Menu">
        <button>hello</button>
        <button>hello</button>
      </use-dropdown>
      <use-select>
        <use-option>hello</use-option>
      </use-select>
      <button>hello</button>
    </div>
  `,
};
