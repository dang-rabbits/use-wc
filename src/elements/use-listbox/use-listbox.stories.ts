import type { Meta, StoryObj } from '@storybook/web-components';
import { UseListbox } from './use-listbox';
import { html } from 'lit';

const meta: Meta<UseListbox> = {
  component: 'use-listbox',
  subcomponents: { 'use-option': 'use-option' },
  title: 'Web Components/use-listbox',
  tags: ['autodocs', '!dev'],
  args: {
    placeholder: 'Select a number',
    disabled: false,
    multiple: false,
    name: 'example',
  },
  render: (args: UseListbox) => {
    return html`
      <use-listbox
        name=${args.name}
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
        ?multiple=${args.multiple}
      >
        <use-option value="1" id="option-1" selected>One</use-option>
        <use-option value="2" id="option-2">Two</use-option>
      </use-listbox>
  `;
  },
};

export default meta;
type Story = StoryObj<UseListbox>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  }
};

export const Placeholder: Story = {
  args: {
    placeholder: 'Select a number',
  }
};

export const DisabledOption: Story = {
  render: () => html`
    <use-listbox>
      <use-option value="1" id="option-1" selected>One</use-option>
      <use-option value="2" id="option-2" disabled>Two</use-option>
      <use-option value="3" id="option-3">Three</use-option>
    </use-listbox>
  `,
};

export const Multiple: Story = {
  render: () => html`
    <use-listbox multiple>
      <use-option value="1" id="option-1" selected>One</use-option>
      <use-option value="2" id="option-2">Two</use-option>
      <use-option value="3" id="option-3">Three</use-option>
    </use-listbox>
  `,
};

export const OptionsDivider: Story = {
  render: () => html`
    <use-listbox>
      <use-option value="1" id="option-1" selected>One</use-option>
      <use-option value="2" id="option-2">Two</use-option>
      <hr />
      <use-option value="3" id="option-3">Three</use-option>
    </use-listbox>
  `,
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
          <use-listbox id="favorite-fruit" name="favorite-fruit">
            <use-option value="apple" id="apple">Apple</use-option>
            <use-option value="banana" id="banana">Banana</use-option>
            <use-option value="cherry" id="cherry">Cherry</use-option>
          </use-listbox>
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
      const queryString = decodeURIComponent(new URLSearchParams(formData as any).toString());
      const formOutput = document.querySelector('#form-data-multiple');
      if (formOutput) {
        formOutput.textContent = queryString;
      }
    }

    return html`
      <form @submit=${handleFormSubmit}>
        <div>
          <label for="favorite-fruits">Favorite fruits:</label><br />
          <use-listbox id="favorite-fruits" name="favorite-fruits[]" multiple>
            <use-option value="apple" id="apple">Apple</use-option>
            <use-option value="banana" id="banana">Banana</use-option>
            <use-option value="cherry" id="cherry">Cherry</use-option>
          </use-listbox>
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
    <use-listbox>
      <svg slot="trigger-arrow" fill="currentColor" viewBox='0 0 140 140' width='12' height='12'
        xmlns='http://www.w3.org/2000/svg'>
        <g>
          <path
            d='m121.3,34.6c-1.6-1.6-4.2-1.6-5.8,0l-51,51.1-51.1-51.1c-1.6-1.6-4.2-1.6-5.8,0-1.6,1.6-1.6,4.2 0,5.8l53.9,53.9c0.8,0.8 1.8,1.2 2.9,1.2 1,0 2.1-0.4 2.9-1.2l53.9-53.9c1.7-1.6 1.7-4.2 0.1-5.8z' />
        </g>
      </svg>
      <use-option value="1" id="option-1" selected>
        <span slot="selected-indicator">🔥</span>
        Fire
      </use-option>
      <use-option value="2" id="option-2">
        <span slot="selected-indicator">🌊</span>
        Water
      </use-option>
    </use-listbox>
  `
}

export const CustomStyles: Story = {
  render: () => html`
    <style>
      .custom-use-listbox {
        background-color: blanchedalmond;
        color: orangered;
        border: 2px solid orangered;
        border-radius: 6px;
        padding: 4px;
        box-shadow: 1px 1px 0 orangered, 2px 2px 0 orangered, 3px 3px 0 orangered;
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 2px;
      }

      .custom-use-listbox use-option {
        border-radius: 2px;
        padding: 4px 8px;
        line-height: 24px;
      }

      .custom-use-listbox use-option::part(selected-indicator-default) {
        display: none;
      }

      .custom-use-listbox use-option::part(selected-indicator)::before {
        content: "\\1F525";
        margin-inline-end: 8px;
      }

      .custom-use-listbox:not(:has(use-option:hover)):focus use-option:state(active),
      .custom-use-listbox use-option:not(:state(disabled)):hover {
        background-color: orangered;
        color: blanchedalmond;
      }

      .custom-use-listbox::part(listbox):focus-visible {
        outline: 2px dashed currentColor;
        outline-offset: 4px;
        box-shadow: none;
      }
    </style>
    <use-listbox class="custom-use-listbox">
      <use-option value="1" id="option-1">Overcompensate</use-option>
      <use-option value="2" id="option-2" selected>Routines In The Night</use-option>
      <use-option value="3" id="option-3">Paladin Strait</use-option>
    </use-listbox>
  `
}

