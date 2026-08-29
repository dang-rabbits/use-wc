// Storybook stories for use-grid
import { html } from "lit";
import type { Meta, StoryObj } from "@storybook/web-components-vite";
import "./use-grid";
import "./use-gridhead";
import "./use-gridbody";
import "./use-gridrow";
import "./use-gridcell";
import "../use-intl-number/use-intl-number";
import { UseGrid } from "./use-grid";

const meta: Meta<UseGrid> = {
  title: "Web Components/use-grid",
  component: "use-grid",
  tags: ["autodocs", "!dev", "input", "utility"],
  argTypes: {
    selectmode: {
      control: "inline-radio",
      options: ["none", "single", "multiple"],
      description: "How many rows can be selected.",
    },
    selectwith: {
      control: "inline-radio",
      options: ["row", "control", "row control", "none"],
      description:
        "How selection is triggered: `row` click, an injected checkbox/radio `control` column, both, or `none` (keyboard/programmatic only).",
    },
  },
};
export default meta;

type Story = StoryObj<UseGrid>;

export const Default: Story = {
  tags: ["!autodocs", "!dev"],
  render: (args) => html`
    <use-grid
      ?disabled=${args.disabled}
      .name=${args.name}
      .role=${args.role}
      .selectmode=${args.selectmode}
      .selectwith=${args.selectwith ?? "row"}
    >
      <use-gridhead>
        <use-gridrow>
          <use-gridcell>Header 1</use-gridcell>
          <use-gridcell>Header 2</use-gridcell>
        </use-gridrow>
      </use-gridhead>
      <use-gridbody>
        <use-gridrow>
          <use-gridcell>Row 1, Cell 1</use-gridcell>
          <use-gridcell>Row 1, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 2, Cell 1</use-gridcell>
          <use-gridcell>Row 2, Cell 2</use-gridcell>
        </use-gridrow>
      </use-gridbody>
    </use-grid>
  `,
};

const themeGridContent = html`
  <use-gridhead>
    <use-gridrow>
      <use-gridcell>Product</use-gridcell>
      <use-gridcell>Status</use-gridcell>
      <use-gridcell>Price</use-gridcell>
    </use-gridrow>
  </use-gridhead>
  <use-gridbody>
    <use-gridrow value="keyboard">
      <use-gridcell>Keyboard</use-gridcell>
      <use-gridcell>In stock</use-gridcell>
      <use-gridcell>
        <use-intl-number
          numberstyle="currency"
          currency="USD"
          value="1234.5"
          lang="en-US"
        ></use-intl-number>
      </use-gridcell>
    </use-gridrow>
    <use-gridrow value="mouse" selected>
      <use-gridcell>Mouse</use-gridcell>
      <use-gridcell>In stock</use-gridcell>
      <use-gridcell>
        <use-intl-number
          numberstyle="currency"
          currency="USD"
          value="76.2"
          lang="en-US"
        ></use-intl-number>
      </use-gridcell>
    </use-gridrow>
    <use-gridrow value="monitor" disabled>
      <use-gridcell>Monitor</use-gridcell>
      <use-gridcell>Backordered</use-gridcell>
      <use-gridcell>
        <use-intl-number
          numberstyle="currency"
          currency="USD"
          value="429"
          lang="en-US"
        ></use-intl-number>
      </use-gridcell>
    </use-gridrow>
  </use-gridbody>
`;

// Each chip is a label cell plus an `action`-mode cell holding a small `.clear` themed button
// (the quiet, borderless variant) as the remove control.
const chipRow = (label: string) => html`
  <use-gridrow>
    <use-gridcell>${label}</use-gridcell>
    <use-gridcell mode="action">
      <button type="button" class="clear small" aria-label=${`Remove ${label}`}>&times;</button>
    </use-gridcell>
  </use-gridrow>
`;

export const Theme: Story = {
  render: () => html`
    <style>
      /* .list only supplies the row chrome (padding, hover, selected marker); the row's internal
         layout is the author's, the same as the MasterDetail story. */
      .theme-list use-gridrow {
        display: grid;
        grid-template:
          "name when"
          "note note" / 1fr auto;
        gap: 0.1rem 1rem;
        align-items: baseline;
      }
      .theme-list .name {
        grid-area: name;
        font-weight: 600;
      }
      .theme-list .when {
        grid-area: when;
        color: gray;
        font-size: 0.85em;
      }
      .theme-list .note {
        grid-area: note;
        color: gray;
      }
    </style>
    <div style="display: grid; gap: 1.5rem">
      <use-grid selectmode="single">${themeGridContent}</use-grid>
      <use-grid class="compact" selectmode="single">${themeGridContent}</use-grid>
      <use-grid
        aria-label="Products, checkbox selection"
        selectmode="multiple"
        selectwith="control"
      >
        ${themeGridContent}
      </use-grid>

      <use-grid
        aria-label="Products, row and checkbox selection"
        selectmode="multiple"
        selectwith="row control"
      >
        ${themeGridContent}
      </use-grid>

      <use-grid class="chips" aria-label="Active filters">
        <use-gridbody>
          ${["In stock", "Under $100", "Peripherals", "Free shipping"].map(chipRow)}
        </use-gridbody>
      </use-grid>

      <use-grid class="list theme-list" selectmode="single" aria-label="Messages">
        <use-gridbody>
          <use-gridrow value="gnomes" selected>
            <use-gridcell class="name">RE: Garden gnome limit</use-gridcell>
            <use-gridcell class="when">Oct 1</use-gridcell>
            <use-gridcell class="note">
              HOA rules cap a publicly visible garden at 113 garden gnomes.
            </use-gridcell>
          </use-gridrow>
          <use-gridrow value="fence">
            <use-gridcell class="name">Fence height variance</use-gridcell>
            <use-gridcell class="when">Sep 28</use-gridcell>
            <use-gridcell class="note">The board approved the 7ft request, 4 to 1.</use-gridcell>
          </use-gridrow>
        </use-gridbody>
      </use-grid>
    </div>
  `,
  parameters: { allowTheme: true },
};

/**
 * `selectmode="multiple"` with `selectwith="control"` makes `use-grid` inject a leading checkbox
 * column plus a header "select all" (with an indeterminate state) — no hand-placed inputs, no
 * select-all JS. Clicking a row does nothing; only the checkboxes toggle selection. Give the grid
 * a `name` and it serializes the checked rows' `value`s into the enclosing form.
 */
export const CheckboxControlSelection: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`selectmode="multiple" selectwith="control"` — the grid owns a checkbox column and its header select-all. The `name` attribute serializes the checked rows into the form on submit.',
      },
    },
  },
  render: () => {
    function handleSubmit(event: Event) {
      event.preventDefault();
      const formData = new FormData(event.target as HTMLFormElement);
      const output = document.querySelector("#checkbox-selection-output");
      if (output) {
        output.textContent = formData.getAll("products[]").join(", ") || "(none)";
      }
    }

    const row = (value: string, name: string, stock: string) => html`
      <use-gridrow value=${value}>
        <use-gridcell>${name}</use-gridcell>
        <use-gridcell>${stock}</use-gridcell>
      </use-gridrow>
    `;

    return html`
      <form @submit=${handleSubmit}>
        <use-grid
          aria-label="Products"
          name="products[]"
          selectmode="multiple"
          selectwith="control"
        >
          <use-gridhead>
            <use-gridrow>
              <use-gridcell>Product</use-gridcell>
              <use-gridcell>Availability</use-gridcell>
            </use-gridrow>
          </use-gridhead>
          <use-gridbody>
            ${row("keyboard", "Keyboard", "In stock")} ${row("mouse", "Mouse", "In stock")}
            ${row("monitor", "Monitor", "Backordered")}
          </use-gridbody>
        </use-grid>
        <button type="submit">Submit</button>
        <p>Selected: <span id="checkbox-selection-output">(none)</span></p>
      </form>
    `;
  },
};

/**
 * Add the `row` token — `selectwith="row control"` — and a click anywhere in the row toggles its
 * checkbox too. Clicks that land on a control inside the row (a button in a `mode="widget"` cell,
 * a link) are left alone, so row actions keep working.
 */
export const RowClickSelection: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`selectwith="row control"` — the checkbox column is present *and* clicking the row body toggles it. The click guard skips buttons, links, and other in-row controls.',
      },
    },
  },
  render: () => html`
    <use-grid aria-label="Team" selectmode="multiple" selectwith="row control">
      <use-gridhead>
        <use-gridrow>
          <use-gridcell>Name</use-gridcell>
          <use-gridcell>Actions</use-gridcell>
        </use-gridrow>
      </use-gridhead>
      <use-gridbody>
        <use-gridrow value="alice">
          <use-gridcell>Alice</use-gridcell>
          <use-gridcell mode="widget">
            <button type="button">Edit</button>
            <button type="button">Remove</button>
          </use-gridcell>
        </use-gridrow>
        <use-gridrow value="bob">
          <use-gridcell>Bob</use-gridcell>
          <use-gridcell mode="widget">
            <button type="button">Edit</button>
            <button type="button">Remove</button>
          </use-gridcell>
        </use-gridrow>
      </use-gridbody>
    </use-grid>
  `,
};

/**
 * `selectmode="single"` with `selectwith="control"` injects a radio column instead; the header
 * selection cell is an empty spacer (there is no "select all" for single selection).
 */
export const RadioRowSelection: Story = {
  render: () => html`
    <use-grid aria-label="Plan" name="plan" selectmode="single" selectwith="row control">
      <use-gridhead>
        <use-gridrow>
          <use-gridcell>Plan</use-gridcell>
          <use-gridcell>Price</use-gridcell>
        </use-gridrow>
      </use-gridhead>
      <use-gridbody>
        <use-gridrow value="basic">
          <use-gridcell>Basic</use-gridcell>
          <use-gridcell>$0</use-gridcell>
        </use-gridrow>
        <use-gridrow value="pro" selected>
          <use-gridcell>Pro</use-gridcell>
          <use-gridcell>$12</use-gridcell>
        </use-gridrow>
        <use-gridrow value="team">
          <use-gridcell>Team</use-gridcell>
          <use-gridcell>$40</use-gridcell>
        </use-gridrow>
      </use-gridbody>
    </use-grid>
  `,
};

export const SingleSelect: Story = {
  render: () => html`
    <use-grid selectmode="single">
      <use-gridhead>
        <use-gridrow>
          <use-gridcell>Header 1</use-gridcell>
          <use-gridcell>Header 2</use-gridcell>
        </use-gridrow>
      </use-gridhead>
      <use-gridbody>
        <use-gridrow value="1">
          <use-gridcell>Row 1, Cell 1</use-gridcell>
          <use-gridcell>Row 1, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow value="2">
          <use-gridcell>Row 2, Cell 1</use-gridcell>
          <use-gridcell>Row 2, Cell 2</use-gridcell>
        </use-gridrow>
      </use-gridbody>
    </use-grid>
  `,
};

export const MultipleSelect: Story = {
  render: () => html`
    <use-grid selectmode="multiple">
      <use-gridhead>
        <use-gridrow>
          <use-gridcell>Header 1</use-gridcell>
          <use-gridcell>Header 2</use-gridcell>
        </use-gridrow>
      </use-gridhead>
      <use-gridbody>
        <use-gridrow value="1">
          <use-gridcell>Row 1, Cell 1</use-gridcell>
          <use-gridcell>Row 1, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow value="2">
          <use-gridcell>Row 2, Cell 1</use-gridcell>
          <use-gridcell>Row 2, Cell 2</use-gridcell>
        </use-gridrow>
      </use-gridbody>
    </use-grid>
  `,
};

export const DisabledRow: Story = {
  render: () => html`
    <use-grid selectmode="multiple">
      <use-gridhead>
        <use-gridrow>
          <use-gridcell>Header 1</use-gridcell>
          <use-gridcell>Header 2</use-gridcell>
        </use-gridrow>
      </use-gridhead>
      <use-gridbody>
        <use-gridrow value="1">
          <use-gridcell>Row 1, Cell 1</use-gridcell>
          <use-gridcell>Row 1, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow value="2" disabled>
          <use-gridcell>Row 2, Cell 1</use-gridcell>
          <use-gridcell>Row 2, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow value="3">
          <use-gridcell>Row 3, Cell 1</use-gridcell>
          <use-gridcell>Row 3, Cell 2</use-gridcell>
        </use-gridrow>
      </use-gridbody>
    </use-grid>
  `,
};

export const CellWithControls: Story = {
  render: () => html`
    <use-grid selectmode="multiple">
      <use-gridhead>
        <use-gridrow>
          <use-gridcell>Item</use-gridcell>
          <use-gridcell>Actions</use-gridcell>
        </use-gridrow>
      </use-gridhead>
      <use-gridbody>
        <use-gridrow value="123">
          <use-gridcell>John Doe</use-gridcell>
          <use-gridcell mode="widget">
            <button type="button">Edit</button>
            <button type="button">Delete</button>
          </use-gridcell>
        </use-gridrow>
        <use-gridrow value="789">
          <use-gridcell>Jane Doe</use-gridcell>
          <use-gridcell mode="widget">
            <button type="button">Edit</button>
            <button type="button">Delete</button>
          </use-gridcell>
        </use-gridrow>
      </use-gridbody>
    </use-grid>
  `,
};

export const FormSingleValue: Story = {
  render: () => html`
    <form
      id="grid-form"
      @submit=${(e: Event) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        // @ts-expect-error - https://github.com/microsoft/TypeScript/issues/30584
        const queryString = decodeURIComponent(new URLSearchParams(formData).toString());
        const formOutput = document.querySelector("#form-data-single");
        if (formOutput) {
          formOutput.textContent = queryString;
        }
      }}
    >
      <use-grid name="user" selectmode="single">
        <use-gridhead>
          <use-gridrow>
            <use-gridcell>ID</use-gridcell>
            <use-gridcell>Name</use-gridcell>
          </use-gridrow>
        </use-gridhead>
        <use-gridbody>
          <use-gridrow value="1">
            <use-gridcell>1</use-gridcell>
            <use-gridcell>Alice</use-gridcell>
          </use-gridrow>
          <use-gridrow value="2">
            <use-gridcell>2</use-gridcell>
            <use-gridcell>Bob</use-gridcell>
          </use-gridrow>
          <use-gridrow value="3">
            <use-gridcell>3</use-gridcell>
            <use-gridcell>Charlie</use-gridcell>
          </use-gridrow>
        </use-gridbody>
      </use-grid>
      <button type="submit">Submit</button>
      <div id="form-data-single"></div>
    </form>
  `,
};

export const FormMultipleValue: Story = {
  render: () => html`
    <form
      id="grid-form"
      @submit=${(e: Event) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        // @ts-expect-error - https://github.com/microsoft/TypeScript/issues/30584
        const queryString = decodeURIComponent(new URLSearchParams(formData).toString());
        const formOutput = document.querySelector("#form-data-multiple");
        if (formOutput) {
          formOutput.textContent = queryString;
        }
      }}
    >
      <use-grid name="users[]" selectmode="multiple">
        <use-gridhead>
          <use-gridrow>
            <use-gridcell>ID</use-gridcell>
            <use-gridcell>Name</use-gridcell>
          </use-gridrow>
        </use-gridhead>
        <use-gridbody>
          <use-gridrow value="1">
            <use-gridcell>1</use-gridcell>
            <use-gridcell>Alice</use-gridcell>
          </use-gridrow>
          <use-gridrow value="2">
            <use-gridcell>2</use-gridcell>
            <use-gridcell>Bob</use-gridcell>
          </use-gridrow>
          <use-gridrow value="3">
            <use-gridcell>3</use-gridcell>
            <use-gridcell>Charlie</use-gridcell>
          </use-gridrow>
        </use-gridbody>
      </use-grid>
      <button type="submit">Submit</button>
      <div id="form-data-multiple"></div>
    </form>
  `,
};

export const CustomIndicators: Story = {
  render: () => html`
    <use-grid selectmode="multiple">
      <span slot="selected-indicator" aria-hidden="true">♥️</span>
      <span slot="deselected-indicator" aria-hidden="true">💔</span>
      <use-gridhead>
        <use-gridrow>
          <use-gridcell>Item</use-gridcell>
          <use-gridcell>Actions</use-gridcell>
        </use-gridrow>
      </use-gridhead>
      <use-gridbody>
        <use-gridrow value="123">
          <use-gridcell>John Doe</use-gridcell>
          <use-gridcell mode="widget">
            <button type="button">Edit</button>
            <button type="button">Delete</button>
          </use-gridcell>
        </use-gridrow>
        <use-gridrow value="789">
          <use-gridcell>Jane Doe</use-gridcell>
          <use-gridcell mode="widget">
            <button type="button">Edit</button>
            <button type="button">Delete</button>
          </use-gridcell>
        </use-gridrow>
      </use-gridbody>
    </use-grid>
  `,
};

export const ProgrammaticSelectionSetter: Story = {
  render: () => html`
    <use-grid name="programmatic-selection" selectmode="single">
      <use-gridhead>
        <use-gridrow>
          <use-gridcell>Item</use-gridcell>
        </use-gridrow>
      </use-gridhead>
      <use-gridbody>
        <use-gridrow value="123">
          <use-gridcell>John Doe</use-gridcell>
        </use-gridrow>
        <use-gridrow value="789">
          <use-gridcell>Jane Doe</use-gridcell>
        </use-gridrow>
      </use-gridbody>
    </use-grid>
    <button
      type="button"
      @click=${() => {
        const grid = document.querySelector('use-grid[name="programmatic-selection"]') as UseGrid;
        grid.value = "123";
      }}
    >
      Toggle First Row Selection
    </button>
  `,
};

export const HeaderControls: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Grid header cells can only have one _tabbable_ control. To overcome this limitation, controls can have `tabindex="-1"` to remove them from the tab order. To make these controls accessible, they must have an alternative control, such as a dropdown, with actionable menu items. This dropdown is accessible by focusing on the header cell and pressing `Control + Enter`.',
      },
    },
  },
  render: () => {
    function handleHeaderKeyDown(event: KeyboardEvent) {
      if (event.key === "Enter") {
        if (event.ctrlKey) {
          alert("Header alt action triggered!");
        } else {
          alert("Header default action triggered!");
        }
      }
    }

    return html`
      <use-grid selectmode="multiple">
        <use-gridhead>
          <use-gridrow>
            <use-gridcell mode="action" aria-sort="none" @keydown=${handleHeaderKeyDown}>
              Item
              <button type="button" tabindex="-1">Sort</button>
              <button type="button" tabindex="-1">Filter</button>
              <button type="button" tabindex="-1">Options</button>
            </use-gridcell>
            <use-gridcell>Actions</use-gridcell>
          </use-gridrow>
        </use-gridhead>
        <use-gridbody>
          <use-gridrow value="123">
            <use-gridcell>John Doe</use-gridcell>
            <use-gridcell mode="widget">
              <button type="button">Edit</button>
              <button type="button">Delete</button>
            </use-gridcell>
          </use-gridrow>
          <use-gridrow value="789">
            <use-gridcell>Jane Doe</use-gridcell>
            <use-gridcell mode="widget">
              <button type="button">Edit</button>
              <button type="button">Delete</button>
            </use-gridcell>
          </use-gridrow>
        </use-gridbody>
      </use-grid>
    `;
  },
};

export const StickyHeader: Story = {
  render: () => html`
    <style>
      .sticky-header {
        isolation: isolate;
        height: 100px;
        overflow: auto;
      }
      .sticky-header use-gridhead use-gridrow {
        position: sticky;
        top: 0;
        z-index: 1;
        background-color: white;
        color: black;
      }
    </style>
    <use-grid class="sticky-header">
      <use-gridhead>
        <use-gridrow>
          <use-gridcell>Header 1</use-gridcell>
          <use-gridcell>Header 2</use-gridcell>
        </use-gridrow>
      </use-gridhead>
      <use-gridbody>
        <use-gridrow>
          <use-gridcell>Row 1, Cell 1</use-gridcell>
          <use-gridcell>Row 1, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 2, Cell 1</use-gridcell>
          <use-gridcell>Row 2, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 3, Cell 1</use-gridcell>
          <use-gridcell>Row 3, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 4, Cell 1</use-gridcell>
          <use-gridcell>Row 4, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 5, Cell 1</use-gridcell>
          <use-gridcell>Row 5, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 6, Cell 1</use-gridcell>
          <use-gridcell>Row 6, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 7, Cell 1</use-gridcell>
          <use-gridcell>Row 7, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 8, Cell 1</use-gridcell>
          <use-gridcell>Row 8, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 9, Cell 1</use-gridcell>
          <use-gridcell>Row 9, Cell 2</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 10, Cell 1</use-gridcell>
          <use-gridcell>Row 10, Cell 2</use-gridcell>
        </use-gridrow>
      </use-gridbody>
    </use-grid>
  `,
};

export const StickyColumn: Story = {
  render: () => html`
    <style>
      .sticky-column {
        isolation: isolate;
        max-width: 500px;
        height: 200px;
        overflow: auto;
        scroll-padding-inline-start: 160px;
      }
      .sticky-column use-gridcell {
        padding: 0.5rem;
        box-sizing: border-box;
      }
      .sticky-column use-gridrow {
        width: 1060px;
        position: relative;
        display: grid;
        grid-template-columns: 160px 300px 300px 300px;
      }
      .sticky-column use-gridrow use-gridcell:first-child {
        position: sticky;
        left: 0;
        z-index: 1;
        background-color: white;
        color: black;
      }
    </style>
    <use-grid class="sticky-column">
      <use-gridhead>
        <use-gridrow>
          <use-gridcell>Header 1</use-gridcell>
          <use-gridcell>Header 2</use-gridcell>
          <use-gridcell>Header 3</use-gridcell>
          <use-gridcell>Header 4</use-gridcell>
        </use-gridrow>
      </use-gridhead>
      <use-gridbody>
        <use-gridrow>
          <use-gridcell>Row 1, Cell 1</use-gridcell>
          <use-gridcell>Row 1, Cell 2</use-gridcell>
          <use-gridcell>Row 1, Cell 3</use-gridcell>
          <use-gridcell>Row 1, Cell 4</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 2, Cell 1</use-gridcell>
          <use-gridcell>Row 2, Cell 2</use-gridcell>
          <use-gridcell>Row 2, Cell 3</use-gridcell>
          <use-gridcell>Row 2, Cell 4</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 3, Cell 1</use-gridcell>
          <use-gridcell>Row 3, Cell 2</use-gridcell>
          <use-gridcell>Row 3, Cell 3</use-gridcell>
          <use-gridcell>Row 3, Cell 4</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 4, Cell 1</use-gridcell>
          <use-gridcell>Row 4, Cell 2</use-gridcell>
          <use-gridcell>Row 4, Cell 3</use-gridcell>
          <use-gridcell>Row 4, Cell 4</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 5, Cell 1</use-gridcell>
          <use-gridcell>Row 5, Cell 2</use-gridcell>
          <use-gridcell>Row 5, Cell 3</use-gridcell>
          <use-gridcell>Row 5, Cell 4</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 6, Cell 1</use-gridcell>
          <use-gridcell>Row 6, Cell 2</use-gridcell>
          <use-gridcell>Row 6, Cell 3</use-gridcell>
          <use-gridcell>Row 6, Cell 4</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 7, Cell 1</use-gridcell>
          <use-gridcell>Row 7, Cell 2</use-gridcell>
          <use-gridcell>Row 7, Cell 3</use-gridcell>
          <use-gridcell>Row 7, Cell 4</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 8, Cell 1</use-gridcell>
          <use-gridcell>Row 8, Cell 2</use-gridcell>
          <use-gridcell>Row 8, Cell 3</use-gridcell>
          <use-gridcell>Row 8, Cell 4</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 9, Cell 1</use-gridcell>
          <use-gridcell>Row 9, Cell 2</use-gridcell>
          <use-gridcell>Row 9, Cell 3</use-gridcell>
          <use-gridcell>Row 9, Cell 4</use-gridcell>
        </use-gridrow>
        <use-gridrow>
          <use-gridcell>Row 10, Cell 1</use-gridcell>
          <use-gridcell>Row 10, Cell 2</use-gridcell>
          <use-gridcell>Row 10, Cell 3</use-gridcell>
          <use-gridcell>Row 10, Cell 4</use-gridcell>
        </use-gridrow>
      </use-gridbody>
    </use-grid>
  `,
};

export const ChipInput: Story = {
  render: () => {
    function handleAdd(event: Event) {
      event.preventDefault();
      const input = document.querySelector("input") as HTMLInputElement;
      const value = input.value;
      input.value = "";

      if (value) {
        const grid = document.querySelector(".chip-input use-gridbody") as UseGrid;
        const newRow = document.createElement("use-gridrow");
        newRow.setAttribute("value", value);
        newRow.setAttribute("selected", "");
        newRow.innerHTML = `
          <use-gridcell value="${value}">${value}</use-gridcell>
          <use-gridcell mode="action"><button type="button">&times;</button></use-gridcell>
        `;
        grid.appendChild(newRow);
      }
    }

    function handleSubmit(event: Event) {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      // @ts-expect-error - https://github.com/microsoft/TypeScript/issues/30584
      const queryString = decodeURIComponent(new URLSearchParams(formData).toString());
      const formOutput = document.querySelector("#chip-input-form-output") as HTMLSpanElement;
      if (formOutput) {
        formOutput.textContent = queryString;
      }
    }

    function handleRemove(event: Event) {
      const target = event.target as HTMLElement;
      if (target.matches("button")) {
        const row = target.closest("use-gridrow");
        if (row) {
          row.remove();
        }
      }
    }

    return html`
      <style>
        .chip-input {
          display: flex;
          flex-direction: column;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .chip-input use-gridrow {
          display: inline-flex;
          border: 1px solid;
        }

        .chip-input use-gridcell {
          padding: 0.25rem 0.5rem;
        }

        .chip-input use-gridrow::part(selected-indicator),
        .chip-input use-gridrow::part(deselected-indicator) {
          display: none;
        }
      </style>
      <form id="chip-input-form" @submit=${handleSubmit} @click=${handleRemove}>
        <use-grid class="chip-input" name="fruits[]" selectmode="multiple" readonly>
          <use-gridbody>
            <use-gridrow value="apple" selected>
              <use-gridcell>apple</use-gridcell>
              <use-gridcell mode="action"><button type="button">&times;</button></use-gridcell>
            </use-gridrow>
            <use-gridrow value="banana" selected>
              <use-gridcell>banana</use-gridcell>
              <use-gridcell mode="action"><button type="button">&times;</button></use-gridcell>
            </use-gridrow>
            <use-gridrow value="cherry" selected>
              <use-gridcell>cherry</use-gridcell>
              <use-gridcell mode="action"><button type="button">&times;</button></use-gridcell>
            </use-gridrow>
          </use-gridbody>
        </use-grid>
        <button type="submit">Submit</button>
      </form>
      <hr />
      <form @submit=${handleAdd}>
        <input type="text" />
        <button type="submit">Add</button>
      </form>
      <hr />
      <span id="chip-input-form-output"></span>
    `;
  },
};

export const MasterDetail: Story = {
  render: () => {
    function handleChange(event: CustomEvent<{ value: string }>) {
      const output = document.querySelector("#selected-value") as HTMLSpanElement;

      if (output) {
        output.textContent = event.detail.value;
      }
    }

    return html`
      <style>
        .master-detail {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;

          ::part(selected-indicator),
          ::part(deselected-indicator) {
            display: none;
          }
        }

        .master-detail use-gridrow {
          display: grid;
          grid-template:
            "name meta"
            "desc desc";
          grid-gap: 0.5rem;
          align-items: center;
          justify-items: stretch;
          flex-direction: column;
          padding: 0.5rem;

          .md-name {
            grid-area: name;
            font-weight: bold;
          }

          .md-meta {
            grid-area: meta;
            font-size: 0.8rem;
            color: gray;
            text-align: right;
          }

          .md-desc {
            grid-area: desc;
          }

          &:is(:hover, :focus-within) {
            background-color: rgba(0, 0, 0, 0.1);
          }

          &[selected] {
            box-shadow: inset 2px 0 0 0 blue;
          }
        }

        .master-detail use-gridcell {
          flex: initial;
        }
      </style>
      <use-grid class="master-detail" selectmode="single" @use-change=${handleChange}>
        <use-gridbody>
          <use-gridrow value="1">
            <use-gridcell mode="action" class="md-name">
              <a href="#">RE: Garden gnomes</a>
            </use-gridcell>
            <div class="md-meta">
              <use-gridcell>
                <time datetime="2023-10-01T12:00:00Z">Oct 1, 2023</time>
              </use-gridcell>
              <use-gridcell mode="action" class="md-delete">
                <button type="button" aria-label="delete">&times;</button>
              </use-gridcell>
            </div>
            <use-gridcell class="md-desc">
              Our HOA rules state a publicly visible garden cannot have more than 113 garden gnomes.
            </use-gridcell>
          </use-gridrow>
          <use-gridrow value="2">
            <use-gridcell mode="action" class="md-name">
              <a href="#">RE: Garden gnomes</a>
            </use-gridcell>
            <div class="md-meta">
              <use-gridcell>
                <time datetime="2023-10-01T12:00:00Z">Oct 1, 2023</time>
              </use-gridcell>
              <use-gridcell mode="action" class="md-delete">
                <button type="button" aria-label="delete">&times;</button>
              </use-gridcell>
            </div>
            <use-gridcell class="md-desc"> Too many gnomes. </use-gridcell>
          </use-gridrow>
        </use-gridbody>
      </use-grid>
      Selected: <span id="selected-value"></span>
    `;
  },
};
