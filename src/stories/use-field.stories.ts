import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const stack = "display: flex; flex-direction: column; gap: 1rem;";

const meta: Meta = {
  title: "Design System/use-field",
  tags: ["autodocs", "!dev", "utility"],
  parameters: {
    allowTheme: true,
    docs: {
      description: {
        component:
          '`use-field` pairs a `label`, a form control, and an optional helper or error `p` into one themed layout: label above the control, helper text below, switching to the invalid color automatically once the control is `:user-invalid` or carries `aria-invalid="true"`. Like `use-selector`, it is styled by tag name but is **not** a registered custom element, so it needs the design-system stylesheet loaded. It is a pure CSS layout hook, chosen over a class to avoid colliding with an author\'s own field-wrapper class names.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

/**
 * A required field shows its error state once the value is removed.
 */
export const Text: Story = {
  render: () => html`
    <div style=${stack}>
      <use-field>
        <label for="use-field-text">Text field</label>
        <input type="text" id="use-field-text" placeholder="Enter your name" />
        <p>This is a text field description</p>
      </use-field>
      <use-field>
        <label for="use-field-text-required">Required</label>
        <input type="text" id="use-field-text-required" placeholder="Enter your name" required />
        <p>* Required | Shows error state when value is removed</p>
      </use-field>
    </div>
  `,
};

export const File: Story = {
  render: () => html`
    <use-field>
      <label for="use-field-file">File field</label>
      <input type="file" id="use-field-file" />
      <p>This is a file field description</p>
    </use-field>
  `,
};

/**
 * The value here is not a valid email address, so the field shows its error state once it has been edited.
 */
export const Email: Story = {
  render: () => html`
    <use-field>
      <label for="use-field-email">Email field</label>
      <input
        type="email"
        id="use-field-email"
        placeholder="Enter your email"
        value="invalid@invalid@invalid.com"
      />
      <p>This is an email field description</p>
    </use-field>
  `,
};

export const Textarea: Story = {
  render: () => html`
    <use-field>
      <label for="use-field-textarea">Textarea field</label>
      <textarea id="use-field-textarea" placeholder="Enter your message"></textarea>
      <p>This is a textarea field description</p>
    </use-field>
  `,
};

/**
 * A `datalist` adds tick marks to a range; `appearance-native` opts the range out of the theme.
 */
export const Range: Story = {
  render: () => html`
    <div style=${stack}>
      <use-field>
        <label for="use-field-range">Range field</label>
        <input type="range" id="use-field-range" />
        <p>This is a range field description</p>
      </use-field>
      <use-field>
        <label for="use-field-range-ticks">Range with ticks</label>
        <input type="range" id="use-field-range-ticks" list="use-field-range-ticks-options" />
        <datalist id="use-field-range-ticks-options">
          <option value="0">Option 1</option>
          <option value="50">Option 2</option>
          <option value="100">Option 3</option>
        </datalist>
      </use-field>
      <use-field>
        <label for="use-field-range-native">Native</label>
        <input type="range" id="use-field-range-native" class="appearance-native" />
      </use-field>
    </div>
  `,
};

/**
 * A `use-field` can hold a `class="appearance-input"` group instead of a bare control, for a prefix and suffix layout.
 */
export const AsInput: Story = {
  name: "As input",
  render: () => html`
    <div style=${stack}>
      <use-field>
        <label for="use-field-as-input">With text</label>
        <div class="appearance-input">
          <span>Prefix</span>
          <input id="use-field-as-input" placeholder="embedded input" />
          <span>Suffix</span>
        </div>
      </use-field>
      <use-field>
        <label for="use-field-as-input-disabled">Disabled</label>
        <div class="appearance-input">
          <span>Prefix</span>
          <input id="use-field-as-input-disabled" placeholder="embedded input" disabled />
          <span>Suffix</span>
        </div>
      </use-field>
      <use-field>
        <label for="use-field-as-input-buttons">With buttons</label>
        <div class="appearance-input">
          <button type="button" class="small">Button</button>
          <input id="use-field-as-input-buttons" placeholder="embedded input" />
          <button type="button" class="small">Button</button>
        </div>
      </use-field>
    </div>
  `,
};
