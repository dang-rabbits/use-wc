// Storybook stories for use-grid
import { html } from 'lit';
import type { Meta, StoryObj } from '@storybook/web-components';
import './use-grid';
import './use-gridhead';
import './use-gridbody';
import './use-gridrow';
import './use-gridcell';
import { UseGrid } from './use-grid';

const meta: Meta<UseGrid> = {
  title: 'Web Components/use-grid',
  component: 'use-grid',
  tags: ['autodocs', '!dev', 'utility'],
};
export default meta;

type Story = StoryObj<UseGrid>;

export const Default: Story = {
  tags: ['!autodocs', '!dev'],
  render: (args) => html`
    <use-grid ?disabled=${args.disabled} .name=${args.name} .role=${args.role} .selectmode=${args.selectmode}>
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
        const formOutput = document.querySelector('#form-data-single');
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
        const formOutput = document.querySelector('#form-data-multiple');
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
        grid.value = '123';
      }}
    >
      Toggle First Row Selection
    </button>
  `,
};

export const HeaderControls: Story = {
  render: () => {
    function handleHeaderKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        if (event.ctrlKey) {
          alert('Header alt action triggered!');
        } else {
          alert('Header default action triggered!');
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

export const MasterDetail: Story = {
  render: () => html`
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
          'name meta'
          'desc desc';
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
    <use-grid class="master-detail" selectmode="single">
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
          <use-gridcell class="md-desc">
            Our HOA rules state a public visible yard cannot have more than 113 garden gnomes.
          </use-gridcell>
        </use-gridrow>
      </use-gridbody>
    </use-grid>
  `,
};
