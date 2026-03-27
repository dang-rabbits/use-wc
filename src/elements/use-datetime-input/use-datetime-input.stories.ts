import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import "./use-datetime-input";
import { UseDatetimeInput } from "./use-datetime-input";

const meta: Meta<UseDatetimeInput> = {
  component: "use-datetime-input",
  title: "Web Components/use-datetime-input",
  tags: ["autodocs", "!dev", "input"],
  args: {},
  render: () => {
    return html`<use-datetime-input value="2024-06-01T12:00:00"></use-datetime-input>`;
  },
};

export default meta;

type Story = StoryObj<UseDatetimeInput>;

export const Default: Story = {
  render: () => html`<use-datetime-input value=""></use-datetime-input>`,
};

export const WithValue: Story = {
  render: () => html`<use-datetime-input value="2024-06-01T14:30Z"></use-datetime-input>`,
};

export const WithSeconds: Story = {
  render: () => html`<use-datetime-input value="2024-06-01T14:30:45" seconds></use-datetime-input>`,
};

export const WithFractionalSeconds: Story = {
  render: () =>
    html`<use-datetime-input
      value="2024-06-01T14:30:45.123"
      seconds
      fractionalSeconds
    ></use-datetime-input>`,
};

export const French: Story = {
  render: () =>
    html`<use-datetime-input value="2024-06-01T14:30" locale="fr-FR"></use-datetime-input>`,
};

export const Disabled: Story = {
  render: () => html`<use-datetime-input value="2024-06-01T14:30" disabled></use-datetime-input>`,
};

export const ReadOnly: Story = {
  render: () => html`<use-datetime-input value="2024-06-01T14:30" readonly></use-datetime-input>`,
};

export const FormSubmission: Story = {
  render: () => {
    const handleSubmit = (event: Event) => {
      event.preventDefault();
      const formData = new FormData(event.target as HTMLFormElement);
      // @ts-expect-error - https://github.com/microsoft/TypeScript/issues/30584
      const queryString = decodeURIComponent(new URLSearchParams(formData).toString());
      const output = document.getElementById("output") as HTMLPreElement;
      output.textContent = queryString;
    };
    return html`
      <form @submit=${handleSubmit} id="form-submission">
        <use-datetime-input value="2024-06-01T14:30" name="datetime"></use-datetime-input>
        <button type="submit">Submit</button>
      </form>
      <pre id="output"></pre>
    `;
  },
};
