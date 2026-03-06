import { expect, describe, it } from 'vitest';
import { render } from 'vitest-browser-lit';
import { html } from 'lit';
import { page } from 'vitest/browser';

import './use-calendar';
import { UseCalendar } from './use-calendar';

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

  describe('selectmode="week"', () => {
    function getCalendar() {
      return document.querySelector('use-calendar') as UseCalendar;
    }

    function getCell(calendar: UseCalendar, dateStr: string) {
      return calendar.shadowRoot!.querySelector(`[data-usewc-date="${dateStr}"]`) as HTMLElement;
    }

    function getGridBody(calendar: UseCalendar) {
      return calendar.shadowRoot!.querySelector('[part="grid-body"]') as HTMLElement;
    }

    function keydown(target: HTMLElement, key: string) {
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));
    }

    it('clicking a day selects the full ISO Mon–Sun week', async () => {
      render(html`<use-calendar selectmode="week" year="2026" month="3"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getCell(calendar, '2026-03-05').click();
      await calendar.updateComplete;

      expect(calendar.value).toBe('2026-W10');
    });

    it('clicking a sunday selects the ISO week ending on that sunday', async () => {
      render(html`<use-calendar selectmode="week" year="2026" month="3"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getCell(calendar, '2026-03-01').click();
      await calendar.updateComplete;

      expect(calendar.value).toBe('2026-W09');
    });

    it('dispatches use-change with ISO week value and dates array', async () => {
      render(html`<use-calendar selectmode="week" year="2026" month="3"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      let detail: { value: string; dates: string[] } | null = null;
      calendar.addEventListener('use-change', (e) => (detail = (e as CustomEvent).detail), { once: true });

      getCell(calendar, '2026-03-05').click();
      await calendar.updateComplete;

      expect(detail!.value).toBe('2026-W10');
      expect(detail!.dates).toEqual(['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07', '2026-03-08']);
    });

    it('setting value programmatically selects the ISO week', async () => {
      render(html`<use-calendar selectmode="week" year="2026" month="3" value="2026-W10"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      const w10 = ['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07', '2026-03-08'];
      for (const date of w10) {
        expect(getCell(calendar, date)?.getAttribute('part')).toContain('day-selected');
      }
    });

    it('disabled dates are excluded from the selection but the ISO week value is still set', async () => {
      render(html`<use-calendar selectmode="week" year="2026" month="3" min="2026-03-04" max="2026-03-06"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      let detail: { value: string; dates: string[] } | null = null;
      calendar.addEventListener('use-change', (e) => (detail = (e as CustomEvent).detail), { once: true });

      getCell(calendar, '2026-03-05').click();
      await calendar.updateComplete;

      expect(calendar.value).toBe('2026-W10');
      expect(detail!.dates).toEqual(['2026-03-04', '2026-03-05', '2026-03-06']);
    });

    it('a fully disabled week cannot be selected', async () => {
      render(html`<use-calendar selectmode="week" year="2026" month="3" min="2026-03-09"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getCell(calendar, '2026-03-05').click();
      await calendar.updateComplete;

      expect(calendar.value).toBe('');
    });

    it('selected day cells have the day-selected part', async () => {
      render(html`<use-calendar selectmode="week" year="2026" month="3"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getCell(calendar, '2026-03-05').click();
      await calendar.updateComplete;

      const w10 = ['2026-03-02', '2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07', '2026-03-08'];
      for (const date of w10) {
        expect(getCell(calendar, date)?.getAttribute('part')).toContain('day-selected');
      }
    });

    it('keyboard Enter on the focused date selects its ISO week', async () => {
      render(html`<use-calendar selectmode="week" year="2026" month="3"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      calendar.focus();
      await calendar.updateComplete;

      keydown(getGridBody(calendar), 'Enter');
      await calendar.updateComplete;

      expect(calendar.value).toBe('2026-W09');
    });

    it('arrow key navigation then Enter selects the new week', async () => {
      render(html`<use-calendar selectmode="week" year="2026" month="3"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      calendar.focus();
      await calendar.updateComplete;

      keydown(getGridBody(calendar), 'ArrowDown');
      await new Promise((r) => setTimeout(r, 50));

      keydown(getGridBody(calendar), 'Enter');
      await calendar.updateComplete;

      expect(calendar.value).toBe('2026-W10');
    });
  });
});
