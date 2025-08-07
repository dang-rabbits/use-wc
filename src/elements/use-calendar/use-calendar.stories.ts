import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { UseCalendar, UseCalendarRenderDay } from './use-calendar';

const meta: Meta<UseCalendar> = {
  component: 'use-calendar',
  title: 'Web Components/use-calendar',
  tags: ['autodocs', '!dev', 'utility'],
  args: {},
  render: () => html`<use-calendar></use-calendar>`,
};

export default meta;

export const Default: StoryObj<UseCalendar> = {};

export const Controls: StoryObj<UseCalendar> = {
  render: () => {
    return html` <use-calendar id="navigate-calendar" controls></use-calendar> `;
  },
};

export const DisableNavigation: StoryObj<UseCalendar> = {
  render: () => {
    return html` <use-calendar id="navigate-calendar" navigation="off"></use-calendar> `;
  },
};

export const WidgetMode: StoryObj<UseCalendar> = {
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

export const CustomDayLabel: StoryObj<UseCalendar> = {
  render: () => {
    return html`
      <use-calendar year="2020" month="4" controls>
        <use-calendarday date="2020-04-16">
          <a href="#birthday" target="_self" slot="label">16</a>
        </use-calendarday>
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
