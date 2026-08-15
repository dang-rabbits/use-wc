import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { UseDatePicker } from "./use-date-picker";

@customElement("demo-date-picker-render-day")
class DemoDatePickerRenderDay extends UseDatePicker {
  renderDay(data: { day: number; date: string }, h: typeof html) {
    const isWeekend = new Date(`${data.date}T00:00:00`).getDay() % 6 === 0;
    return isWeekend ? h`<strong>${data.day}</strong>` : super.renderDay(data, h);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-date-picker-render-day": DemoDatePickerRenderDay;
  }
}

const meta: Meta<UseDatePicker> = {
  component: "use-date-picker",
  title: "Web Components/use-date-picker",
  tags: ["autodocs", "!dev", "utility"],
  args: {},
  render: () => html`<use-date-picker></use-date-picker>`,
  subcomponents: { "use-calendarday": "use-calendarday" },
};

export default meta;

export const Default: StoryObj<UseDatePicker> = {};

export const Theme: StoryObj<UseDatePicker> = {
  ...Default,
  parameters: { ...Default.parameters, allowTheme: true },
};

export const Controls: StoryObj<UseDatePicker> = {
  render: () => {
    return html`<use-date-picker id="navigate-calendar" controls></use-date-picker>`;
  },
};

/** Turning off navigation should only be done when selection is not needed */
export const DisableNavigation: StoryObj<UseDatePicker> = {
  render: () => {
    return html` <use-date-picker id="navigate-calendar" navigation="off"></use-date-picker> `;
  },
};

export const DisableWrapNavigation: StoryObj<UseDatePicker> = {
  render: () => {
    return html` <use-date-picker id="navigate-calendar" navigation="nowrap"></use-date-picker> `;
  },
};

export const HiddenMonths: StoryObj<UseDatePicker> = {
  render: () => {
    return html`
      <use-date-picker id="navigate-calendar" hiddenmonths="previous next"></use-date-picker>
    `;
  },
};

/**
 * When your cells have a single control then you can set the `focusmode`
 * attribute to `control` to focus on the control when the user navigates to
 * the cell.
 */
export const FocusMode: StoryObj<UseDatePicker> = {
  render: () => {
    return html`
      <use-date-picker year="2020" month="4" controls focusmode="control">
        <use-calendarday date="2020-04-16">
          <a href="#birthday" target="_self" slot="label">16</a>
        </use-calendarday>
      </use-date-picker>
    `;
  },
};

/**
 * `use-date-picker` will automatically remove all nested controls from the tab
 * flow and reenable them when the user navigates to their parent cell.
 */
export const NestedCellControls: StoryObj<UseDatePicker> = {
  render: () => {
    return html`
      <use-date-picker id="widget-calendar" mode="widget" year="2025" month="4">
        <use-calendarday date="2025-04-16">
          <button type="button">First</button>
          <button type="button">Second</button>
          <button type="button">Third</button>
        </use-calendarday>
      </use-date-picker>
    `;
  },
};

export const WithValue: StoryObj<UseDatePicker> = {
  render: () => {
    return html`
      <form>
        <use-date-picker
          year="2020"
          month="4"
          controls
          value="2025-04-25"
          name="perfect-date"
        ></use-date-picker>
        <button type="submit">Submit</button>
      </form>
    `;
  },
};

export const MinAndMaxDates: StoryObj<UseDatePicker> = {
  render: () => {
    return html`<use-date-picker
      min="2025-04-10"
      max="2025-04-20"
      year="2025"
      month="4"
      value="2025-04-15"
      controls
    ></use-date-picker>`;
  },
};

/**
 * The `start` and `end` attributes can be used to limit the visible range of
 * the calendar.
 */
export const StartAndEndDates: StoryObj<UseDatePicker> = {
  render: () => {
    return html`<use-date-picker
      start="2025-03-15"
      end="2025-05-15"
      year="2025"
      month="4"
      controls
    ></use-date-picker>`;
  },
};

/**
 * The `renderDay` property accepts a function `({ day, date }, html) => TemplateResult | string`
 * that replaces the default day number inside every cell, including leading and trailing
 * cells from the adjacent month. Use it to add badges, links, or any inline markup per day.
 */
export const CustomRenderer: StoryObj<UseDatePicker> = {
  render: () => {
    const holidays: Record<string, string> = {
      "2026-03-17": "🍀",
      "2026-03-25": "🎉",
    };
    return html`
      <use-date-picker
        year="2026"
        month="3"
        .renderDay=${({ day, date }: { day: number; date: string }, h: typeof html) =>
          holidays[date] ? h`${day}<span>&nbsp;${holidays[date]}</span>` : String(day)}
      ></use-date-picker>
    `;
  },
};

/**
 * Named slots (`date-YYYY-MM-DD`) let you inject per-date content from light DOM
 * without touching JavaScript. The slot replaces whatever `renderDay` returns.
 */
export const NamedSlots: StoryObj<UseDatePicker> = {
  render: () => html`
    <use-date-picker year="2026" month="3">
      <span slot="date-2026-03-01" title="First of the month">1️⃣</span>
      <span slot="date-2026-03-17" title="St. Patrick's Day">🍀</span>
    </use-date-picker>
  `,
};

/**
 * To customize day rendering for every instance of a date picker in your app, extend
 * `UseDatePicker` and override `renderDay` on the subclass instead of setting the
 * property per instance. The `html` argument works the same way inside the override,
 * and `super.renderDay(data, html)` falls back to the default (or parent override's)
 * rendering for dates you don't want to customize.
 */
export const SubclassOverride: StoryObj<UseDatePicker> = {
  render: () =>
    html`<demo-date-picker-render-day year="2026" month="3"></demo-date-picker-render-day>`,
};
