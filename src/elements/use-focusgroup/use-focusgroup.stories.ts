import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseFocusgroup } from "./use-focusgroup";

const meta: Meta<UseFocusgroup> = {
  component: "use-focusgroup",
  title: "Web Components/use-focusgroup",
  tags: ["autodocs", "!dev", "utility"],
  args: {
    features: "",
  },
  argTypes: {
    features: {
      control: {
        type: "text",
        options: "inline",
      },
    },
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

/** The same example as {@link Default}, themed. */
export const Theme: Story = {
  ...Default,
  parameters: { ...Default.parameters, allowTheme: true },
};

export const Inline: Story = {
  args: {
    features: "inline",
  },
};

export const Block: Story = {
  args: {
    features: "block",
  },
  render: () => {
    return html`
      <use-focusgroup features="block" style="display: flex; gap: 1rem; flex-direction: column;">
        <button type="button">hello</button>
        <button type="button">hello</button>
        <button type="button">hello</button>
      </use-focusgroup>
    `;
  },
};

export const Wrap: Story = {
  args: {
    features: "wrap",
  },
};

export const NoMemory: Story = {
  args: {
    features: "no-memory",
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
      <use-focusgroup
        role="toolbar"
        features="inline"
        aria-orientation="horizontal"
        class="custom-toolbar"
      >
        <button type="button" popovertarget="toolbar-font-menu">
          <use-caret>font</use-caret>
        </button>
        <use-menu id="toolbar-font-menu" aria-label="font">
          <button type="button" role="menuitem">Arial</button>
          <button type="button" role="menuitem">Times New Roman</button>
          <button type="button" role="menuitem">Courier New</button>
        </use-menu>
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

/**
 * While a menu opened from inside a focusgroup is open, the menu owns the arrow keys: `ArrowLeft` and `ArrowRight` don't move focus out of it, and `ArrowRight` on a submenu trigger opens the submenu. Press `Escape` to close the menu, return focus to its trigger, and resume focusgroup navigation.
 */
export const WithMenus: Story = {
  render: () => html`
    <use-focusgroup
      role="toolbar"
      features="inline"
      aria-orientation="horizontal"
      style="display: flex; gap: 1rem;"
    >
      <button type="button">bold</button>
      <button type="button" popovertarget="with-menus-font-menu">
        <use-caret>font</use-caret>
      </button>
      <use-menu id="with-menus-font-menu" aria-label="font">
        <button type="button" role="menuitem">Arial</button>
        <button type="button" role="menuitem">Times New Roman</button>
        <button type="button" role="menuitem" popovertarget="with-menus-size-menu">
          <use-caret>size</use-caret>
        </button>
        <use-menu id="with-menus-size-menu" aria-label="size">
          <button type="button" role="menuitem">small</button>
          <button type="button" role="menuitem">medium</button>
          <button type="button" role="menuitem">large</button>
        </use-menu>
      </use-menu>
      <button type="button">italic</button>
      <button type="button" popovertarget="with-menus-insert-menu">
        <use-caret>insert</use-caret>
      </button>
      <use-menu id="with-menus-insert-menu" aria-label="insert">
        <button type="button" role="menuitem">link</button>
        <button type="button" role="menuitem">image</button>
        <button type="button" role="menuitem">table</button>
      </use-menu>
      <button type="button">underline</button>
    </use-focusgroup>
  `,
};

/**
 * A dialog opened from inside a focusgroup keeps its own keyboard behavior: `Tab` moves between its controls and the arrow keys don't move focus out of it. Press `Escape` to close the dialog and resume focusgroup navigation.
 */
export const WithDialog: Story = {
  render: () => html`
    <use-focusgroup
      role="toolbar"
      features="inline"
      aria-orientation="horizontal"
      style="display: flex; gap: 1rem;"
    >
      <button type="button">bold</button>
      <button type="button" commandfor="with-dialog-dialog" command="show-modal">
        insert link
      </button>
      <dialog id="with-dialog-dialog" aria-label="insert link">
        <form method="dialog" style="display: flex; flex-direction: column; gap: 1rem;">
          <label>
            url
            <input type="url" />
          </label>
          <div style="display: flex; gap: 1rem;">
            <button type="button" commandfor="with-dialog-dialog" command="close">cancel</button>
            <button>insert</button>
          </div>
        </form>
      </dialog>
      <button type="button">italic</button>
    </use-focusgroup>
  `,
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

export const InjectButtons: Story = {
  render: () => {
    function handleInject() {
      const focusgroup = document.querySelector("#injectable") as UseFocusgroup;
      const button = document.createElement("button");
      button.type = "button";
      button.innerText = "injected";
      focusgroup.appendChild(button);
      focusgroup.appendChild(button.cloneNode(true));
      focusgroup.appendChild(button.cloneNode(true));
    }

    return html`
      <use-focusgroup id="injectable" style="display: flex; gap: 1rem; flex-direction: row;">
        <button type="button">markup</button>
        <button type="button">markup</button>
        <button type="button">markup</button>
      </use-focusgroup>
      <button @click=${handleInject} type="button">Inject</button>
    `;
  },
};
