import { expect, describe, it } from 'vitest';
import { render } from 'vitest-browser-lit';
import { html } from 'lit';
import { page } from 'vitest/browser';

import './use-calendar';

describe('use-calendar', () => {
  describe('controls', () => {
    it('renders navigation buttons', async () => {
      render(html`<use-calendar controls></use-calendar>`);
      expect(await page.getByRole('button')).toHaveLength(3);
    });

    it('goes to previous month', async () => {
      render(html`<use-calendar year="2020" month="4" controls></use-calendar>`);
      await page.getByRole('button').first().click();
      expect(await page.getByText('March')).toBeInTheDocument();
      expect(await page.getByText('2020')).toBeInTheDocument();
    });

    it('goes to current month', async () => {
      const today = new Date();
      const currentYear = today.getFullYear();
      const monthName = new Intl.DateTimeFormat('en', { month: 'long' }).format(today);

      render(html`<use-calendar year="2020" month="4" controls></use-calendar>`);
      await page.getByRole('button').nth(1).click();
      expect(page.getByText(monthName)).toBeInTheDocument();
      expect(page.getByText(currentYear.toString())).toBeInTheDocument();
    });

    it('goes to next month', async () => {
      render(html`<use-calendar year="2020" month="4" controls></use-calendar>`);
      await page.getByRole('button').last().click();
      expect(await page.getByText('May')).toBeInTheDocument();
      expect(await page.getByText('2020')).toBeInTheDocument();
    });
  });

  // describe('DisableNavigation', () => {
  //   it('should not allow selection when navigation is disabled', async () => {
  //     calendar.id = 'navigate-calendar';
  //     calendar.setAttribute('navigation', 'off');

  //     calendar.focus();
  //     await new Promise((resolve) => setTimeout(resolve, 50));

  //     const shadowRoot = calendar.shadowRoot!;
  //     const gridBody = shadowRoot.querySelector('[part="grid-body"]');
  //     expect(gridBody).toBeDefined();

  //     expect(calendar.getAttribute('navigation')).toBe('off');

  //     const dayCells = shadowRoot.querySelectorAll('[part="day"]');
  //     let firstSelectableCell: Element | null = null;

  //     for (const cell of dayCells) {
  //       if (cell.textContent?.trim() && /^\d+$/.test(cell.textContent.trim())) {
  //         firstSelectableCell = cell;
  //         break;
  //       }
  //     }

  //     expect(firstSelectableCell).toBeDefined();
  //     (firstSelectableCell as HTMLElement).click();
  //     await new Promise((resolve) => setTimeout(resolve, 100));

  //     expect(calendar.value).toHaveLength(0);
  //   });
  // });

  // describe('SingleValue', () => {
  //   it('should allow selecting a single date and submit in form', async () => {
  //     calendar.setAttribute('year', '2020');
  //     calendar.setAttribute('month', '4');
  //     calendar.setAttribute('controls', '');
  //     calendar.setAttribute('selectmode', 'single');
  //     calendar.setAttribute('value', '2025-04-25');
  //     calendar.setAttribute('name', 'perfect-date');

  //     await new Promise((resolve) => setTimeout(resolve, 50));
  //     const shadowRoot = calendar.shadowRoot!;

  //     const dayCells = shadowRoot.querySelectorAll('[part="day"]');
  //     let day15Cell: Element | null = null;

  //     for (const cell of dayCells) {
  //       if (cell.textContent?.trim() === '15') {
  //         day15Cell = cell;
  //         break;
  //       }
  //     }

  //     expect(day15Cell).toBeDefined();
  //     (day15Cell as HTMLElement).click();
  //     await new Promise((resolve) => setTimeout(resolve, 100));

  //     expect(calendar.value).toBe('2020-04-15');
  //   });
  // });

  // describe('SetValueProgrammatically', () => {
  //   it('should allow setting value programmatically', async () => {
  //     calendar.id = 'set-perfect-date';
  //     calendar.setAttribute('year', '2025');
  //     calendar.setAttribute('month', '4');
  //     calendar.setAttribute('selectmode', 'single');
  //     calendar.setAttribute('name', 'perfect-date');
  //     calendar.setAttribute('value', '2025-04-25');
  //     calendar.setAttribute('controls', '');

  //     await new Promise((resolve) => setTimeout(resolve, 50));

  //     expect(calendar.value).toBe('2025-04-25');

  //     calendar.value = '2025-04-16';
  //     await new Promise((resolve) => setTimeout(resolve, 100));

  //     expect(calendar.value).toBe('2025-04-16');

  //     calendar.value = '2025-04-10';
  //     await new Promise((resolve) => setTimeout(resolve, 100));

  //     expect(calendar.value).toBe('2025-04-10');
  //   });
  // });

  // describe('MinAndMaxDates', () => {
  //   it('should respect min and max date constraints', async () => {
  //     calendar.setAttribute('min', '2025-04-10');
  //     calendar.setAttribute('max', '2025-04-20');
  //     calendar.setAttribute('year', '2025');
  //     calendar.setAttribute('month', '4');
  //     calendar.setAttribute('value', '2025-04-15');
  //     calendar.setAttribute('controls', '');
  //     calendar.setAttribute('selectmode', 'single');

  //     await new Promise((resolve) => setTimeout(resolve, 50));
  //     const shadowRoot = calendar.shadowRoot!;

  //     const dayCells = shadowRoot.querySelectorAll('[part="day"]');
  //     const daysInRange: string[] = [];

  //     for (const cell of dayCells) {
  //       const text = cell.textContent?.trim();
  //       if (text && /^\d+$/.test(text)) {
  //         daysInRange.push(text);
  //       }
  //     }

  //     expect(daysInRange.length).toBeGreaterThan(0);
  //     expect(calendar.value).toBe('2025-04-15');

  //     let day12Cell: Element | null = null;
  //     for (const cell of dayCells) {
  //       if (cell.textContent?.trim() === '12') {
  //         day12Cell = cell;
  //         break;
  //       }
  //     }

  //     expect(day12Cell).toBeDefined();
  //     (day12Cell as HTMLElement).click();
  //     await new Promise((resolve) => setTimeout(resolve, 100));

  //     expect(calendar.value).toBe('2025-04-12');
  //   });
  // });
});
