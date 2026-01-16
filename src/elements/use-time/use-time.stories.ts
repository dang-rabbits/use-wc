import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { UseTime } from './use-time';

const meta: Meta<UseTime> = {
  component: 'use-time',
  title: 'Web Components/use-time',
  tags: ['autodocs', '!dev', 'input'],
  args: {},
  render: () => {
    return html`<use-time value="12:30:45"></use-time>`;
  },
};

export default meta;
type Story = StoryObj<UseTime>;

export const Default: Story = {
  render: () => html`<use-time value="12:30:45"></use-time>`,
};

export const WithoutValue: Story = {
  render: () => html`<use-time></use-time>`,
};

export const OnlyHoursMinutes: Story = {
  render: () => html`<use-time value="14:30" hours minutes></use-time>`,
};

export const OnlyHours: Story = {
  render: () => html`<use-time value="09:00:00" hours></use-time>`,
};

export const OnlyMinutes: Story = {
  render: () => html`<use-time value="00:45:00" minutes></use-time>`,
};

export const OnlySeconds: Story = {
  render: () => html`<use-time value="00:00:30" seconds></use-time>`,
};

export const OnlyDayPeriod: Story = {
  render: () => html`<use-time value="12:00:00" dayPeriod></use-time>`,
};

export const Midnight: Story = {
  render: () => html`<use-time value="00:00:00"></use-time>`,
};

export const InvalidFormat: Story = {
  render: () => html`<use-time value="notatime"></use-time>`,
};

export const French: Story = {
  render: () => html`<use-time value="14:30:45" locale="fr-FR"></use-time>`,
};

export const German: Story = {
  render: () => html`<use-time value="14:30:45" locale="de-DE"></use-time>`,
};

export const Spanish: Story = {
  render: () => html`<use-time value="14:30:45" locale="es-ES"></use-time>`,
};

export const Japanese: Story = {
  render: () => html`<use-time value="14:30:45" locale="ja-JP"></use-time>`,
};

export const Chinese: Story = {
  render: () => html`<use-time value="14:30:45" locale="zh-CN"></use-time>`,
};

export const Arabic: Story = {
  render: () =>
    html`<use-time dir="rtl" value="14:30:45" locale="ar-SA" format="narrow"></use-time>`,
};

export const Disabled: Story = {
  render: () => html`<use-time value="12:30:45" disabled></use-time>`,
};

export const ReadOnly: Story = {
  render: () => html`<use-time value="12:30:45" readOnly></use-time>`,
};

export const LongFormat: Story = {
  render: () => html`<use-time value="12:30:45" format="long"></use-time>`,
};

export const NarrowFormat: Story = {
  render: () => html`<use-time value="12:30:45" format="narrow"></use-time>`,
};

export const DigitalFormat: Story = {
  render: () => html`<use-time value="12:30:45" format="digital" hours minutes seconds dayPeriod></use-time>`,
};

export const Hour12: Story = {
  render: () => html`<use-time value="14:30:45" hourFormat="12" hours minutes seconds dayPeriod></use-time>`,
};

export const Hour24: Story = {
  render: () => html`<use-time value="14:30:45" hourFormat="24" hours minutes seconds dayPeriod></use-time>`,
};

export const FractionalSeconds: Story = {
  render: () => html`<use-time value="12:30:45.123" hours minutes seconds fractionalSeconds dayPeriod></use-time>`,
};

export const CustomID: Story = {
  render: () => html`<use-time value="12:30:45" id="custom-id" hours minutes seconds dayPeriod></use-time>`,
};

export const CustomStyles: Story = {
  render: () => html`
    <style>
      .custom-time {
        display: inline-flex;
        gap: 0.125rem;
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

      .custom-time::part(segment) {
        display: flex;
      }

      .custom-time::part(segment-input) {
        all: unset;
        appearance: none;
        field-sizing: content;
        border-radius: 0.125rem;
        padding: 0 0.125rem;
      }

      .custom-time::part(segment-input):focus,
      .custom-time::selection {
        background-color: hotpink;
        color: white;
      }

      .custom-time::part(segment-unit) {
        user-select: none;
      }
    </style>

    <label for="custom-time">Custom time</label><br />
    <use-time
      id="custom-time"
      class="custom-time"
      value="12:30:45"
      format="short"
      hours
      minutes
      seconds
      dayPeriod
    ></use-time>
  `,
};

export const ProgrammaticGetValue: Story = {
  render: () => {
    const handleClick = () => {
      const output = document.getElementById('value-output') as HTMLPreElement;
      const time = document.getElementById('time-value') as UseTime;
      output.textContent = time.value;
    };

    return html`
      <use-time id="time-value" value="12:30:45"></use-time>
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
      const output = document.getElementById('output') as HTMLPreElement;
      output.textContent = queryString;
    };

    const handleSetValue = () => {
      const time = document.getElementById('time-set-form') as UseTime;
      time.value = '15:45:30';
    };

    return html`
      <form @submit=${handleSubmit} id="form-submission">
        <use-time value="10:30:45" id="time-set-form" name="time" hours minutes seconds dayperiod></use-time>
        <button type="submit">Submit</button>
      </form>
      <button type="button" @click=${handleSetValue}>Set value</button>
      <pre id="output"></pre>
    `;
  },
};

export const ProgrammaticSetValue: Story = {
  render: () => {
    const handleClick = () => {
      const time = document.getElementById('time-set-value') as UseTime;
      time.value = '15:45:30';
    };

    return html`
      <use-time id="time-set-value" value="10:30:45"></use-time>
      <button type="button" @click=${handleClick}>Set value</button>
    `;
  },
};
