import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const stack = "display: flex; flex-direction: column; gap: 1rem; align-items: start;";
const row = "display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;";

const meta: Meta = {
  title: "Design System/Native Elements",
  tags: ["autodocs", "!dev", "utility"],
  parameters: {
    allowTheme: true,
    docs: {
      description: {
        component: [
          "The design system styles native HTML elements directly, so a plain `<button>`, `<input>` or `<a>` picks up the theme with no extra markup. Classes like `primary`, `danger`, `auxiliary` and `small` modify an element's base styles.",
          "",
          'To opt a single element out, add `class="appearance-native"`; to opt a whole subtree out, wrap it in `<use-theme-escape>`.',
        ].join("\n"),
      },
    },
  },
};
export default meta;

type Story = StoryObj;

/**
 * Text inputs cover the placeholder, read-only and disabled states. A disabled `fieldset` disables every control inside it.
 */
export const TextInput: Story = {
  name: "Text input",
  render: () => html`
    <div style=${stack}>
      <input type="text" placeholder="Enter your name" aria-label="Name" />
      <input type="text" placeholder="Read only with placeholder" aria-label="Read only" readonly />
      <input type="text" value="Read only with value" aria-label="Read only with value" readonly />
      <input type="text" value="Disabled with value" aria-label="Disabled" disabled />
      <fieldset disabled>
        <legend>Disabled fieldset</legend>
        <input type="text" placeholder="Enter your name" aria-label="Name" />
        <input type="email" placeholder="Enter your email" aria-label="Email" />
        <button type="button">Submit</button>
      </fieldset>
    </div>
  `,
};

/**
 * `appearance-native` escapes a single element from the theme; `use-theme-escape` escapes everything inside it.
 */
export const Unstyled: Story = {
  render: () => html`
    <div style=${stack}>
      <input
        type="text"
        placeholder="appearance-native"
        aria-label="Native"
        class="appearance-native"
      />
      <use-theme-escape>
        <input
          type="text"
          placeholder="Inside use-theme-escape"
          aria-label="Escaped"
          class="primary auxiliary"
        />
      </use-theme-escape>
    </div>
  `,
};

/**
 * The file input's button takes the same variant classes as a `button`.
 */
export const File: Story = {
  render: () => html`
    <div style=${stack}>
      <input type="file" aria-label="Base" />
      <input type="file" aria-label="Auxiliary" class="auxiliary" />
      <input type="file" aria-label="Primary" class="primary" />
      <input type="file" aria-label="Danger" class="danger" />
      <input type="file" aria-label="Clear" class="clear" />
      <input type="file" aria-label="Disabled" disabled />
      <input type="file" aria-label="Native" class="appearance-native" />
    </div>
  `,
};

export const DateAndTime: Story = {
  name: "Date and time",
  render: () => html`
    <div style=${stack}>
      <input type="date" aria-label="Date" />
      <input type="time" aria-label="Time" />
      <input type="datetime-local" aria-label="Date and time" />
      <input type="month" aria-label="Month" />
      <input type="week" aria-label="Week" />
    </div>
  `,
};

export const Email: Story = {
  render: () => html`
    <div style=${stack}>
      <input type="email" placeholder="Enter your email" aria-label="Email" />
      <input
        type="email"
        placeholder="Read only with placeholder"
        aria-label="Read only"
        readonly
      />
      <input type="email" value="Read only with value" aria-label="Read only with value" readonly />
      <input type="email" value="Disabled with value" aria-label="Disabled" disabled />
    </div>
  `,
};

export const Textarea: Story = {
  render: () => html`
    <div style=${stack}>
      <textarea placeholder="Enter your message" aria-label="Message"></textarea>
      <textarea placeholder="Read only with placeholder" aria-label="Read only" readonly></textarea>
      <textarea placeholder="Disabled" aria-label="Disabled" disabled></textarea>
    </div>
  `,
};

export const Select: Story = {
  render: () => html`
    <div style=${stack}>
      <select aria-label="Options">
        <option value="1">Option 1</option>
        <option value="2">Option 2</option>
        <option value="3">Option 3</option>
      </select>
      <select aria-label="Produce">
        <optgroup label="Fruit">
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="cherry" disabled>Cherry</option>
        </optgroup>
        <optgroup label="Vegetables">
          <option value="carrot">Carrot</option>
          <option value="pea">Pea</option>
        </optgroup>
      </select>
      <select aria-label="Native" class="appearance-native">
        <option value="1">Native select</option>
      </select>
    </div>
  `,
};

export const Range: Story = {
  render: () => html`
    <div style=${stack}>
      <input type="range" aria-label="Range" />
      <input type="range" aria-label="Disabled" disabled />
    </div>
  `,
};

/**
 * Wrap a checkbox, its label and an optional description in `use-selector` to lay them out together.
 */
export const Checkbox: Story = {
  render: () => html`
    <div style=${stack}>
      <div style=${row}>
        <input type="checkbox" aria-label="Unchecked" />
        <input type="checkbox" aria-label="Disabled" disabled />
        <input type="checkbox" aria-label="Checked" checked />
        <input type="checkbox" aria-label="Checked and disabled" checked disabled />
      </div>
      <use-selector>
        <input type="checkbox" id="native-elements-checkbox-labeled" />
        <label for="native-elements-checkbox-labeled">Labeled</label>
        <p>This is a checkbox label description</p>
      </use-selector>
      <div>
        <input type="checkbox" id="native-elements-checkbox-disabled" disabled />
        <label for="native-elements-checkbox-disabled">Labeled disabled</label>
      </div>
      <div>
        <input type="checkbox" id="native-elements-checkbox-checked" checked />
        <label for="native-elements-checkbox-checked">Labeled checked</label>
      </div>
      <div>
        <input type="checkbox" id="native-elements-checkbox-checked-disabled" checked disabled />
        <label for="native-elements-checkbox-checked-disabled">Labeled checked disabled</label>
      </div>
      <div style="font-size: 2rem">
        <input type="checkbox" id="native-elements-checkbox-large" />
        <label for="native-elements-checkbox-large">Scales with font size</label>
      </div>
    </div>
  `,
};

export const Radio: Story = {
  render: () => html`
    <div style=${stack}>
      <div style=${row}>
        <input type="radio" aria-label="Unchecked" />
        <input type="radio" aria-label="Disabled" disabled />
        <input type="radio" aria-label="Checked" checked />
        <input type="radio" aria-label="Checked and disabled" checked disabled />
      </div>
      <use-selector>
        <input type="radio" id="native-elements-radio-1" name="native-elements-radio" value="1" />
        <label for="native-elements-radio-1">Radio 1</label>
        <p>This is a radio label description</p>
      </use-selector>
      <use-selector>
        <input type="radio" id="native-elements-radio-2" name="native-elements-radio" value="2" />
        <label for="native-elements-radio-2">Radio 2</label>
        <p>This is a radio label description</p>
      </use-selector>
    </div>
  `,
};

/**
 * Every variant comes in an `auxiliary` and a disabled form; `appearance-native` opts out of the theme.
 */
export const Button: Story = {
  render: () => html`
    <div style=${stack}>
      <div style=${row}>
        <button type="button">Base</button>
        <button type="button" class="auxiliary">Auxiliary</button>
        <button type="button" disabled>Disabled</button>
      </div>
      <div style=${row}>
        <button type="button" class="primary">Primary</button>
        <button type="button" class="primary auxiliary">Primary auxiliary</button>
        <button type="button" class="primary" disabled>Primary disabled</button>
      </div>
      <div style=${row}>
        <button type="button" class="danger">Danger</button>
        <button type="button" class="danger auxiliary">Danger auxiliary</button>
        <button type="button" class="danger" disabled>Danger disabled</button>
      </div>
      <div style=${row}>
        <button type="button" class="clear">Clear</button>
        <button type="button" class="clear auxiliary">Clear auxiliary</button>
        <button type="button" class="clear" disabled>Clear disabled</button>
      </div>
      <div style=${row}>
        <button type="button" class="appearance-native">Native</button>
        <button type="button" class="clear appearance-a">Button as link</button>
      </div>
    </div>
  `,
};

export const ButtonSizes: Story = {
  name: "Button sizes",
  render: () => html`
    <div style=${row}>
      <button type="button" class="extra-small">Extra small</button>
      <button type="button" class="small">Small</button>
      <button type="button">Base</button>
      <button type="button" class="large">Large</button>
      <button type="button" class="extra-large">Extra large</button>
    </div>
  `,
};

/**
 * `aria-pressed="true"` holds a toggle button in its variant's pressed look, and `aria-pressed="mixed"` reads the same way for a toggle that only partly applies. Each variant's `--usewc-color-button-{variant}-{text,background,border}-pressed` tokens default to its active look, and theme a held toggle apart from a click.
 */
export const ButtonPressed: Story = {
  name: "Button pressed",
  render: () => html`
    <div style=${row}>
      <button type="button" aria-pressed="false">Off</button>
      <button type="button" aria-pressed="true">On</button>
      <button type="button" aria-pressed="mixed">Mixed</button>
      <button type="button" class="primary" aria-pressed="true">Primary on</button>
      <button type="button" class="clear" aria-pressed="true">Clear on</button>
    </div>
  `,
};

/**
 * A button's fill can be any `background` value, including a gradient, by overriding its color tokens.
 */
export const ButtonCustomBackground: Story = {
  name: "Button custom background",
  render: () => html`
    <button
      type="button"
      style="
        --usewc-color-button-base-background-static: linear-gradient(
          to bottom,
          var(--usewc-color-indigo-500),
          var(--usewc-color-blue-500)
        );
        --usewc-color-button-base-background-hover: linear-gradient(
          to bottom,
          var(--usewc-color-indigo-600),
          var(--usewc-color-blue-600)
        );
        --usewc-color-button-base-background-active: linear-gradient(
          to bottom,
          var(--usewc-color-indigo-700),
          var(--usewc-color-blue-700)
        );
        --usewc-color-button-base-text-static: var(--usewc-color-white);
        --usewc-color-button-base-text-hover: var(--usewc-color-white);
        --usewc-color-button-base-text-active: var(--usewc-color-white);
        --usewc-color-button-base-border-static: var(--usewc-color-transparent);
        --usewc-color-button-base-border-hover: var(--usewc-color-blue-700);
        --usewc-color-button-base-border-active: var(--usewc-color-blue-800);
      "
    >
      Gradient button
    </button>
  `,
};

/**
 * `use-control-set` merges the shared border between adjacent controls. The trigger button's empty `use-caret` squares itself automatically and opens a `use-menu` of alternate actions.
 */
export const SplitButton: Story = {
  name: "Split button",
  render: () => html`
    <use-control-set>
      <button type="button" class="primary">Save</button>
      <button
        type="button"
        class="primary"
        id="native-elements-split-button-trigger"
        popovertarget="native-elements-split-button-menu"
        aria-label="More save options"
      >
        <use-caret></use-caret>
      </button>
    </use-control-set>
    <use-menu id="native-elements-split-button-menu" aria-label="More save options">
      <button role="menuitem">Save as&hellip;</button>
      <button role="menuitem">Save a copy</button>
    </use-menu>
  `,
};

/**
 * `use-control-set` groups a button with a text input just as readily as with another button.
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
 * Toggle buttons in a `use-control-set` make a formatting toolbar. `aria-pressed="true"` holds a format that's on in its pressed look, and `aria-pressed="mixed"` reads the same way for a selection it only partly covers.
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
 * Pagination doesn't need its own class: wrap `a.appearance-button` links in a `use-control-set` inside a labelled `nav`. `aria-current="page"` holds the current page in its pressed look, and a plain `span` renders as a static cell for the gap between page ranges.
 *
 * For separated buttons instead of one fused strip, set a positive `--usewc-layout-control-set-gap` and a matching `--usewc-effect-control-set-border-radius-sequential` on the `nav`.
 */
export const Pagination: Story = {
  render: () => html`
    <div style=${stack}>
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
      <nav
        aria-label="Pagination, separated"
        style="
          --usewc-layout-control-set-gap: var(--usewc-space-4);
          --usewc-effect-control-set-border-radius-sequential: var(--usewc-effect-button-border-radius);
        "
      >
        <use-control-set>
          <a class="appearance-button" href="#">Previous</a>
          <a class="appearance-button" href="#">1</a>
          <a class="appearance-button" href="#" aria-current="page">2</a>
          <a class="appearance-button" href="#">3</a>
          <a class="appearance-button" href="#">Next</a>
        </use-control-set>
      </nav>
    </div>
  `,
};

/**
 * `class="appearance-button"` on the `summary` renders the disclosure trigger as a button.
 */
export const Details: Story = {
  render: () => html`
    <div style=${stack}>
      <details>
        <summary>Default</summary>
        <p>This is a details content</p>
      </details>
      <details>
        <summary class="appearance-button">As button</summary>
        <p>This is a details content</p>
      </details>
    </div>
  `,
};

/**
 * Body text keeps its underline so a link stays distinguishable by more than color. Underlines drop only inside navigation landmarks and widget roles (`nav`, `header`, `footer`, `[role="navigation"]`, `[role="menubar"]`, `[role="tablist"]`, `[role="toolbar"]`); override `--usewc-effect-link-chrome-text-decoration` on a subtree to bring them back there.
 */
export const Link: Story = {
  render: () => html`
    <div style=${stack}>
      <p>
        Body text keeps its underline, like this <a href="#">inline link</a>, so it stays
        distinguishable by more than color.
      </p>
      <div style=${row}>
        <a href="#" class="appearance-button">Base button</a>
        <a href="#" class="appearance-button primary">Primary button</a>
        <a href="#" class="appearance-button danger">Danger button</a>
        <a href="#" class="appearance-button clear">Clear button</a>
        <a href="#" class="appearance-native">Native</a>
      </div>
      <nav aria-label="Example navigation">
        <ul>
          <li><a href="#">Overview</a></li>
          <li><a href="#">Settings</a></li>
          <li><a href="#">Help</a></li>
        </ul>
      </nav>
      <div role="tablist" aria-label="Example tabs">
        <a href="#" role="tab">One</a>
        <a href="#" role="tab">Two</a>
        <a href="#" role="tab">Three</a>
      </div>
    </div>
  `,
};

/**
 * `nav.breadcrumb` lays out an `ol` of links as a wrapping trail. The separator comes from `--usewc-effect-breadcrumb-separator` (default `"/"`) and is hidden from assistive tech; `aria-current="page"` marks the last link as the current page and renders it in plain document text.
 */
export const Breadcrumb: Story = {
  render: () => html`
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href="#">Home</a></li>
        <li><a href="#">Projects</a></li>
        <li><a href="#" aria-current="page">Website redesign</a></li>
      </ol>
    </nav>
  `,
};

/**
 * `nav.sidebar` adds hover background, rounded corners, and its own padding to each `a`. It doesn't require `use-pattern`, so a plain text link works the same as one with an icon, title and badge row inside it.
 *
 * With `use-pattern.entry.compact`, the row layout, avatar rail and trailing badge alignment come from the pattern unchanged: `.compact` steps `.entry`'s density down for a nav-sized row, and `.flush` drops `use-pattern`'s own outer inset so it doesn't double up with the anchor's padding.
 */
export const Sidebar: Story = {
  render: () => html`
    <div style="display: flex; flex-wrap: wrap; gap: 2rem; align-items: start;">
      <nav class="sidebar" aria-label="Sidebar with use-pattern" style="inline-size: 16rem">
        <a href="#">
          <use-pattern class="entry compact flush">
            <figure><use-avatar name="Dashboard"></use-avatar></figure>
            <header>
              <hgroup>
                <h4>Dashboard</h4>
                <p>Overview</p>
              </hgroup>
              <use-badge>3</use-badge>
            </header>
          </use-pattern>
        </a>
        <a href="#">
          <use-pattern class="entry compact flush">
            <figure><use-avatar name="Settings"></use-avatar></figure>
            <header>
              <hgroup>
                <h4>Settings</h4>
                <p>Account, billing</p>
              </hgroup>
            </header>
          </use-pattern>
        </a>
      </nav>
      <nav class="sidebar" aria-label="Sidebar with plain links" style="inline-size: 16rem">
        <a href="#">Dashboard</a>
        <a href="#">Settings</a>
        <a href="#">Help</a>
      </nav>
    </div>
  `,
};

/**
 * A `details` inside `nav.sidebar` is a collapsible group: its `summary` renders as a sidebar row, and everything after it hangs off a guide line with its text lined up under the summary's. When the summary starts with an icon, the caret replaces it on hover or keyboard focus. Headings that are direct children of the nav render as group labels. `aria-current="page"` highlights the current link and colors the summary of every group containing it; CSS can't open a closed group, so set `open` on those yourself.
 *
 * Wrapping rows in `ul`/`li` is recommended so screen readers announce the list and its item count; `nav.sidebar` strips list bullets and indentation, so bare links render the same way.
 */
export const SidebarNested: Story = {
  name: "Sidebar, nested",
  render: () => html`
    <nav class="sidebar" aria-label="Workspace" style="max-inline-size: 16rem">
      <h2>Workspace</h2>
      <ul>
        <li>
          <a href="#"
            ><svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
            </svg>
            Dashboard</a
          >
        </li>
        <li>
          <details open>
            <summary>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                aria-hidden="true"
              >
                <path
                  d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
                />
              </svg>
              Projects
            </summary>
            <ul>
              <li><a href="#">Website redesign</a></li>
              <li><a href="#" aria-current="page">Mobile app</a></li>
              <li>
                <details>
                  <summary>Archived</summary>
                  <ul>
                    <li><a href="#">Launch campaign</a></li>
                    <li><a href="#">Brand refresh</a></li>
                  </ul>
                </details>
              </li>
            </ul>
          </details>
        </li>
      </ul>
      <h2>Account</h2>
      <ul>
        <li>
          <details>
            <summary>Settings</summary>
            <ul>
              <li><a href="#">Profile</a></li>
              <li><a href="#">Billing</a></li>
            </ul>
          </details>
        </li>
        <li><a href="#">Help</a></li>
      </ul>
    </nav>
  `,
};
