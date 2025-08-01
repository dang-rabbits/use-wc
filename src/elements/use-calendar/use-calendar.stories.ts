import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { UseCalendar } from './use-calendar';
import { useHtml } from '../../utils/use-html';

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

/** Add keyboard navigation to the calendar day cells */
export const Navigation: StoryObj<UseCalendar> = {
  render: () => {
    return html` <use-calendar id="navigate-calendar" navigation></use-calendar> `;
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

class CustomCalendar extends UseCalendar {
  renderDay({ day, date }: { day: number; date: string }) {
    return useHtml`<a href=${`#my-custom-link=${date}`} target="_self">${day}</a>`;
  }
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
 * For simplicity, and reducing risk of duplicate dependencies, `use-wc` exports lit's `html` function as `useHtml` and
 * can be imported via `import { useHtml } from 'use-wc';`
 *
 * Example:
 * ```ts
 * import { useHtml, UseCalendar } from 'use-wc';
 * class CustomCalendar extends UseCalendar {
 *   renderDay({ day, date }: { day: number; date: string }) {
 *     return partial`<a href=${`#my-custom-link=${date}`} target="_self">${day}</a>`;
 *   }
 * }
 * customElements.define('custom-calendar', CustomCalendar);
 * ```
 */
export const CustomDayTemplate: StoryObj<UseCalendar> = {
  render: () => {
    return html`<custom-calendar year="2020" month="4" controls> </custom-calendar>`;
  },
};
