import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseCaret } from "./use-caret";
import "../use-menu/use-menu";

const meta: Meta<UseCaret> = {
  component: "use-caret",
  title: "Web Components/use-caret",
  tags: ["autodocs", "!dev", "utility"],
  // customIcon is a static, page-wide hook — Storybook doesn't reload the module between
  // sibling stories, so without this reset, viewing GlobalDefaultCaretViaCustomIcon would leave
  // every other story on this page showing its caret too.
  decorators: [
    (story) => {
      UseCaret.customIcon = undefined;
      return story();
    },
  ],
  render: () => html`
    <button id="use-caret-demo" popovertarget="use-caret-demo-menu">
      <use-caret>Menu</use-caret>
    </button>
    <use-menu id="use-caret-demo-menu" aria-label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <button role="menuitem">menu item 3</button>
    </use-menu>
  `,
};

export default meta;
type Story = StoryObj<UseCaret>;

export const Default: Story = {
  parameters: {
    showPanel: false,
  },
};

export const Theme: Story = {
  ...Default,
  parameters: { ...Default.parameters, allowTheme: true },
};

/** The `icon` slot replaces the default caret glyph entirely. */
export const CustomIconViaSlot: Story = {
  render: () => html`
    <button id="use-caret-custom-icon" popovertarget="use-caret-custom-icon-menu">
      <use-caret>
        Menu
        <span slot="icon" aria-hidden="true">＋</span>
      </use-caret>
    </button>
    <use-menu id="use-caret-custom-icon-menu" aria-label="Menu">
      <button role="menuitem">menu item 1</button>
      <button role="menuitem">menu item 2</button>
      <button role="menuitem">menu item 3</button>
    </use-menu>
  `,
};

/**
 * For a caret that isn't just a CSS swap — different markup, an icon font, logic beyond a mask —
 * set the static `UseCaret.customIcon` hook. Every `<use-caret>` in the page picks it up;
 * consumers keep writing the same tag, no new element to register or remember to use. Do this
 * once, as early as possible (an app's entry point, before any triggers connect) —
 * Lit calls `render()` fresh on every update, so an instance only reflects the change once
 * something causes it to re-render, and the hook applies globally for the rest of the page's
 * lifetime, this story included. A bare string, as here, sidesteps any risk of a `TemplateResult`
 * built from a different `lit-html` copy than this component's own — pass a function instead
 * when the icon needs to vary per trigger.
 *
 * ```ts
 * import { UseCaret } from "use-wc";
 *
 * UseCaret.customIcon = "→";
 * ```
 *
 * Excluded from this page's autodocs (`!autodocs`) rather than just relying on the meta-level
 * decorator: the Docs page mounts every story's markup together, in a batch, after all of their
 * `render()` functions have already run — so by the time any `<use-caret>` on the page actually
 * connects and reads the static, this story has already flipped it, and every sibling's caret
 * picks up "→" too, regardless of the decorator resetting it before each story *starts*. Viewed
 * standalone in Canvas, only one story mounts at a time, so the decorator's reset works as
 * intended.
 */
export const GlobalDefaultCaretViaCustomIcon: Story = {
  tags: ["!autodocs"],
  render: () => {
    UseCaret.customIcon = "→";

    return html`
      <button id="use-caret-custom-icon-hook" popovertarget="use-caret-custom-icon-hook-menu">
        <use-caret>Menu</use-caret>
      </button>
      <use-menu id="use-caret-custom-icon-hook-menu" aria-label="Menu">
        <button role="menuitem">menu item 1</button>
      </use-menu>
    `;
  },
};
