import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { UseCalendar, UseCalendarRenderDay } from './use-calendar';

const meta: Meta<UseCalendar> = {
  component: 'use-calendar',
  title: 'Web Components/use-calendar',
  tags: ['autodocs', '!dev', 'utility'],
  args: {},
  render: () => html`<use-calendar></use-calendar>`,
  subcomponents: { 'use-calendarday': 'use-calendarday' },
};

export default meta;

export const Default: StoryObj<UseCalendar> = {};

export const Controls: StoryObj<UseCalendar> = {
  render: () => {
    return html`<use-calendar id="navigate-calendar" controls></use-calendar>`;
  },
};

/** Turning off navigation should only be done when selectmode is not enabled */
export const DisableNavigation: StoryObj<UseCalendar> = {
  render: () => {
    return html` <use-calendar id="navigate-calendar" navigation="off"></use-calendar> `;
  },
};

export const DisableWrapNavigation: StoryObj<UseCalendar> = {
  render: () => {
    return html` <use-calendar id="navigate-calendar" navigation="nowrap"></use-calendar> `;
  },
};

export const HiddenMonths: StoryObj<UseCalendar> = {
  render: () => {
    return html` <use-calendar id="navigate-calendar" hiddenmonths="previous next"></use-calendar> `;
  },
};

/**
 * `use-calendar` will automatically remove all nested controls from the tab
 * flow and reenable them when the user navigates to their parent cell.
 */
export const NestedCellControls: StoryObj<UseCalendar> = {
  render: () => {
    return html`
      <use-calendar id="widget-calendar" mode="widget" year="2025" month="4">
        <use-calendarday date="2025-04-16">
          <button type="button">First</button>
          <button type="button">Second</button>
          <button type="button">Third</button>
        </use-calendarday>
      </use-calendar>
    `;
  },
};

/**
 * When your cells have a single control then you can set the `focusmode`
 * attribute to `control` to focus on the control when the user navigates to
 * the cell.
 */
export const FocusMode: StoryObj<UseCalendar> = {
  render: () => {
    return html`
      <use-calendar year="2020" month="4" controls focusmode="control">
        <use-calendarday date="2020-04-16">
          <a href="#birthday" target="_self" slot="label">16</a>
        </use-calendarday>
      </use-calendar>
    `;
  },
};

/** The `calendar.goTo()` method can be used to focus on a specific date. */
export const FocusOnSpecificDate: StoryObj<UseCalendar> = {
  render: () => {
    const handleClick = () => {
      const calendar = document.querySelector('#focus-calendar') as UseCalendar;
      calendar.goTo('2025-04-16');
    };

    return html`
      <use-calendar id="focus-calendar"></use-calendar>
      <button @click=${handleClick}>Go to 2025-04-16</button>
    `;
  },
};

export const CustomDayContent: StoryObj<UseCalendar> = {
  render: () => {
    return html`
      <use-calendar year="2020" month="4" controls>
        <use-calendarday date="2020-05-07">😍</use-calendarday>
        <use-calendarday date="2020-04-16">🥳</use-calendarday>
        <use-calendarday date="2020-06-28">🏴‍☠️</use-calendarday>
        <use-calendarday date="2020-10-18">🌷</use-calendarday>
      </use-calendar>
    `;
  },
};

export const SingleValue: StoryObj<UseCalendar> = {
  render: () => {
    const handleSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      const formData = new FormData(event.target as HTMLFormElement);
      // @ts-expect-error - https://github.com/microsoft/TypeScript/issues/30584
      const queryString = decodeURIComponent(new URLSearchParams(formData).toString());
      const output = document.getElementById('single-value-output') as HTMLPreElement;
      output.textContent = queryString;
    };

    return html`
      <form @submit=${handleSubmit}>
        <use-calendar
          year="2020"
          month="4"
          controls
          selectmode="single"
          value="2025-04-25"
          name="perfect-date"
        ></use-calendar>
        <button type="submit">Submit</button>
      </form>
      <pre id="single-value-output"></pre>
    `;
  },
};

export const SetValueProgrammatically: StoryObj<UseCalendar> = {
  render: () => {
    const handleClick = () => {
      const calendar = document.querySelector('#set-perfect-date') as UseCalendar;
      calendar.value = '2025-04-16';
    };

    return html`
      <use-calendar
        id="set-perfect-date"
        year="2025"
        month="4"
        selectmode="single"
        name="perfect-date"
        value="2025-04-25"
        controls
      ></use-calendar>
      <button @click=${handleClick}>Set Value</button>
    `;
  },
};

export const MinAndMaxDates: StoryObj<UseCalendar> = {
  render: () => {
    return html`<use-calendar
      min="2025-04-10"
      max="2025-04-20"
      year="2025"
      month="4"
      value="2025-04-15"
      controls
      selectmode="single"
    ></use-calendar>`;
  },
};

/**
 * The `start` and `end` attributes can be used to limit the visible range of
 * the calendar.
 */
export const StartAndEndDates: StoryObj<UseCalendar> = {
  render: () => {
    return html`<use-calendar start="2025-03-15" end="2025-05-15" year="2025" month="4" controls></use-calendar>`;
  },
};

export const StartAndEndDatesUsingMinAndMax: StoryObj<UseCalendar> = {
  render: () => {
    return html`<use-calendar
      min="2025-03-15"
      max="2025-05-15"
      start="min"
      end="max"
      year="2025"
      month="4"
      controls
    ></use-calendar>`;
  },
};

class CustomCalendar extends UseCalendar {
  renderDay: UseCalendarRenderDay = ({ day, date }, html) => {
    return html`<a href=${`#my-custom-link=${date}`} target="_self">${day}</a>`;
  };
}
customElements.define('custom-calendar', CustomCalendar);

/**
 * To build a custom cell template you must extend the `UseCalendar` class and override the `renderDay` method.
 * The `renderDay` method is called for each day in the calendar and should return a `TemplateResult` or a `string`.
 * The `TemplateResult` is a Lit template result and can be used to render a custom cell template.
 * The `string` is a plain string and will be rendered as is.
 *
 * ```ts
 * {
 *   day: number;
 *   date: string;
 * }
 * ```
 *
 * Example:
 * ```ts
 * import { UseCalendar, UseCalendarRenderDay } from 'use-wc';
 * class CustomCalendar extends UseCalendar {
 *   renderDay: UseCalendarRenderDay = ({ day, date }, html) => {
 *     return html`<a href=${`#my-custom-link=${date}`} target="_self">${day}</a>`;
 *   };
 * }
 * customElements.define('custom-calendar', CustomCalendar);
 * ```
 *
 * #### Note on approach
 *
 * This approach of extending the web component base class goes against the
 * HTML-first intent of the `use-wc` library. Unfortunately, there isn't a
 * native HTML approach for element attribute and content interpolation, which
 * is critical for building a custom cell template to suit all needs.
 */
export const CustomDayTemplate: StoryObj<UseCalendar> = {
  render: () => {
    return html`<custom-calendar year="2020" month="4" controls focusmode="control"> </custom-calendar>`;
  },
};

export const ProgrammaticallyAddDayInfo: StoryObj<UseCalendar> = {
  render: () => {
    const handleClick = () => {
      const calendar = document.querySelector('#programmatically-add-day-info-calendar') as UseCalendar;
      const day = document.createElement('use-calendarday');
      day.date = '2020-04-16';
      day.innerHTML = 'This is a custom day';
      calendar.appendChild(day);
    };

    return html`
      <use-calendar
        id="programmatically-add-day-info-calendar"
        year="2020"
        month="4"
        controls
        focusmode="control"
      ></use-calendar>
      <button @click=${handleClick}>Add Day Info</button>
    `;
  },
};

/**
 * When the value for the `use-calendar` component is manually changed by
 * interaction then a custom `use-change` event is emitted (programmatically
 * changing the value will not emit the event):
 *
 * ```ts
 * {
 *   value: string;
 *   valueAsDate: Date;
 * }
 * ```
 *
 * ```ts
 * const calendar = document.querySelector('use-calendar');
 * calendar.addEventListener('use-change', (event) => {
 *   console.log(event.detail.value);
 * });
 * ```
 */
export const ChangeEvent: StoryObj<UseCalendar> = {
  render: () => {
    const handleChange = (event: CustomEvent<{ value: string }>) => {
      const output = document.getElementById('change-event-output') as HTMLPreElement;
      output.textContent = event.detail.value;
    };

    return html`
      <use-calendar selectmode="single" value="" controls @use-change=${handleChange}></use-calendar>
      <pre id="change-event-output"></pre>
    `;
  },
};

/**
 * US English locale starts the week on Sunday.
 */
export const LocaleStartOfWeekSunday: StoryObj<UseCalendar> = {
  render: () => {
    return html`<use-calendar locale="en-US" year="2026" month="3" controls></use-calendar>`;
  },
};

/**
 * UK English and most European locales start the week on Monday.
 */
export const LocaleStartOfWeekMonday: StoryObj<UseCalendar> = {
  render: () => {
    return html`<use-calendar locale="en-GB" year="2026" month="3" controls></use-calendar>`;
  },
};

/**
 * French locale starts the week on Monday with French day/month names.
 */
export const LocaleFrench: StoryObj<UseCalendar> = {
  render: () => {
    return html`<use-calendar locale="fr-FR" year="2026" month="3" controls></use-calendar>`;
  },
};

/**
 * Persian (Iran) locale starts the week on Saturday with Farsi day names.
 */
export const LocaleStartOfWeekSaturday: StoryObj<UseCalendar> = {
  render: () => {
    return html`<use-calendar locale="fa-IR" year="2026" month="3" controls></use-calendar>`;
  },
};

/**
 * Arabic (Saudi Arabia) locale with right-to-left day names.
 */
export const LocaleArabic: StoryObj<UseCalendar> = {
  render: () => {
    return html`<use-calendar locale="ar-SA" year="2026" month="3" controls></use-calendar>`;
  },
};

/**
 * Japanese locale starts the week on Sunday with Japanese day/month names.
 */
export const LocaleJapanese: StoryObj<UseCalendar> = {
  render: () => {
    return html`<use-calendar locale="ja-JP" year="2026" month="3" controls></use-calendar>`;
  },
};

/**
 * Side-by-side comparison of the same month across multiple locales,
 * showing how the first day of the week shifts the grid layout.
 */
export const LocaleComparison: StoryObj<UseCalendar> = {
  render: () => {
    const locales = [
      { code: 'en-US', label: 'US (Sunday)' },
      { code: 'en-GB', label: 'UK (Monday)' },
      { code: 'fa-IR', label: 'Persian (Saturday)' },
    ];

    return html`
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2rem;max-width:900px">
        ${locales.map(
          ({ code, label }) => html`
            <div>
              <strong>${label}</strong>
              <use-calendar locale=${code} year="2026" month="3" controls></use-calendar>
            </div>
          `
        )}
      </div>
    `;
  },
};

/**
 * Week selection mode — clicking any day selects the entire week row.
 * The value is an ISO 8601 week string (`YYYY-Www`), matching `<input type="week">`.
 */
export const WeekSelection: StoryObj<UseCalendar> = {
  render: () => {
    const handleChange = (event: CustomEvent<{ value: string; dates: string[] }>) => {
      const output = document.getElementById('week-selection-output') as HTMLPreElement;
      output.textContent = JSON.stringify({ value: event.detail.value, dates: event.detail.dates }, null, 2);
    };

    return html`
      <use-calendar selectmode="week" controls year="2026" month="3" @use-change=${handleChange}></use-calendar>
      <pre id="week-selection-output"></pre>
    `;
  },
};

/**
 * Week selection with form submission — the form value is a single `YYYY-Www` string.
 */
export const WeekSelectionForm: StoryObj<UseCalendar> = {
  render: () => {
    const handleSubmit = (event: SubmitEvent) => {
      event.preventDefault();
      const formData = new FormData(event.target as HTMLFormElement);
      // @ts-expect-error - https://github.com/microsoft/TypeScript/issues/30584
      const queryString = decodeURIComponent(new URLSearchParams(formData).toString());
      const output = document.getElementById('week-selection-form-output') as HTMLPreElement;
      output.textContent = queryString;
    };

    return html`
      <form @submit=${handleSubmit}>
        <use-calendar selectmode="week" controls year="2026" month="3" name="week"></use-calendar>
        <button type="submit">Submit</button>
      </form>
      <pre id="week-selection-form-output"></pre>
    `;
  },
};

/**
 * Week selection with a Monday-first locale (`en-GB`). The visual rows and the
 * ISO 8601 week (Mon–Sun) align perfectly, so the hover and selection
 * highlights always span a single row.
 */
export const WeekSelectionLocale: StoryObj<UseCalendar> = {
  render: () => {
    const handleChange = (event: CustomEvent<{ value: string; dates: string[] }>) => {
      const output = document.getElementById('week-selection-locale-output') as HTMLPreElement;
      output.textContent = JSON.stringify({ value: event.detail.value, dates: event.detail.dates }, null, 2);
    };

    return html`
      <use-calendar
        selectmode="week"
        controls
        locale="en-GB"
        year="2026"
        month="3"
        @use-change=${handleChange}
      ></use-calendar>
      <pre id="week-selection-locale-output"></pre>
    `;
  },
};

/**
 * Week selection with `min`/`max` constraints. Weeks where all dates are
 * disabled cannot be selected. Partial weeks highlight only the enabled days.
 */
export const WeekSelectionMinMax: StoryObj<UseCalendar> = {
  render: () => {
    const handleChange = (event: CustomEvent<{ value: string; dates: string[] }>) => {
      const output = document.getElementById('week-selection-minmax-output') as HTMLPreElement;
      output.textContent = JSON.stringify({ value: event.detail.value, dates: event.detail.dates }, null, 2);
    };

    return html`
      <use-calendar
        selectmode="week"
        controls
        year="2026"
        month="3"
        min="2026-03-05"
        max="2026-03-25"
        @use-change=${handleChange}
      ></use-calendar>
      <pre id="week-selection-minmax-output"></pre>
    `;
  },
};

export const CustomStyles: StoryObj<UseCalendar> = {
  render: () => {
    return html`
      <style>
        .custom-styles {
          color: white;
          max-width: 400px;
          margin: 0 auto;
          gap: 1px;
          padding: 0.25rem;
          border-radius: 0.5rem;
          background-image: linear-gradient(15deg, salmon, hotpink);
        }

        .custom-styles::part(header) {
          padding-inline-start: 0.75rem;
          padding-inline-end: 0.25rem;
          padding-block: 0.25rem 0.5rem;
          border-bottom: 1px dotted rgba(255, 255, 255, 0.5);
        }

        .custom-styles::part(title) {
          font-size: 1.25rem;
        }

        .custom-styles::part(grid-header-cell) {
          padding-block: 0.5rem;
          font-weight: bold;
        }

        .custom-styles::part(controls) {
          display: flex;
          gap: 0.0625rem;
          align-items: center;
        }

        .custom-styles::part(control) {
          appearance: none;
          border: none;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.125);
          color: white;
          cursor: pointer;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1rem;
          aspect-ratio: 1;
          height: 2rem;
        }

        .custom-styles::part(control-previous) {
          border-top-left-radius: 50%;
          border-bottom-left-radius: 50%;
        }

        .custom-styles::part(control-next) {
          border-top-right-radius: 50%;
          border-bottom-right-radius: 50%;
        }

        .custom-styles::part(control):is(:hover, :focus) {
          background: rgba(255, 255, 255, 0.25);
        }

        .custom-styles::part(day) {
          cursor: default;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: calc(0.5rem - 0.125rem);
        }

        .custom-styles::part(day):is(:hover, :focus) {
          background-color: rgba(255, 255, 255, 0.125);
        }

        .custom-styles::part(day):is(:focus-visible) {
          outline: 2px solid #fff;
        }

        .custom-styles::part(day-empty) {
          opacity: 0.5;
        }

        .custom-styles::part(day-today) {
          font-weight: 900;
        }

        .custom-styles::part(day-selected):is(:hover, :focus),
        .custom-styles::part(day-selected) {
          background-color: white;
          color: #f3007e;
        }
      </style>
      <use-calendar selectmode="single" controls class="custom-styles"></use-calendar>
    `;
  },
};

