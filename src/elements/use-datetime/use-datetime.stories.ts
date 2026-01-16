import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './use-datetime';
import { UseDatetime } from './use-datetime';

const meta: Meta<UseDatetime> = {
  component: 'use-datetime',
  title: 'Web Components/use-datetime',
  tags: ['autodocs', '!dev', 'input'],
  args: {},
  render: () => {
    return html`<use-datetime value="2024-06-01T12:00:00"></use-datetime>`;
  },
};

export default meta;

type Story = StoryObj<UseDatetime>;

export const Default: Story = {
  render: () => html`<use-datetime value=""></use-datetime>`,
};

export const WithValue: Story = {
  render: () => html`<use-datetime value="2024-06-01T14:30Z"></use-datetime>`,
};

export const WithSeconds: Story = {
  render: () => html`<use-datetime value="2024-06-01T14:30:45" seconds></use-datetime>`,
};

export const WithFractionalSeconds: Story = {
  render: () => html`<use-datetime value="2024-06-01T14:30:45.123" seconds fractionalSeconds></use-datetime>`,
};

export const French: Story = {
  render: () => html`<use-datetime value="2024-06-01T14:30" locale="fr-FR"></use-datetime>`,
};

export const Disabled: Story = {
  render: () => html`<use-datetime value="2024-06-01T14:30" disabled></use-datetime>`,
};

export const ReadOnly: Story = {
  render: () => html`<use-datetime value="2024-06-01T14:30" readonly></use-datetime>`,
};

export const FormSubmission: Story = {
  render: () => {
    const handleSubmit = (event: Event) => {
      event.preventDefault();
      const formData = new FormData(event.target as HTMLFormElement);
      // @ts-expect-error - https://github.com/microsoft/TypeScript/issues/30584
      const queryString = decodeURIComponent(new URLSearchParams(formData).toString());
      const output = document.getElementById('output') as HTMLPreElement;
      output.textContent = queryString;
    };
    return html`
      <form @submit=${handleSubmit} id="form-submission">
        <use-datetime value="2024-06-01T14:30" name="datetime"></use-datetime>
        <button type="submit">Submit</button>
      </form>
      <pre id="output"></pre>
    `;
  },
};
