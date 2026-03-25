import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { UseMonthPicker } from './use-month-picker';

const meta: Meta<UseMonthPicker> = {
  component: 'use-month-picker',
  title: 'Web Components/use-month-picker',
  tags: ['autodocs', '!dev', 'utility'],
  args: {},
  render: () => html`<use-month-picker></use-month-picker>`,
};

export default meta;

export const Default: StoryObj<UseMonthPicker> = {};

/** A month can be pre-selected by setting the `value` attribute to an ISO 8601 `YYYY-MM` string. */
export const WithValue: StoryObj<UseMonthPicker> = {
  render: () => html`<use-month-picker value="2026-03"></use-month-picker>`,
};

/**
 * Set the `locale` attribute to a BCP 47 locale tag to display month names in a different language.
 */
export const WithLocale: StoryObj<UseMonthPicker> = {
  render: () => html`<use-month-picker locale="fr-FR"></use-month-picker>`,
};

/**
 * `min` and `max` constrain the selectable range to ISO 8601 `YYYY-MM` values.
 * Months outside the range are visually indicated and not selectable.
 * Year navigation buttons are disabled once the boundary year is reached.
 */
export const WithMinMax: StoryObj<UseMonthPicker> = {
  render: () => html`<use-month-picker min="2025-06" max="2027-03" year="2026"></use-month-picker>`,
};

/**
 * `use-month-picker` participates in native form submission.
 * The selected `YYYY-MM` value is submitted under the element's `name`.
 */
export const FormAssociated: StoryObj<UseMonthPicker> = {
  render: () => html`
    <form
      @submit=${(e: SubmitEvent) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        alert(`billing-month = ${data.get('billing-month')}`);
      }}
    >
      <use-month-picker name="billing-month" value="2026-03"></use-month-picker>
      <button type="submit">Submit</button>
    </form>
  `,
};

/** When `disabled` is set, all interaction is prevented. */
export const Disabled: StoryObj<UseMonthPicker> = {
  render: () => html`<use-month-picker disabled value="2026-03"></use-month-picker>`,
};

/**
 * The `navigation` attribute controls keyboard behaviour within the grid.
 * - `'on'` (default): arrow keys wrap across year boundaries (Dec → Jan of next year).
 * - `'nowrap'`: arrow keys clamp at January / December without year-crossing.
 * - `'off'`: keyboard navigation is disabled entirely.
 */
export const NavigationNowrap: StoryObj<UseMonthPicker> = {
  render: () => html`<use-month-picker navigation="nowrap" value="2026-03"></use-month-picker>`,
};

export const NavigationOff: StoryObj<UseMonthPicker> = {
  render: () => html`<use-month-picker navigation="off" value="2026-03"></use-month-picker>`,
};
