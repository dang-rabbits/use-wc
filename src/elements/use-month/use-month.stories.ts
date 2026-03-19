import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { UseMonth } from './use-month';

const meta: Meta<UseMonth> = {
  component: 'use-month',
  title: 'Web Components/use-month',
  tags: ['autodocs', '!dev', 'utility'],
  args: {},
  render: () => html`<use-month></use-month>`,
};

export default meta;

export const Default: StoryObj<UseMonth> = {};

/** A month can be pre-selected by setting the `value` attribute to an ISO 8601 `YYYY-MM` string. */
export const WithValue: StoryObj<UseMonth> = {
  render: () => html`<use-month value="2026-03"></use-month>`,
};

/**
 * Set the `locale` attribute to a BCP 47 locale tag to display month names in a different language.
 */
export const WithLocale: StoryObj<UseMonth> = {
  render: () => html`<use-month locale="fr-FR"></use-month>`,
};

/**
 * `min` and `max` constrain the selectable range to ISO 8601 `YYYY-MM` values.
 * Months outside the range are visually indicated and not selectable.
 * Year navigation buttons are disabled once the boundary year is reached.
 */
export const WithMinMax: StoryObj<UseMonth> = {
  render: () => html`<use-month min="2025-06" max="2027-03" year="2026"></use-month>`,
};

/**
 * `use-month` participates in native form submission.
 * The selected `YYYY-MM` value is submitted under the element's `name`.
 */
export const FormAssociated: StoryObj<UseMonth> = {
  render: () => html`
    <form
      @submit=${(e: SubmitEvent) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        alert(`billing-month = ${data.get('billing-month')}`);
      }}
    >
      <use-month name="billing-month" value="2026-03"></use-month>
      <button type="submit">Submit</button>
    </form>
  `,
};

/** When `disabled` is set, all interaction is prevented. */
export const Disabled: StoryObj<UseMonth> = {
  render: () => html`<use-month disabled value="2026-03"></use-month>`,
};

/**
 * The `navigation` attribute controls keyboard behaviour within the grid.
 * - `'on'` (default): arrow keys wrap across year boundaries (Dec → Jan of next year).
 * - `'nowrap'`: arrow keys clamp at January / December without year-crossing.
 * - `'off'`: keyboard navigation is disabled entirely.
 */
export const NavigationNowrap: StoryObj<UseMonth> = {
  render: () => html`<use-month navigation="nowrap" value="2026-03"></use-month>`,
};

export const NavigationOff: StoryObj<UseMonth> = {
  render: () => html`<use-month navigation="off" value="2026-03"></use-month>`,
};
