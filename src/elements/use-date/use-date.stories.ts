import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseDate } from "./use-date";

const meta: Meta<UseDate> = {
  component: "use-date",
  title: "Web Components/use-date",
  tags: ["autodocs", "!dev", "input"],
  args: {},
  render: () => {
    return html`<use-date value="2024-06-01"></use-date>`;
  },
};

export default meta;

type Story = StoryObj<UseDate>;

export const Default: Story = {
  render: () => html`<use-date value=""></use-date>`,
};

export const French: Story = {
  render: () => html`<use-date value="2024-06-01" locale="fr-FR"></use-date>`,
};

export const German: Story = {
  render: () => html`<use-date value="2024-06-01" locale="de-DE"></use-date>`,
};

export const Arabic: Story = {
  render: () => html`<use-date value="2024-06-01" locale="ar-SA"></use-date>`,
};

export const Japanese: Story = {
  render: () => html`<use-date value="2024-06-01" locale="ja-JP"></use-date>`,
};

export const Chinese: Story = {
  render: () => html`<use-date value="2024-06-01" locale="zh-CN"></use-date>`,
};

export const CustomStyles: Story = {
  render: () => html`
    <style>
      .custom-date {
        display: inline-flex;
        gap: 0.25rem;
        align-items: center;
        background: transparent;
        color: hotpink;
        border: 1px solid hotpink;
        border-radius: 0.5rem;
        padding: 0.25rem 0.5rem;
      }
      .custom-date::part(segment) {
        display: flex;
      }
      .custom-date::part(segment-input) {
        all: unset;
        appearance: none;
        field-sizing: content;
        border-radius: 0.125rem;
        padding: 0 0.125rem;
      }
      .custom-date::part(segment-input):focus,
      .custom-date::selection {
        background-color: hotpink;
        color: white;
      }
      .custom-date::part(segment-unit) {
        user-select: none;
      }
    </style>
    <label for="custom-date">Custom date</label><br />
    <use-date id="custom-date" class="custom-date" value="2024-06-01"></use-date>
  `,
};

export const ProgrammaticGetValue: Story = {
  render: () => {
    const handleClick = () => {
      const output = document.getElementById("value-output") as HTMLPreElement;
      const date = document.getElementById("date-value") as UseDate;
      output.textContent = date.value;
    };
    return html`
      <use-date id="date-value" value="2024-06-01"></use-date>
      <button type="button" @click=${handleClick}>Show value</button>
      <pre id="value-output"></pre>
    `;
  },
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
        <use-date value="2024-06-01" name="date"></use-date>
        <button type="submit">Submit</button>
      </form>
      <pre id="output"></pre>
    `;
  },
};

export const SetValueProgrammatically: Story = {
  render: () => {
    const handleClick = () => {
      const date = document.getElementById("set-date-value") as UseDate;
      date.value = "2024-06-01";
    };

    return html`
      <use-date id="set-date-value" value=""></use-date>
      <button type="button" @click=${handleClick}>Set value</button>
    `;
  },
};
