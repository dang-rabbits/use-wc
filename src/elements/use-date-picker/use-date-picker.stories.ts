import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { UseDatePicker } from './use-date-picker';

const meta: Meta<UseDatePicker> = {
  component: 'use-date-picker',
  title: 'Web Components/use-date-picker',
  tags: ['autodocs', '!dev', 'utility'],
  args: {},
  render: () => html`<use-date-picker></use-date-picker>`,
  subcomponents: { 'use-calendarday': 'use-calendarday' },
};

export default meta;

export const Default: StoryObj<UseDatePicker> = {};

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
    return html` <use-date-picker id="navigate-calendar" hiddenmonths="previous next"></use-date-picker> `;
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
        <use-date-picker year="2020" month="4" controls value="2025-04-25" name="perfect-date"></use-date-picker>
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
    return html`<use-date-picker start="2025-03-15" end="2025-05-15" year="2025" month="4" controls></use-date-picker>`;
  },
};
