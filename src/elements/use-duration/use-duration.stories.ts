import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseDuration } from "./use-duration";

const meta: Meta<UseDuration> = {
  component: "use-duration",
  title: "Web Components/use-duration",
  tags: ["autodocs", "!dev", "input"],
  args: {},
  render: () => {
    return html`<use-duration value="PT1H30M" days hours minutes seconds></use-duration>`;
  },
};

export default meta;
type Story = StoryObj<UseDuration>;

export const Default: Story = {
  render: () => html`<use-duration value="PT1H30M" days hours minutes seconds></use-duration>`,
};

export const DaysHoursMinutesSeconds: Story = {
  render: () => html`<use-duration value="P2DT3H4M5S" days hours minutes seconds></use-duration>`,
};

export const OnlyMinutes: Story = {
  render: () => html`<use-duration value="PT45M" minutes></use-duration>`,
};

export const OnlySeconds: Story = {
  render: () => html`<use-duration value="PT20S" seconds></use-duration>`,
};

export const ZeroDuration: Story = {
  render: () => html`<use-duration value="PT0S" seconds></use-duration>`,
};

export const InvalidFormat: Story = {
  render: () => html`<use-duration value="notaduration" days hours minutes seconds></use-duration>`,
};

export const French: Story = {
  render: () =>
    html`<use-duration
      value="P2DT3H4M5S"
      locale="fr-FR"
      days
      hours
      minutes
      seconds
    ></use-duration>`,
};

export const German: Story = {
  render: () =>
    html`<use-duration
      value="P2DT3H4M5S"
      locale="de-DE"
      days
      hours
      minutes
      seconds
    ></use-duration>`,
};

export const Spanish: Story = {
  render: () =>
    html`<use-duration
      value="P2DT3H4M5S"
      locale="es-ES"
      days
      hours
      minutes
      seconds
    ></use-duration>`,
};

export const Japanese: Story = {
  render: () =>
    html`<use-duration
      value="P2DT3H4M5S"
      locale="ja-JP"
      days
      hours
      minutes
      seconds
    ></use-duration>`,
};

export const Chinese: Story = {
  render: () =>
    html`<use-duration
      value="P2DT3H4M5S"
      locale="zh-CN"
      days
      hours
      minutes
      seconds
    ></use-duration>`,
};

export const Arabic: Story = {
  render: () =>
    html`<use-duration
      dir="rtl"
      value="P2DT3H4M5S"
      locale="ar-SA"
      format="narrow"
      days
      hours
      minutes
      seconds
    ></use-duration>`,
};

export const Disabled: Story = {
  render: () =>
    html`<use-duration value="PT1H30M" disabled days hours minutes seconds></use-duration>`,
};

export const ReadOnly: Story = {
  render: () =>
    html`<use-duration value="PT1H30M" readOnly days hours minutes seconds></use-duration>`,
};

export const LongFormat: Story = {
  render: () =>
    html`<use-duration value="PT1H30M" format="long" days hours minutes seconds></use-duration>`,
};

export const NarrowFormat: Story = {
  render: () =>
    html`<use-duration value="PT1H30M" format="narrow" days hours minutes seconds></use-duration>`,
};

export const DigitalFormat: Story = {
  render: () =>
    html`<use-duration
      value="PT1H30M"
      format="digital"
      hours
      minutes
      seconds
      milliseconds
    ></use-duration>`,
};

export const CustomID: Story = {
  render: () =>
    html`<use-duration value="PT1H30M" id="custom-id" days hours minutes seconds></use-duration>`,
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
    <use-duration
      id="custom-duration"
      class="custom-duration"
      value="PT1H30M"
      format="short"
      hours
      minutes
      seconds
      milliseconds
    ></use-duration>
  `,
};

export const ProgrammaticGetValue: Story = {
  render: () => {
    const handleClick = () => {
      const output = document.getElementById("value-output") as HTMLPreElement;
      const duration = document.getElementById("duration-value") as UseDuration;
      output.textContent = duration.value;
    };

    return html`
      <use-duration id="duration-value" value="PT1H30M" days hours minutes seconds></use-duration>
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
        <use-duration value="PT1H30M" name="duration" days hours minutes seconds></use-duration>
        <button type="submit">Submit</button>
      </form>
      <pre id="output"></pre>
    `;
  },
};

export const ProgrammaticSetValue: Story = {
  render: () => {
    const handleClick = () => {
      const duration = document.getElementById("duration-set-value") as UseDuration;
      duration.value = "PT2H30M";
    };

    return html`
      <use-duration id="duration-set-value" value="PT1H30M" hours minutes></use-duration>
      <button type="button" @click=${handleClick}>Set value</button>
    `;
  },
};
