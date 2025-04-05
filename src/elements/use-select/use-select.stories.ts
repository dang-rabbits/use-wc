import type { Meta, StoryObj } from '@storybook/web-components';
import { UseSelect } from './use-select';
import { html } from 'lit';

const meta: Meta<UseSelect> = {
  component: 'use-select',
  subcomponents: { 'use-option': 'use-option' },
  title: 'Web Components/use-select',
  tags: ['autodocs', '!dev', 'input'],
  args: {
    placeholder: 'Select a number',
    disabled: false,
    name: 'example',
  },
  render: (args: UseSelect) => {
    return html`
      <use-select
        .name=${args.name}
        placeholder=${args.placeholder}
        ?disabled=${args.disabled}
      >
        <use-option value="1" id="option-1" selected>One</use-option>
        <use-option value="2" id="option-2">Two</use-option>
      </use-select>
  `;
  },
};

export default meta;
type Story = StoryObj<UseSelect>;

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

export const DisabledOptions: Story = {
  render: () => html`
    <use-select>
      <use-option value="1" id="option-1" selected>One</use-option>
      <use-option value="2" id="option-2" disabled>Two</use-option>
      <use-option value="3" id="option-3">Three</use-option>
    </use-select>
  `,
};

export const OptionsDividers: Story = {
  render: () => html`
    <use-select>
      <use-option value="1" id="option-1" selected>One</use-option>
      <hr />
      <use-option value="2" id="option-2">Two</use-option>
      <hr />
      <use-option value="3" id="option-3">Three</use-option>
    </use-select>
  `,
};

export const Form: Story = {
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
          <use-select id="favorite-fruit" name="favorite-fruit" placeholder="Select one...">
            <use-option value="apple" id="apple">Apple</use-option>
            <use-option value="banana" id="banana">Banana</use-option>
            <use-option value="cherry" id="cherry">Cherry</use-option>
          </use-select>
        </div>
        <button>Submit</button>
      </form>
      <hr />
      <h6>Payload</h6>
      <pre id="form-data"></pre>
    `;
  },
};

export const CustomArrowViaSlot: Story = {
  render: () => html`
    <use-select>
      <svg slot="trigger-arrow" fill="currentColor" viewBox='0 0 140 140' width='12' height='12'
        xmlns='http://www.w3.org/2000/svg'>
        <g>
          <path
            d='m121.3,34.6c-1.6-1.6-4.2-1.6-5.8,0l-51,51.1-51.1-51.1c-1.6-1.6-4.2-1.6-5.8,0-1.6,1.6-1.6,4.2 0,5.8l53.9,53.9c0.8,0.8 1.8,1.2 2.9,1.2 1,0 2.1-0.4 2.9-1.2l53.9-53.9c1.7-1.6 1.7-4.2 0.1-5.8z' />
        </g>
      </svg>
      <use-option value="1" id="option-1" selected>One</use-option>
      <use-option value="2" id="option-2">Two</use-option>
    </use-select>
  `
}

export const CustomStyles: Story = {
  render: () => html`
    <style>
      .custom-use-select {
        font-family: sans-serif;
      }

      .custom-use-select::part(trigger) {
        all: unset;
        display: inline-flex;
        align-items: center;
        border: 2px solid light-dark(#ccc, #999);
        padding: .25rem 1rem;
        border-radius: 50px;
        gap: 2rem;
      }

      .custom-use-select::part(trigger):hover {
        background-color: rgba(0, 255, 0, 0.05);
      }

      .custom-use-select::part(trigger):focus-visible {
        outline: 2px dotted light-dark(#000, #fff);
        outline-offset: 2px;
      }

      .custom-use-select::part(trigger-label) {
        color: green;
      }

      .custom-use-select::part(trigger-arrow) {
        color: light-dark(darkgreen, lightgreen);
      }
    </style>
    <use-select class="custom-use-select">
      <use-option value="1" id="option-1" selected>One</use-option>
      <use-option value="2" id="option-2">Two</use-option>
    </use-select>
  `
}

