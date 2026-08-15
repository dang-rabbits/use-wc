import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseDurationInput } from "./use-duration-input";

const meta: Meta<UseDurationInput> = {
  component: "use-duration-input",
  title: "Web Components/use-duration-input",
  tags: ["autodocs", "!dev", "input"],
  args: {},
  render: () => {
    return html`<use-duration-input
      value="PT1H30M"
      days
      hours
      minutes
      seconds
    ></use-duration-input>`;
  },
};

export default meta;
type Story = StoryObj<UseDurationInput>;

export const Default: Story = {
  render: () =>
    html`<use-duration-input value="PT1H30M" days hours minutes seconds></use-duration-input>`,
};

export const Theme: Story = {
  ...Default,
  parameters: { ...Default.parameters, allowTheme: true },
};

export const DaysHoursMinutesSeconds: Story = {
  render: () =>
    html`<use-duration-input value="P2DT3H4M5S" days hours minutes seconds></use-duration-input>`,
};

export const OnlyMinutes: Story = {
  render: () => html`<use-duration-input value="PT45M" minutes></use-duration-input>`,
};

export const OnlySeconds: Story = {
  render: () => html`<use-duration-input value="PT20S" seconds></use-duration-input>`,
};

export const ZeroDuration: Story = {
  render: () => html`<use-duration-input value="PT0S" seconds></use-duration-input>`,
};

export const InvalidFormat: Story = {
  render: () =>
    html`<use-duration-input value="notaduration" days hours minutes seconds></use-duration-input>`,
};

export const French: Story = {
  render: () =>
    html`<use-duration-input
      value="P2DT3H4M5S"
      locale="fr-FR"
      days
      hours
      minutes
      seconds
    ></use-duration-input>`,
};

export const German: Story = {
  render: () =>
    html`<use-duration-input
      value="P2DT3H4M5S"
      locale="de-DE"
      days
      hours
      minutes
      seconds
    ></use-duration-input>`,
};

export const Spanish: Story = {
  render: () =>
    html`<use-duration-input
      value="P2DT3H4M5S"
      locale="es-ES"
      days
      hours
      minutes
      seconds
    ></use-duration-input>`,
};

export const Japanese: Story = {
  render: () =>
    html`<use-duration-input
      value="P2DT3H4M5S"
      locale="ja-JP"
      days
      hours
      minutes
      seconds
    ></use-duration-input>`,
};

export const Chinese: Story = {
  render: () =>
    html`<use-duration-input
      value="P2DT3H4M5S"
      locale="zh-CN"
      days
      hours
      minutes
      seconds
    ></use-duration-input>`,
};

export const Arabic: Story = {
  render: () =>
    html`<use-duration-input
      dir="rtl"
      value="P2DT3H4M5S"
      locale="ar-SA"
      format="narrow"
      days
      hours
      minutes
      seconds
    ></use-duration-input>`,
};

export const Disabled: Story = {
  render: () =>
    html`<use-duration-input
      value="PT1H30M"
      disabled
      days
      hours
      minutes
      seconds
    ></use-duration-input>`,
};

export const ReadOnly: Story = {
  render: () =>
    html`<use-duration-input
      value="PT1H30M"
      readOnly
      days
      hours
      minutes
      seconds
    ></use-duration-input>`,
};

export const LongFormat: Story = {
  render: () =>
    html`<use-duration-input
      value="PT1H30M"
      format="long"
      days
      hours
      minutes
      seconds
    ></use-duration-input>`,
};

export const NarrowFormat: Story = {
  render: () =>
    html`<use-duration-input
      value="PT1H30M"
      format="narrow"
      days
      hours
      minutes
      seconds
    ></use-duration-input>`,
};

export const DigitalFormat: Story = {
  render: () =>
    html`<use-duration-input
      value="PT1H30M"
      format="digital"
      hours
      minutes
      seconds
      milliseconds
    ></use-duration-input>`,
};

export const CustomID: Story = {
  render: () =>
    html`<use-duration-input
      value="PT1H30M"
      id="custom-id"
      days
      hours
      minutes
      seconds
    ></use-duration-input>`,
};

export const CustomStyles: Story = {
  render: () => html`
    <style>
      .custom-duration {
        display: inline-flex;
        gap: 0.75rem;
        align-items: center;
        background: transparent;
        color: hotpink;
        border: 1px solid hotpink;
        border-radius: 0.5rem;
        padding: 0.25rem 0.5rem;

        &:focus-within {
          outline: 2px solid hotpink;
        }
      }

      .custom-duration::part(segment) {
        display: flex;
      }

      .custom-duration::part(segment-input) {
        all: unset;
        appearance: none;
        field-sizing: content;
        border-radius: 0.125rem;
        padding: 0 0.125rem;
      }

      .custom-duration::part(segment-input):focus,
      .custom-duration::selection {
        background-color: hotpink;
        color: white;
      }

      .custom-duration::part(segment-unit) {
        user-select: none;
      }
    </style>

    <label for="custom-duration">Custom duration</label><br />
    <use-duration-input
      id="custom-duration"
      class="custom-duration"
      value="PT1H30M"
      format="short"
      hours
      minutes
      seconds
      milliseconds
    ></use-duration-input>
  `,
};

export const ProgrammaticGetValue: Story = {
  render: () => {
    const handleClick = () => {
      const output = document.getElementById("value-output") as HTMLPreElement;
      const duration = document.getElementById("duration-value") as UseDurationInput;
      output.textContent = duration.value;
    };

    return html`
      <use-duration-input
        id="duration-value"
        value="PT1H30M"
        days
        hours
        minutes
        seconds
      ></use-duration-input>
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
        <use-duration-input
          value="PT1H30M"
          name="duration"
          days
          hours
          minutes
          seconds
        ></use-duration-input>
        <button type="submit">Submit</button>
      </form>
      <pre id="output"></pre>
    `;
  },
};

export const ProgrammaticSetValue: Story = {
  render: () => {
    const handleClick = () => {
      const duration = document.getElementById("duration-set-value") as UseDurationInput;
      duration.value = "PT2H30M";
    };

    return html`
      <use-duration-input
        id="duration-set-value"
        value="PT1H30M"
        hours
        minutes
      ></use-duration-input>
      <button type="button" @click=${handleClick}>Set value</button>
    `;
  },
};
