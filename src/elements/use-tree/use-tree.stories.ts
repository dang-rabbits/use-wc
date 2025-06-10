import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { UseTree } from './use-tree';
import { html } from 'lit';

const meta: Meta<UseTree> = {
  component: 'use-tree',
  subcomponents: { 'use-treeitem': 'use-treeitem' },
  title: 'Web Components/use-tree',
  tags: ['autodocs', '!dev', 'input'],
  args: {
    disabled: false,
    multiple: false,
    name: 'example',
  },
  render: (args: UseTree) => {
    return html`
      <use-tree .name=${args.name} ?disabled=${args.disabled} ?multiple=${args.multiple}>
        <use-treeitem value="1" id="option-1" selected>One</use-treeitem>
        <use-treeitem value="2" id="option-2">Two</use-treeitem>
        <use-treeitem value="3" id="option-3">
          Three
          <use-treeitem value="3a" id="option-3-a">Three A</use-treeitem>
          <use-treeitem value="3b" id="option-3-b">
            Three B
            <use-treeitem value="3b1" id="option-3-b-1">Three B 1</use-treeitem>
            <use-treeitem value="3b2" id="option-3-b-2">Three B 2</use-treeitem>
          </use-treeitem>
        </use-treeitem>
      </use-tree>
    `;
  },
};

export default meta;
type Story = StoryObj<UseTree>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledOptions: Story = {
  render: () => html`
    <use-tree>
      <use-treeitem value="1" id="option-1" selected>One</use-treeitem>
      <use-treeitem value="2" id="option-2" disabled>Two</use-treeitem>
      <use-treeitem value="3" id="option-3">
        Three
        <use-treeitem value="3a" id="option-3-a">Three A</use-treeitem>
        <use-treeitem value="3b" id="option-3-b" disabled>
          Three B
          <use-treeitem value="3b1" id="option-3-b-1">Three B 1</use-treeitem>
          <use-treeitem value="3b2" id="option-3-b-2">Three B 2</use-treeitem>
        </use-treeitem>
      </use-treeitem>
    </use-tree>
  `,
};

export const Multiple: Story = {
  args: {
    multiple: true,
  },
};

export const FormSingleValue: Story = {
  render: () => {
    function handleFormSubmit(e: Event) {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const jsonData = JSON.stringify(Object.fromEntries(formData), null, 2);
      const formOutput = document.querySelector('#form-data');
      if (formOutput) {
        formOutput.textContent = jsonData;
      }
    }

    return html`
      <form @submit=${handleFormSubmit}>
        <div>
          <label for="favorite-fruit">Favorite fruit:</label><br />
          <use-tree id="favorite-fruit" name="favorite-fruit">
            <use-treeitem value="1" id="option-1" selected>One</use-treeitem>
            <use-treeitem value="2" id="option-2">Two</use-treeitem>
            <use-treeitem value="3" id="option-3">
              Three
              <use-treeitem value="3a" id="option-3-a">Three A</use-treeitem>
              <use-treeitem value="3b" id="option-3-b">
                Three B
                <use-treeitem value="3b1" id="option-3-b-1">Three B 1</use-treeitem>
                <use-treeitem value="3b2" id="option-3-b-2">Three B 2</use-treeitem>
              </use-treeitem>
            </use-treeitem>
          </use-tree>
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
      const formOutput = document.querySelector('#form-data-multiple');
      if (formOutput) {
        formOutput.textContent = queryString;
      }
    }

    return html`
      <form @submit=${handleFormSubmit}>
        <div>
          <label for="favorite-fruits">Favorite fruits:</label><br />
          <use-tree id="favorite-fruits" name="favorite-fruit[]" multiple>
            <use-treeitem value="1" id="option-1" selected>One</use-treeitem>
            <use-treeitem value="2" id="option-2">Two</use-treeitem>
            <use-treeitem value="3" id="option-3">
              Three
              <use-treeitem value="3a" id="option-3-a">Three A</use-treeitem>
              <use-treeitem value="3b" id="option-3-b">
                Three B
                <use-treeitem value="3b1" id="option-3-b-1">Three B 1</use-treeitem>
                <use-treeitem value="3b2" id="option-3-b-2">Three B 2</use-treeitem>
              </use-treeitem>
            </use-treeitem>
          </use-tree>
        </div>
        <button>Submit</button>
      </form>
      <hr />
      <h6>Payload</h6>
      <pre id="form-data-multiple"></pre>
    `;
  },
};

export const CustomSelectedIndicatorSlot: Story = {
  render: () => html`
    <use-tree>
      <span slot="expanded-indicator">⬇️</span>
      <span slot="collapsed-indicator">➡️</span>
      <span slot="selected-indicator">✅</span>
      <use-treeitem value="1" id="option-1" selected>
        First
        <use-treeitem> First A </use-treeitem>
        <use-treeitem> First B </use-treeitem>
        <use-treeitem> First C </use-treeitem>
      </use-treeitem>
      <use-treeitem value="2" id="option-2">
        Second
        <use-treeitem> Second A </use-treeitem>
        <use-treeitem> Second B </use-treeitem>
        <use-treeitem> Second C </use-treeitem>
      </use-treeitem>
      <use-treeitem value="3" id="option-3">
        Third
        <use-treeitem> Third A </use-treeitem>
        <use-treeitem> Third B </use-treeitem>
        <use-treeitem> Third C </use-treeitem>
      </use-treeitem>
    </use-tree>
  `,
};

export const CustomStyles: Story = {
  render: () => html`
    <style>
      .custom-use-tree {
        background-color: lightpink;
        color: mediumvioletred;
        border: 2px solid mediumvioletred;
        border-radius: 6px;
        padding: 4px;
        box-shadow:
          1px 1px 0 mediumvioletred,
          2px 2px 0 mediumvioletred,
          3px 3px 0 mediumvioletred;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 2px;
      }

      .custom-use-tree use-treeitem::part(content) {
        border-radius: 2px;
        padding: 4px;
        line-height: 24px;
      }

      .custom-use-tree use-treeitem use-treeitem {
        padding-inline-start: 1.5rem;
      }

      .custom-use-tree use-treeitem::part(collapsed-indicator-default),
      .custom-use-tree use-treeitem::part(expanded-indicator-default),
      .custom-use-tree use-treeitem::part(selected-indicator-default) {
        display: none;
      }

      .custom-use-tree use-treeitem::part(collapsed-indicator)::before,
      .custom-use-tree use-treeitem::part(expanded-indicator)::before,
      .custom-use-tree use-treeitem::part(selected-indicator)::before {
        width: 1.5rem;
        text-align: center;
      }

      .custom-use-tree use-treeitem::part(collapsed-indicator)::before {
        content: '\\25BA';
      }

      .custom-use-tree use-treeitem::part(expanded-indicator)::before {
        content: '\\25BC';
      }

      .custom-use-tree use-treeitem::part(selected-indicator)::before {
        content: '🐲';
      }

      .custom-use-tree use-treeitem:focus-visible {
        outline: none;
      }

      .custom-use-tree use-treeitem:focus-visible::part(content),
      .custom-use-tree use-treeitem:not(:state(disabled))::part(content):hover {
        background-color: mediumvioletred;
        color: lightpink;
      }

      .custom-use-tree:focus-within {
        outline: 2px dashed currentColor;
        outline-offset: 4px;
        box-shadow: none;
      }
    </style>
    <use-tree class="custom-use-tree">
      <use-treeitem value="1" id="option-1" selected>
        First
        <use-treeitem>First A</use-treeitem>
        <use-treeitem>First B</use-treeitem>
        <use-treeitem>First C</use-treeitem>
        <use-treeitem disabled>First Disabled</use-treeitem>
      </use-treeitem>
      <use-treeitem value="2" id="option-2">
        Second
        <use-treeitem>Second A</use-treeitem>
        <use-treeitem>Second B</use-treeitem>
        <use-treeitem>Second C</use-treeitem>
      </use-treeitem>
      <use-treeitem value="3" id="option-3">
        Third
        <use-treeitem>Third A</use-treeitem>
        <use-treeitem>Third B</use-treeitem>
        <use-treeitem>
          Third C
          <use-treeitem>Third C A</use-treeitem>
          <use-treeitem>Third C B</use-treeitem>
          <use-treeitem>Third C C</use-treeitem>
        </use-treeitem>
      </use-treeitem>
    </use-tree>
  `,
};

export const ProgrammaticallyChangeSelection: Story = {
  render: () => {
    function handleFormSubmit(e: Event) {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const jsonData = JSON.stringify(Object.fromEntries(formData), null, 2);
      const formOutput = document.querySelector('#form-data-programmatic');
      if (formOutput) {
        formOutput.textContent = jsonData;
      }
    }

    function handleSelect() {
      const tree = document.getElementById('programmatic-tree') as UseTree;
      if (tree) {
        tree.value = '2';
      }
    }

    function handleDeselect() {
      const tree = document.getElementById('programmatic-tree') as UseTree;
      if (tree) {
        tree.value = '';
      }
    }

    return html`
      <button type="button" id="select-option-2" @click=${handleSelect}>Select Option 2</button>
      <button type="button" id="deselect-option-2" @click=${handleDeselect}>Deselect Option 2</button>
      <form @submit=${handleFormSubmit}>
        <use-tree id="programmatic-tree" name="programmatic">
          <use-treeitem value="1" id="option-1">One</use-treeitem>
          <use-treeitem value="2" id="option-2">Two</use-treeitem>
          <use-treeitem value="3" id="option-3">Three</use-treeitem>
        </use-tree>
        <button>Submit</button>
      </form>
      <hr />
      <h6>Payload</h6>
      <pre id="form-data-programmatic"></pre>
    `;
  },
};

export const ProgrammaticallyChangeSelectionMultiple: Story = {
  render: () => {
    function handleFormSubmit(e: Event) {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      // @ts-expect-error - ttps://github.com/microsoft/TypeScript/issues/30584
      const queryString = decodeURIComponent(new URLSearchParams(formData).toString());
      const formOutput = document.querySelector('#form-data-programmatic-multiple');
      if (formOutput) {
        formOutput.textContent = queryString;
      }
    }

    function handleSelect() {
      const tree = document.getElementById('programmatic-tree-multiple') as UseTree;
      if (tree) {
        tree.value = ['1', '2'];
      }
    }

    function handleDeselect() {
      const tree = document.getElementById('programmatic-tree-multiple') as UseTree;
      if (tree) {
        tree.value = [];
      }
    }

    return html`
      <button type="button" id="select-option-2" @click=${handleSelect}>Select Options 1 and 2</button>
      <button type="button" id="deselect-option-2" @click=${handleDeselect}>Deselect Options</button>
      <form @submit=${handleFormSubmit}>
        <use-tree id="programmatic-tree-multiple" name="programmatic[]" multiple>
          <use-treeitem value="1" id="option-1">One</use-treeitem>
          <use-treeitem value="2" id="option-2">Two</use-treeitem>
          <use-treeitem value="3" id="option-3">Three</use-treeitem>
        </use-tree>
        <button>Submit</button>
      </form>
      <hr />
      <h6>Payload</h6>
      <pre id="form-data-programmatic-multiple"></pre>
    `;
  },
};
