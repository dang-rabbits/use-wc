import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { UseWeekPicker } from "./use-week-picker";

const meta: Meta<UseWeekPicker> = {
  component: "use-week-picker",
  title: "Web Components/use-week-picker",
  tags: ["autodocs", "!dev", "utility"],
  args: {},
  render: () => html`<use-week-picker controls year="2026" month="3"></use-week-picker>`,
};

export default meta;

export const Default: StoryObj<UseWeekPicker> = {};

export const Theme: StoryObj<UseWeekPicker> = {
  ...Default,
  parameters: { ...Default.parameters, allowTheme: true },
};

export const Controls: StoryObj<UseWeekPicker> = {
  render: () => {
    const handleChange = (event: CustomEvent<{ value: string; dates: string[] }>) => {
      const output = document.getElementById("week-picker-controls-output") as HTMLPreElement;
      output.textContent = JSON.stringify(
        { value: event.detail.value, dates: event.detail.dates },
        null,
        2,
      );
    };

    return html`
      <use-week-picker controls year="2026" month="3" @use-change=${handleChange}></use-week-picker>
      <pre id="week-picker-controls-output"></pre>
    `;
  },
};

/**
 * In a right-to-left layout, set with `dir="rtl"` on the element or an ancestor, the previous and next
 * controls swap sides and their arrows mirror, and ArrowLeft and ArrowRight follow the visual direction.
 */
export const RightToLeft: StoryObj<UseWeekPicker> = {
  render: () => html`<use-week-picker dir="rtl" locale="ar-SA" controls></use-week-picker>`,
};

/**
 * A week can be pre-selected by setting the `value` attribute to an ISO 8601
 * week string (`YYYY-Www`).
 */
export const WithValue: StoryObj<UseWeekPicker> = {
  render: () => {
    return html`<use-week-picker
      controls
      year="2026"
      month="3"
      value="2026-W11"
    ></use-week-picker>`;
  },
};

/**
 * `min` and `max` constrain selectable dates. Weeks where all dates are
 * disabled cannot be selected. Partial weeks highlight only the enabled days.
 */
export const MinAndMaxDates: StoryObj<UseWeekPicker> = {
  render: () => {
    const handleChange = (event: CustomEvent<{ value: string; dates: string[] }>) => {
      const output = document.getElementById("week-picker-minmax-output") as HTMLPreElement;
      output.textContent = JSON.stringify(
        { value: event.detail.value, dates: event.detail.dates },
        null,
        2,
      );
    };

    return html`
      <use-week-picker
        controls
        year="2026"
        month="3"
        min="2026-03-05"
        max="2026-03-25"
        @use-change=${handleChange}
      ></use-week-picker>
      <pre id="week-picker-minmax-output"></pre>
    `;
  },
};
