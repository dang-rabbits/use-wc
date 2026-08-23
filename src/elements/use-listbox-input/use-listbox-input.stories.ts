import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { UseListboxInput } from "./use-listbox-input";
import { UseOption } from "../use-option/use-option";
import { html } from "lit";

const meta: Meta<UseListboxInput> = {
  component: "use-listbox-input",
  subcomponents: { "use-option": "use-option" },
  title: "Web Components/use-listbox-input",
  tags: ["autodocs", "!dev", "input"],
  // selectedIcon/deselectedIcon are static, page-wide hooks — Storybook doesn't reload the
  // module between sibling stories, so without this reset, viewing
  // GlobalDefaultIndicatorsViaStatics would leave every other story on this page showing its
  // icons too.
  decorators: [
    (story) => {
      UseOption.selectedIcon = undefined;
      UseOption.deselectedIcon = undefined;
      return story();
    },
  ],
  args: {
    placeholder: "Select a number",
    disabled: false,
    multiple: false,
    name: "example",
  },
  render: (args: UseListboxInput) => {
    return html`
      <use-listbox-input
        .name=${args.name}
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        ?multiple=${args.multiple}
      >
        <use-option value="1" id="option-1" selected>One</use-option>
        <use-option value="2" id="option-2">Two</use-option>
      </use-listbox-input>
    `;
  },
};

export default meta;
type Story = StoryObj<UseListboxInput>;

export const Default: Story = {};

export const Theme: Story = {
  ...Default,
  parameters: { ...Default.parameters, allowTheme: true },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Placeholder: Story = {
  args: {
    placeholder: "Select a number",
  },
};

export const DisabledOption: Story = {
  render: () => html`
    <use-listbox-input>
      <use-option value="1" id="option-1" selected>One</use-option>
      <use-option value="2" id="option-2" disabled>Two</use-option>
      <use-option value="3" id="option-3">Three</use-option>
    </use-listbox-input>
  `,
};

export const Multiple: Story = {
  render: () => html`
    <use-listbox-input multiple>
      <use-option value="1" id="option-1" selected>One</use-option>
      <use-option value="2" id="option-2">Two</use-option>
      <use-option value="3" id="option-3">Three</use-option>
    </use-listbox-input>
  `,
};

export const OptionsDivider: Story = {
  render: () => html`
    <use-listbox-input>
      <use-option value="1" id="option-1" selected>One</use-option>
      <use-option value="2" id="option-2">Two</use-option>
      <hr />
      <use-option value="3" id="option-3">Three</use-option>
    </use-listbox-input>
  `,
};

export const ChangeEvent: StoryObj<UseListboxInput> = {
  render: () => {
    function handleChange(e: CustomEvent<{ value: FormData }>) {
      const output = document.getElementById("change-event-output") as HTMLPreElement;
      output.textContent = JSON.stringify(
        (e.detail.value as unknown as FormData).getAll("change-event"),
      );
    }
    return html`
      <use-listbox-input name="change-event" @use-change=${handleChange} multiple>
        <use-option value="1" id="option-1">One</use-option>
        <use-option value="2" id="option-2">Two</use-option>
        <use-option value="3" id="option-3">Three</use-option>
      </use-listbox-input>
      <pre id="change-event-output"></pre>
    `;
  },
};

export const FormSingleValue: Story = {
  render: () => {
    function handleFormSubmit(e: Event) {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const jsonData = JSON.stringify(Object.fromEntries(formData), null, 2);
      const formOutput = document.querySelector("#form-data");
      if (formOutput) {
        formOutput.textContent = jsonData;
      }
    }

    return html`
      <form @submit=${handleFormSubmit}>
        <div>
          <label for="favorite-fruit">Favorite fruit:</label><br />
          <use-listbox-input id="favorite-fruit" name="favorite-fruit">
            <use-option value="apple" id="apple">Apple</use-option>
            <use-option value="banana" id="banana">Banana</use-option>
            <use-option value="cherry" id="cherry">Cherry</use-option>
          </use-listbox-input>
        </div>
        <button>Submit</button>
      </form>
      <hr />
      <h6>Payload</h6>
      <pre id="form-data"></pre>
    `;
  },
};

export const FormMultipleValues: Story = {
  render: () => {
    function handleFormSubmit(e: Event) {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      // @ts-expect-error - https://github.com/microsoft/TypeScript/issues/30584
      const queryString = decodeURIComponent(new URLSearchParams(formData).toString());
      const formOutput = document.querySelector("#form-data-multiple");
      if (formOutput) {
        formOutput.textContent = queryString;
      }
    }

    return html`
      <form @submit=${handleFormSubmit}>
        <div>
          <label for="favorite-fruits">Favorite fruits:</label><br />
          <use-listbox-input id="favorite-fruits" name="favorite-fruits[]" multiple>
            <use-option value="apple" id="apple">Apple</use-option>
            <use-option value="banana" id="banana">Banana</use-option>
            <use-option value="cherry" id="cherry">Cherry</use-option>
          </use-listbox-input>
        </div>
        <button>Submit</button>
      </form>
      <hr />
      <h6>Payload</h6>
      <pre id="form-data-multiple"></pre>
    `;
  },
};

/**
 * Both indicators are independent slots: `selected-indicator` replaces the checkmark, and
 * `deselected-indicator` replaces the (empty) placeholder shown otherwise — filling in the
 * latter is how a consumer renders an empty checkbox instead of just reserved blank space.
 * Either can be left unset to keep the built-in default for that state.
 */
export const CustomIndicatorSlots: Story = {
  render: () => html`
    <use-listbox-input>
      <svg
        slot="trigger-arrow"
        fill="currentColor"
        viewBox="0 0 140 140"
        width="12"
        height="12"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g>
          <path
            d="m121.3,34.6c-1.6-1.6-4.2-1.6-5.8,0l-51,51.1-51.1-51.1c-1.6-1.6-4.2-1.6-5.8,0-1.6,1.6-1.6,4.2 0,5.8l53.9,53.9c0.8,0.8 1.8,1.2 2.9,1.2 1,0 2.1-0.4 2.9-1.2l53.9-53.9c1.7-1.6 1.7-4.2 0.1-5.8z"
          />
        </g>
      </svg>
      <use-option value="1" id="option-1" selected>
        <span slot="selected-indicator">🔥</span>
        <span slot="deselected-indicator">💨</span>
        Fire
      </use-option>
      <use-option value="2" id="option-2">
        <span slot="selected-indicator">🌊</span>
        <span slot="deselected-indicator">💨</span>
        Water
      </use-option>
      <use-option value="3" id="option-3">Earth (built-in indicators)</use-option>
    </use-listbox-input>
  `,
};

/**
 * For an indicator that isn't just a CSS swap — different markup, an icon font, logic beyond a
 * mask — set the static `UseOption.selectedIcon` / `UseOption.deselectedIcon` hooks. Every
 * `<use-option>` in the page picks them up; consumers keep writing the same tag, no new element
 * to register or remember to use. Do this once, as early as possible (an app's entry point,
 * before any options connect) — Lit calls `render()` fresh on every update, so an instance only
 * reflects the change once something causes it to re-render, and the hook applies globally for
 * the rest of the page's lifetime, this story included.
 *
 * ```ts
 * import { UseOption } from "use-wc";
 *
 * UseOption.selectedIcon = "★";
 * UseOption.deselectedIcon = "☆";
 * ```
 *
 * Rendered in its own iframe on the Docs page (`docs.story.inline: false`) rather than just
 * relying on the meta-level decorator: the Docs page otherwise mounts every story's markup
 * together, in a batch, into one shared document — so by the time any `<use-option>` on the page
 * actually connects and reads the static, this story has already flipped it, and every sibling's
 * options pick up the override too, regardless of the decorator resetting it before each story
 * *starts*. An iframed story gets its own document and its own fresh module graph, so its static
 * mutation can't reach the rest of the page. Viewed standalone in Canvas, only one story mounts
 * at a time in the first place, so the decorator's reset works as intended there either way.
 */
export const GlobalDefaultIndicatorsViaStatics: Story = {
  parameters: { docs: { story: { inline: false } } },
  render: () => {
    UseOption.selectedIcon = "★";
    UseOption.deselectedIcon = "☆";

    return html`
      <use-listbox-input>
        <use-option value="1" id="option-1" selected>One</use-option>
        <use-option value="2" id="option-2">Two</use-option>
      </use-listbox-input>
    `;
  },
};

export const CustomStyles: Story = {
  render: () => html`
    <style>
      .custom-use-listbox-input {
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
        letter-spacing: 2px;
      }

      .custom-use-listbox-input use-option {
        border-radius: 2px;
        padding: 4px 8px;
        line-height: 24px;
      }

      .custom-use-listbox-input use-option::part(selected-indicator-default) {
        display: none;
      }

      .custom-use-listbox-input use-option::part(selected-indicator)::before {
        content: "\\1F525";
        margin-inline-end: 8px;
      }

      .custom-use-listbox-input:not(:has(use-option:hover)):focus use-option:state(active),
      .custom-use-listbox-input use-option:not(:state(disabled)):hover {
        background-color: orangered;
        color: blanchedalmond;
      }

      .custom-use-listbox-input::part(listbox):focus-visible {
        outline: 2px dashed currentColor;
        outline-offset: 4px;
        box-shadow: none;
      }
    </style>
    <use-listbox-input class="custom-use-listbox-input">
      <use-option value="1" id="option-1">Overcompensate</use-option>
      <use-option value="2" id="option-2" selected>Routines In The Night</use-option>
      <use-option value="3" id="option-3">Paladin Strait</use-option>
    </use-listbox-input>
  `,
};
