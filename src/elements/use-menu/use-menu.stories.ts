import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseMenu } from "./use-menu";
import "../use-caret/use-caret";

const meta: Meta<UseMenu> = {
  component: "use-menu",
  title: "Web Components/use-menu",
  tags: ["autodocs", "!dev", "utility"],
  args: {
    disabled: false,
  },
  render: (args) => {
    return html`
      <use-menu ?disabled=${args.disabled} aria-label="Dropdown">
        <button role="menuitem">menu item 1</button>
        <button role="menuitem">menu item 2</button>
        <button role="menuitem">menu item 3</button>
        <a role="menuitem" href="https://usewc.com/">Use WC</a>
      </use-menu>
    `;
  },
};

export default meta;
type Story = StoryObj<UseMenu>;

export const Default: Story = {
  parameters: {
    showPanel: false,
  },
};

export const Theme: Story = {
  ...Default,
  parameters: { ...Default.parameters, allowTheme: true },
  render: () => html`
    <use-menu aria-label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem" aria-selected="true">selected menu item</button>
      <hr />
      <button role="menuitemcheckbox" aria-checked="true" type="button">checked option</button>
      <button role="menuitemcheckbox" aria-checked="false" type="button">unchecked option</button>
      <hr />
      <button role="menuitemradio" aria-checked="true" type="button">selected radio</button>
      <button role="menuitemradio" aria-checked="false" type="button">unselected radio</button>
    </use-menu>
  `,
};

export const Inert: Story = {
  render: () => {
    return html`
      <use-menu aria-label="inert dropdown" inert>
        <button role="menuitem">menu item 1</button>
        <button role="menuitem">menu item 2</button>
        <button role="menuitem">menu item 3</button>
        <a role="menuitem" href="https://usewc.com/">Use WC</a>
      </use-menu>
    `;
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Groups: Story = {
  render: () => html`
    <use-menu aria-label="Menu">
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
    </use-menu>
  `,
};

export const Dividers: Story = {
  render: () => html`
    <use-menu aria-label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <hr />
      <button role="menuitem">menu item 3</button>
    </use-menu>
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
    <use-menu aria-label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem" disabled aria-disabled="true">menu item 2</button>
      <button role="menuitem">menu item 3</button>
    </use-menu>
  `,
};

export const CustomAccessibleItems: Story = {
  render: () => html`
    <use-menu aria-label="Menu">
      <div role="menuitem" tabindex="0" onclick="alert('hello')">menu item 1</div>
      <div role="menuitem" onclick="alert('hello')">menu item 2</div>
      <div role="menuitem" onclick="alert('hello')">menu item 3</div>
    </use-menu>
  `,
};

export const ChangeInitialItem: Story = {
  render: () => html`
    <use-menu aria-label="Menu">
      <a href="#" role="menuitem" tabindex="-1">menu item 1</a>
      <a href="#" role="menuitem" tabindex="0" aria-current="page">menu item 2</a>
      <a href="#" role="menuitem" tabindex="-1">menu item 3</a>
    </use-menu>
  `,
};

export const CheckboxSelect: Story = {
  parameters: {
    docs: {
      descrption: "https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-editor/",
    },
  },
  render: () => html`
    <use-menu aria-label="Checkbox options">
      <button role="menuitemcheckbox" aria-checked="true" type="button">option 1</button>
      <button role="menuitemcheckbox" aria-checked="false" type="button">option 2</button>
      <button role="menuitemcheckbox" aria-checked="false" type="button">option 3</button>
    </use-menu>
  `,
};

export const SelectedItem: Story = {
  render: () => html`
    <use-menu aria-label="Selectable options">
      <button role="menuitem" aria-selected="false" type="button">option 1</button>
      <button role="menuitem" aria-selected="true" type="button">option 2</button>
      <button role="menuitem" aria-selected="false" type="button">option 3</button>
    </use-menu>
  `,
};

export const RadioSelect: Story = {
  parameters: {
    docs: {
      descrption: "https://www.w3.org/WAI/ARIA/apg/patterns/menubar/examples/menubar-editor/",
    },
  },
  render: () => html`
    <use-menu aria-label="Radio options">
      <button role="menuitemradio" aria-checked="true" type="button">option 1</button>
      <button role="menuitemradio" aria-checked="false" type="button">option 2</button>
      <button role="menuitemradio" aria-checked="false" type="button">option 3</button>
    </use-menu>
  `,
};

export const InjectedItems: Story = {
  render: () => {
    function injectItems() {
      const dropdown = document.getElementById("inject-dropdown");
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
      <use-menu id="inject-dropdown" aria-label="Menu">
        <button role="menuitem">menu item 1</button>
        <button role="menuitem">menu item 2</button>
        <button role="menuitem">menu item 3</button>
      </use-menu>
      <button type="button" @click=${injectItems}>Inject items</button>
    `;
  },
};

export const CustomStyles: Story = {
  render: () => html`
    <style>
      .custom-use-menu::part(trigger),
      .custom-use-menu::part(menu) {
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

      .custom-use-menu::part(trigger):focus-visible {
        outline: 2px dashed currentColor;
        outline-offset: 4px;
        box-shadow: none;
      }

      .custom-use-menu::part(trigger):is(:hover, :focus) {
        background-color: orangered;
        color: blanchedalmond;
      }

      .custom-use-menu :is(button, a) {
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

      .custom-use-menu hr {
        margin: 4px 0;
        border: none;
        border-top: 2px dotted orangered;
      }
    </style>
    <use-menu class="custom-use-menu" aria-label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <button role="menuitem">menu item 3</button>
      <hr />
      <a role="menuitem" href="#">Example link 1</a>
      <a role="menuitem" href="#">Example link 2</a>
    </use-menu>
  `,
};

/**
 * `popover` self-applies once `use-menu` discovers a `[popovertarget]` invoker or sees
 * `anchortarget` set, so it's redundant to set by hand in either of those cases. It's still
 * needed for the one case auto-apply can't cover: opening the menu from plain JS
 * (`menu.showPopover()`) with no `[popovertarget]` invoker anywhere for `use-menu` to discover.
 * With no invoker to anchor to either, `use-menu` falls back to its previous sibling in markup —
 * the button here, kept immediately before it for that reason.
 */
export const ManualPopover: Story = {
  render: () => html`
    <button
      type="button"
      @click=${(event: Event) => {
        const button = event.currentTarget as HTMLElement;
        const menu = button.nextElementSibling as HTMLElement & { showPopover(): void };
        menu.showPopover();
      }}
    >
      Menu
    </button>
    <use-menu id="manual-popover-menu" aria-label="Menu" popover>
      <button role="menuitem" type="button" autofocus>menu item 1</button>
      <button role="menuitem" type="button">menu item 2</button>
      <button role="menuitem" type="button">menu item 3</button>
    </use-menu>
  `,
};

/**
 * A plain `<button popovertarget="…">` owned entirely by the consumer, with `use-caret`
 * supplying only the caret. `use-menu` applies `popover` and anchor positioning to itself once it
 * notices the invoker — `anchortarget` isn't needed with a single invoker like this one.
 */
export const AnchoredToInvoker: Story = {
  render: () => html`
    <button id="anchored-trigger" popovertarget="anchored-menu">
      <use-caret>Menu</use-caret>
    </button>
    <use-menu id="anchored-menu" aria-label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <button role="menuitem">menu item 3</button>
      <a role="menuitem" href="https://usewc.com/">Use WC</a>
    </use-menu>
  `,
};

/**
 * `anchoralign` is authored `"<block> <inline>"`, in the same order as the `position-area` value
 * it compiles to. The default, `end start`, opens below the trigger with inline-start edges
 * aligned.
 *
 * `use-menu` opens at `min-block-size: 30vh`, so this demo needs real vertical room on both
 * sides of the trigger row — otherwise a `start` alignment has nowhere to open above it,
 * `position-try`'s flip fallback (correctly) kicks in, and it opens below anyway, making the
 * alignment look broken when it isn't. Centering the row of triggers in a tall container gives
 * every variant genuine room in both directions.
 *
 * Note: theme.css wraps non-`allowTheme` stories (this one included) in `<use-theme-escape>`,
 * which sweeps `all: revert-layer !important` across light-DOM content to render unstyled native
 * defaults — and that sweep also reverts this container's own plain inline layout styles, since
 * they have nothing in a lower cascade layer to roll back to. So this "real room" setup is
 * unreliable in the actual Storybook demo today; it's left as-is (no `!important`) until that's
 * resolved at the sweep level rather than patched around per-story.
 */
export const AnchorAlignments: Story = {
  render: () => html`
    <div
      style="display: flex; align-items: center; justify-content: center; gap: 2rem; flex-wrap: wrap; min-block-size: 100vh;"
    >
      ${(["end start", "end end", "start start", "start end"] as const).map(
        (anchoralign) => html`
          <div>
            <button
              id="align-${anchoralign.replace(" ", "-")}"
              popovertarget="align-${anchoralign.replace(" ", "-")}-menu"
            >
              <use-caret>${anchoralign}</use-caret>
            </button>
            <use-menu
              id="align-${anchoralign.replace(" ", "-")}-menu"
              aria-label="Menu"
              anchoralign=${anchoralign}
            >
              <button role="menuitem">menu item 1</button>
              <button role="menuitem">menu item 2</button>
              <button role="menuitem">menu item 3</button>
            </use-menu>
          </div>
        `,
      )}
    </div>
  `,
};

/** Set `aria-label` on the invoker button for an icon-only trigger with a real accessible name. */
export const IconOnlyAnchoredTrigger: Story = {
  render: () => html`
    <button id="icon-only-trigger" popovertarget="icon-only-menu" aria-label="Menu">
      <svg
        slot="icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect y="2" width="24" height="2" fill="currentColor" />
        <rect y="11" width="24" height="2" fill="currentColor" />
        <rect y="20" width="24" height="2" fill="currentColor" />
      </svg>
    </button>
    <use-menu id="icon-only-menu" aria-label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <button role="menuitem">menu item 3</button>
    </use-menu>
  `,
};

export const NestedSubmenu: Story = {
  render: () => html`
    <button id="nested-trigger" popovertarget="nested-outer-menu">
      <use-caret>Menu</use-caret>
    </button>
    <use-menu id="nested-outer-menu" aria-label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <button role="menuitem" popovertarget="nested-inner-menu">
        <use-caret>Submenu</use-caret>
      </button>
      <use-menu id="nested-inner-menu" aria-label="Submenu">
        <button role="menuitem">nested menu item 1</button>
        <button role="menuitem">nested menu item 2</button>
        <button role="menuitem">nested menu item 3</button>
      </use-menu>
    </use-menu>
  `,
};

/**
 * Several elements can open the same menu. Without `anchortarget` a multi-invoker menu has no
 * single element to anchor to; setting it keeps the menu pinned to one of them — here, always
 * the middle button — instead of following whichever one was clicked.
 */
export const MultipleInvokers: Story = {
  render: () => html`
    <div style="display: flex; gap: 1rem;">
      <button popovertarget="shared-menu">Left</button>
      <button id="pinned-anchor" popovertarget="shared-menu">Middle (anchor)</button>
      <button popovertarget="shared-menu">Right</button>
    </div>
    <use-menu id="shared-menu" aria-label="Menu" anchortarget="pinned-anchor">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <button role="menuitem">menu item 3</button>
    </use-menu>
  `,
};

export const AnchoredCheckboxSelect: Story = {
  render: () => html`
    <button id="anchored-checkbox-trigger" popovertarget="anchored-checkbox-menu">
      <use-caret>Checkbox options</use-caret>
    </button>
    <use-menu id="anchored-checkbox-menu" aria-label="Checkbox options">
      <button role="menuitemcheckbox" aria-checked="true" type="button">option 1</button>
      <button role="menuitemcheckbox" aria-checked="false" type="button">option 2</button>
      <button role="menuitemcheckbox" aria-checked="false" type="button">option 3</button>
    </use-menu>
  `,
};
