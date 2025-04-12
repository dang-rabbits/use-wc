import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { UseDropdown } from './use-dropdown';

const meta: Meta<UseDropdown> = {
  component: 'use-dropdown',
  title: 'Web Components/use-dropdown',
  tags: ['autodocs', '!dev', 'utility'],
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

export const Default: Story = {
  parameters: {
    showPanel: false,
  },
};

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
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
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

export const DisabledItems: Story = {
  parameters: {
    docs: {
      description:
        'Screen reader users will need to know of disabled items. Use `aria-disabled="true"` to indicate that an item is disabled and disable the `click` event handler within the callback directly.',
    },
  },
  render: () => html`
    <use-dropdown label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem" aria-disabled="true">menu item 2</button>
      <button role="menuitem">menu item 3</button>
    </use-dropdown>
  `,
};

export const CustomAccessibleItems: Story = {
  render: () => html`
    <use-dropdown label="Menu">
      <div role="menuitem" onclick="alert('hello')">menu item 1</div>
      <div role="menuitem" onclick="alert('hello')">menu item 2</div>
      <div role="menuitem" onclick="alert('hello')">menu item 3</div>
    </use-dropdown>
  `,
};

export const CustomTriggerContent: Story = {
  render: () => html`
    <use-dropdown>
      <svg
        slot="trigger-content"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Menu"
      >
        <rect y="2" width="24" height="2" fill="currentColor" />
        <rect y="11" width="24" height="2" fill="currentColor" />
        <rect y="20" width="24" height="2" fill="currentColor" />
      </svg>
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <button role="menuitem">menu item 3</button>
    </use-dropdown>
  `,
};

export const CustomItemLayout: Story = {
  parameters: {
    docs: {
      description:
        'This is inspired by Edge and Chrome browser main menu dropdown. The Zoom In and Zoom Out buttons are grouped together in a horizontal layout but still accessible with the standard up and down arrow keys.',
    },
  },
  render: () => html`
    <use-dropdown label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <hr />
      <div style="display: flex; justify-content: space-between; width: 100vw; max-width: 200px;">
        <div id="custom-menu-layout-item-label">Zoom</div>
        <div style="display: inline-flex; gap: 8px; align-items: center;">
          <button role="menuitem" menu-item="keep-open" aria-label="Zoom Out">-</button>
          <div>100%</div>
          <button role="menuitem" menu-item="keep-open" aria-label="Zoom In">+</button>
        </div>
      </div>
    </use-dropdown>
  `,
};

export const SplitMenuItemButton: Story = {
  render: () => html`
    <use-dropdown label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <div style="display: flex; gap: 8px; width: 100vw; max-width: 200px;">
        <button role="menuitem" style="flex: 1 1 auto;">menu item 3</button>
        <use-dropdown>
          <div slot="trigger-content">▶</div>
          <button role="menuitem">nested menu item 1</button>
          <button role="menuitem">nested menu item 2</button>
          <button role="menuitem">nested menu item 3</button>
        </use-dropdown>
      </div>
    </use-dropdown>
  `,
};

// TODO
// export const CustomArrow: Story = {}

// TODO
// export const PopoverHeader: Story = {}

export const CheckboxSelect: Story = {
  parameters: {
    docs: {
      descrption: 'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-editor/',
    },
  },
  render: () => html`
    <use-dropdown label="Checkbox options">
      <button role="menuitemcheckbox" aria-checked="true" type="button">✅ option 1</button>
      <button role="menuitemcheckbox" aria-checked="false" type="button">option 2</button>
      <button role="menuitemcheckbox" aria-checked="false" type="button">option 3</button>
    </use-dropdown>
  `,
};

export const RadioSelect: Story = {
  parameters: {
    docs: {
      descrption: 'https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-editor/',
    },
  },
  render: () => html`
    <use-dropdown label="Radio options">
      <button role="menuitemradio" aria-checked="true" type="button">✅ option 1</button>
      <button role="menuitemradio" aria-checked="false" type="button">option 2</button>
      <button role="menuitemradio" aria-checked="false" type="button">option 3</button>
    </use-dropdown>
  `,
};

export const InjectedItems: Story = {
  render: () => {
    function injectItems() {
      const dropdown = document.getElementById('inject-dropdown');
      if (dropdown) {
        dropdown.innerHTML =
          dropdown.innerHTML +
          `
          <button role="menuitem">injected item 1</button>
          <button role="menuitem">injected item 2</button>
          <button role="menuitem">injected item 3</button>
        `;
      }
    }

    return html`
      <use-dropdown id="inject-dropdown" label="Menu">
        <button role="menuitem">menu item 1</button>
        <button role="menuitem">menu item 2</button>
        <button role="menuitem">menu item 3</button>
      </use-dropdown>
      <button type="button" @click=${injectItems}>Inject items</button>
    `;
  },
};

export const CustomStyles: Story = {
  render: () => html`
    <style>
      .custom-use-dropdown::part(trigger),
      .custom-use-dropdown::part(menu) {
        background-color: blanchedalmond;
        color: orangered;
        border: 2px solid orangered;
        border-radius: 6px;
        padding: 4px;
        box-shadow:
          1px 1px 0 orangered,
          2px 2px 0 orangered,
          3px 3px 0 orangered;
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

export const CSSAnchorPositioning: Story = {
  parameters: {
    docs: {
      description: {
        story: `<baseline-status featureId="anchor-positioning"></baseline-status>`,
      },
    },
  },
  render: () => html`
    <style>
      .css-anchor-positioning use-dropdown {
        anchor-scope: --use-dropdown-trigger;
      }

      .css-anchor-positioning use-dropdown::part(trigger) {
        white-space: nowrap;
        anchor-name: --use-dropdown-trigger;
      }

      .css-anchor-positioning use-dropdown::part(menu) {
        margin: unset;
        inset: unset;
        position: absolute;
        position-anchor: --use-dropdown-trigger;

        inset-block-start: calc(anchor(end) + 0.5rem);
        inset-inline-start: anchor(start);
        position-try-fallbacks:
          flip-block,
          flip-inline,
          flip-inline flip-block;
      }

      .css-anchor-positioning use-dropdown use-dropdown::part(menu) {
        margin-inline-start: 0.5rem;
        inset-block-start: anchor(start);
        inset-inline-start: anchor(end);
      }
    </style>
    <div class="css-anchor-positioning">
      <use-dropdown label="Menu">
        <button role="menuitem">menu item 1</button>
        <button role="menuitem">menu item 2</button>
        <button role="menuitem">menu item 3</button>

        <use-dropdown label="Nested menu">
          <button role="menuitem">nested menu item 1</button>
          <button role="menuitem">nested menu item 2</button>
          <button role="menuitem">nested menu item 3</button>

          <use-dropdown label="Nested menu">
            <button role="menuitem">nested menu item 1</button>
            <button role="menuitem">nested menu item 2</button>
            <button role="menuitem">nested menu item 3</button>
          </use-dropdown>

          <use-dropdown label="Nested menu">
            <button role="menuitem">nested menu item 1</button>
            <button role="menuitem">nested menu item 2</button>
            <button role="menuitem">nested menu item 3</button>
          </use-dropdown>
        </use-dropdown>

        <use-dropdown label="Nested menu 2">
          <button role="menuitem">nested menu item 1</button>
          <button role="menuitem">nested menu item 2</button>
          <button role="menuitem">nested menu item 3</button>
        </use-dropdown>
      </use-dropdown>
    </div>
  `,
};
