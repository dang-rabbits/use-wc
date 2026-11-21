import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Design System/use-control-set",
  component: "use-control-set",
  tags: ["autodocs", "!dev", "utility"],
  parameters: {
    allowTheme: true,
    docs: {
      description: {
        component: [
          "`use-control-set` groups adjacent controls into one visual unit: touching sides share a single border, only the two outer ends keep their rounded corners, and a hovered or focused child lifts its border above its neighbors. It renders no markup of its own, so any themed control works as a child, buttons and text inputs alike.",
          "",
          "A set holding any button with a shadow (every variant but `clear` and `auxiliary`) casts one shadow from the set itself instead of one per button, tinted by its most prominent button, so the shadows don't overlap at the seams.",
        ].join("\n"),
      },
    },
  },
};
export default meta;

type Story = StoryObj;

/**
 * A text button followed by an icon-only trigger. The trigger's empty `use-caret` squares itself automatically and opens a `use-menu` of alternate actions. The set casts one shadow for both buttons.
 */
export const SplitButton: Story = {
  name: "Split button",
  render: () => html`
    <use-control-set>
      <button type="button" class="primary">Save</button>
      <button
        type="button"
        class="primary"
        id="use-control-set-split-button-trigger"
        popovertarget="use-control-set-split-button-menu"
        aria-label="More save options"
      >
        <use-caret></use-caret>
      </button>
    </use-control-set>
    <use-menu id="use-control-set-split-button-menu" aria-label="More save options">
      <button role="menuitem">Save as&hellip;</button>
      <button role="menuitem">Save a copy</button>
    </use-menu>
  `,
};

/**
 * A `danger` split button takes its shared shadow's tint from the danger button.
 */
export const DangerSplitButton: Story = {
  name: "Danger split button",
  render: () => html`
    <use-control-set>
      <button type="button" class="danger">Delete</button>
      <button
        type="button"
        class="danger"
        popovertarget="use-control-set-danger-split-button-menu"
        aria-label="More delete options"
      >
        <use-caret></use-caret>
      </button>
    </use-control-set>
    <use-menu id="use-control-set-danger-split-button-menu" aria-label="More delete options">
      <button role="menuitem">Delete permanently</button>
    </use-menu>
  `,
};

/**
 * A set groups a button with a text input just as readily as with another button.
 */
export const SearchBox: Story = {
  name: "Search box",
  render: () => html`
    <use-control-set>
      <input type="search" placeholder="Search" aria-label="Search" />
      <button type="submit">Go</button>
    </use-control-set>
  `,
};

/**
 * Toggle buttons in a set make a formatting toolbar. `aria-pressed="true"` holds a format that's on in its pressed look, and `aria-pressed="mixed"` reads the same way for a selection it only partly covers.
 */
export const Toolbar: Story = {
  render: () => html`
    <div role="toolbar" aria-label="Text formatting">
      <use-control-set>
        <button type="button" aria-label="Bold" aria-pressed="true"><b class="icon">B</b></button>
        <button type="button" aria-label="Italic" aria-pressed="mixed">
          <i class="icon">I</i>
        </button>
        <button type="button" aria-label="Underline" aria-pressed="false">
          <u class="icon">U</u>
        </button>
      </use-control-set>
    </div>
  `,
};

/**
 * Pagination doesn't need its own class: wrap `a.appearance-button` links in a set inside a labelled `nav`. `aria-current="page"` holds the current page in its pressed look, and a plain `span` renders as a static cell for the gap between page ranges.
 */
export const Pagination: Story = {
  render: () => html`
    <nav aria-label="Pagination">
      <use-control-set>
        <a class="appearance-button" href="#">Previous</a>
        <a class="appearance-button" href="#">1</a>
        <a class="appearance-button" href="#" aria-current="page">2</a>
        <a class="appearance-button" href="#">3</a>
        <span aria-hidden="true">&hellip;</span>
        <a class="appearance-button" href="#">10</a>
        <a class="appearance-button" href="#">Next</a>
      </use-control-set>
    </nav>
  `,
};
