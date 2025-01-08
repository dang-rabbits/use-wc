import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { UseDropdown } from './use-dropdown';

const meta: Meta<UseDropdown> = {
  component: 'use-dropdown',
  title: 'Web Components/use-dropdown',
  tags: ['autodocs', '!dev'],
  args: {
    disabled: false,
  },
  render: (args) => {
    return html`
      <use-dropdown ?disabled=${args.disabled} label="Dropdown">
        <button role="menuitem">menu item 1</button>
        <button role="menuitem">menu item 2</button>
        <button role="menuitem">menu item 3</button>
        <a role="menuitem" href="https://usewc.com/">Use WC</a>
      </use-dropdown>
  `;
  },
};

export default meta;
type Story = StoryObj<UseDropdown>;

export const Default: Story = {};

export const Inert: Story = {
  render: () => {
    return html`
      <use-dropdown label="inert dropdown" inert>
        <button role="menuitem">menu item 1</button>
        <button role="menuitem">menu item 2</button>
        <button role="menuitem">menu item 3</button>
        <a role="menuitem" href="https://usewc.com/">Use WC</a>
      </use-dropdown>
  `;
  }
};

export const Disabled: Story = {
  args: {
    disabled: true
  },
};

export const NestedMenus: Story = {
  render: () => html`
    <use-dropdown label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <button role="menuitem">menu item 3</button>

      <use-dropdown label="Neste menu">
        <button role="menuitem">nested menu item 1</button>
        <button role="menuitem">nested menu item 2</button>
        <button role="menuitem">nested menu item 3</button>
      </use-dropdown>
    </use-dropdown>
  `,
};

export const Groups: Story = {
  render: () => html`
    <use-dropdown label="Menu">
      <div role="group" aria-label="Group">
        <div>Group</div>
        <button role="menuitem">group item 1</button>
        <button role="menuitem">group item 2</button>
        <button role="menuitem">group item 3</button>
      </div>
      <div role="group" aria-label="Group">
        <div>Group</div>
        <button role="menuitem">group item 1</button>
        <button role="menuitem">group item 2</button>
        <button role="menuitem">group item 3</button>
      </div>
    </use-dropdown>
  `,
};

export const Dividers: Story = {
  render: () => html`
    <use-dropdown label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <hr />
      <button role="menuitem">menu item 3</button>
    </use-dropdown>
  `,
};

export const CustomTrigger: Story = {
  render: () => html`
    <style>
      .custom-trigger::part(trigger-arrow) {
        display: none;
      }
    </style>
    <use-dropdown class="custom-trigger">
      <span slot="trigger-label" style="display: contents">
        <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect y="2" width="24" height="2" fill="currentColor"/>
          <rect y="11" width="24" height="2" fill="currentColor"/>
          <rect y="20" width="24" height="2" fill="currentColor"/>
        </svg>
        Menu
      </span>
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <button role="menuitem">menu item 3</button>
    </use-dropdown>
  `,
};

export const CheckboxSelect: Story = {
  parameters: {
    docs: {
      descrption: 'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-editor/'
    }
  },
  render: () => html`
    <use-dropdown label="Checkbox options">
      <button role="menuitemcheckbox" aria-checked="true" type="button">✅ option 1</button>
      <button role="menuitemcheckbox" aria-checked="false" type="button">option 2</button>
      <button role="menuitemcheckbox" aria-checked="false" type="button">option 3</button>
    </use-dropdown>
  `
}

export const RadioSelect: Story = {
  parameters: {
    docs: {
      descrption: 'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-editor/'
    }
  },
  render: () => html`
    <use-dropdown label="Radio options">
      <button role="menuitemradio" aria-checked="true" type="button">✅ option 1</button>
      <button role="menuitemradio" aria-checked="false" type="button">option 2</button>
      <button role="menuitemradio" aria-checked="false" type="button">option 3</button>
    </use-dropdown>
  `
}

export const CustomStyles: Story = {
  render: () => html`
    <style>
      .custom-use-dropdown::part(trigger),
      .custom-use-dropdown::part(popover) {
        background-color: blanchedalmond;
        color: orangered;
        border: 2px solid orangered;
        border-radius: 6px;
        padding: 4px;
        box-shadow: 1px 1px 0 orangered, 2px 2px 0 orangered, 3px 3px 0 orangered;
        font-size: 16px;
        font-weight: 700;
      }

      .custom-use-dropdown::part(trigger):focus-visible {
        outline: 2px dashed currentColor;
        outline-offset: 4px;
        box-shadow: none;
      }

      .custom-use-dropdown::part(trigger):is(:hover, :focus) {
        background-color: orangered;
        color: blanchedalmond;
      }

      .custom-use-dropdown :is(button, a) {
        all: unset;
        box-sizing: border-box;
        display: block;
        width: 100%;
        font-weight: 400;
        border-radius: 6px;
        padding: 4px;
        cursor: default;

        &:is(:hover, :focus) {
          background-color: orangered;
          color: blanchedalmond;
        }
      }

      .custom-use-dropdown hr {
        margin: 4px 0;
        border: none;
        border-top: 2px dotted orangered;
      }
    </style>
    <use-dropdown class="custom-use-dropdown" label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <button role="menuitem">menu item 3</button>
      <hr />
      <a role="menuitem" href="#">Example link 1</a>
      <a role="menuitem" href="#">Example link 2</a>
    </use-dropdown>
  `,
};
