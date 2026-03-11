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

  describe('month/year picker', () => {
    function getCalendar() {
      return document.querySelector('use-calendar') as UseCalendar;
    }

    function getShadow(calendar: UseCalendar) {
      return calendar.shadowRoot!;
    }

    function getTitleButton(calendar: UseCalendar) {
      return getShadow(calendar).querySelector<HTMLButtonElement>('[part="title-button"]')!;
    }

    function getYearSectionBtns(calendar: UseCalendar, year: number) {
      const section = getShadow(calendar).querySelector(`[data-picker-year="${year}"]`)!;
      return Array.from(section.querySelectorAll<HTMLButtonElement>('[part~="picker-month"]'));
    }

    function allPickerBtns(calendar: UseCalendar) {
      return Array.from(getShadow(calendar).querySelectorAll<HTMLButtonElement>('[part~="picker-month"]'));
    }

    it('title button is present with aria-expanded="false" initially', async () => {
      render(html`<use-calendar year="2025" month="6"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      const btn = getTitleButton(calendar);
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });

    it('clicking the title button shows the picker and hides the day grid', async () => {
      render(html`<use-calendar year="2025" month="6"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      expect(getShadow(calendar).querySelector('[part="grid"]')).toBeTruthy();
      expect(getShadow(calendar).querySelector('[part="picker"]')).toBeNull();

      getTitleButton(calendar).click();
      await calendar.updateComplete;

      expect(getShadow(calendar).querySelector('[part="picker"]')).toBeTruthy();
      expect(getShadow(calendar).querySelector('[part="grid"]')).toBeNull();
      expect(getTitleButton(calendar).getAttribute('aria-expanded')).toBe('true');
    });

    it('clicking the title button again closes the picker and restores the day grid', async () => {
      render(html`<use-calendar year="2025" month="6"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getTitleButton(calendar).click();
      await calendar.updateComplete;

      getTitleButton(calendar).click();
      await calendar.updateComplete;

      expect(getShadow(calendar).querySelector('[part="picker"]')).toBeNull();
      expect(getShadow(calendar).querySelector('[part="grid"]')).toBeTruthy();
      expect(getTitleButton(calendar).getAttribute('aria-expanded')).toBe('false');
    });

    it('picker renders a year section for each year in range', async () => {
      render(html`<use-calendar year="2025" month="6"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getTitleButton(calendar).click();
      await calendar.updateComplete;

      const sections = getShadow(calendar).querySelectorAll('[part="picker-year-section"]');
      expect(sections.length).toBeGreaterThan(1);

      const yearBtns = getYearSectionBtns(calendar, 2025);
      expect(yearBtns.length).toBe(12);
    });

    it('current month button has aria-selected="true" and picker-month-current part', async () => {
      render(html`<use-calendar year="2025" month="6"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getTitleButton(calendar).click();
      await calendar.updateComplete;

      const currentBtn = getShadow(calendar).querySelector<HTMLButtonElement>('[part~="picker-month-current"]')!;
      expect(currentBtn.getAttribute('aria-selected')).toBe('true');
      expect(currentBtn.part.contains('picker-month-current')).toBe(true);

      const allBtns = allPickerBtns(calendar);
      allBtns.filter((b) => b !== currentBtn).forEach((btn) => {
        expect(btn.getAttribute('aria-selected')).toBe('false');
      });
    });

    it('clicking a month in the current year navigates to it and closes the picker', async () => {
      render(html`<use-calendar year="2025" month="6"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getTitleButton(calendar).click();
      await calendar.updateComplete;

      const yearBtns = getYearSectionBtns(calendar, 2025);
      yearBtns[0].click(); // January 2025
      await calendar.updateComplete;

      expect(calendar.month).toBe(1);
      expect(calendar.year).toBe(2025);
      expect(getShadow(calendar).querySelector('[part="picker"]')).toBeNull();
      expect(getShadow(calendar).querySelector('[part="grid"]')).toBeTruthy();
    });

    it('clicking a month in a different year section navigates to that year and month', async () => {
      render(html`<use-calendar year="2025" month="6"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getTitleButton(calendar).click();
      await calendar.updateComplete;

      const btns2026 = getYearSectionBtns(calendar, 2026);
      btns2026[2].click(); // March 2026
      await calendar.updateComplete;

      expect(calendar.month).toBe(3);
      expect(calendar.year).toBe(2026);
      expect(getShadow(calendar).querySelector('[part="picker"]')).toBeNull();
    });

    it('Escape key closes the picker', async () => {
      render(html`<use-calendar year="2025" month="6"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getTitleButton(calendar).click();
      await calendar.updateComplete;

      expect(getShadow(calendar).querySelector('[part="picker"]')).toBeTruthy();

      calendar.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
      await calendar.updateComplete;

      expect(getShadow(calendar).querySelector('[part="picker"]')).toBeNull();
      expect(getShadow(calendar).querySelector('[part="grid"]')).toBeTruthy();
    });

    it('ArrowRight moves focus to the next month button', async () => {
      render(html`<use-calendar year="2025" month="1"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getTitleButton(calendar).click();
      await calendar.updateComplete;

      const btns = allPickerBtns(calendar);
      const janIdx = btns.indexOf(getYearSectionBtns(calendar, 2025)[0]);
      btns[janIdx].focus();

      calendar.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
      await calendar.updateComplete;

      expect(getShadow(calendar).activeElement).toBe(btns[janIdx + 1]);
    });

    it('ArrowDown moves focus down one row (4 months)', async () => {
      render(html`<use-calendar year="2025" month="1"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getTitleButton(calendar).click();
      await calendar.updateComplete;

      const btns = allPickerBtns(calendar);
      const janIdx = btns.indexOf(getYearSectionBtns(calendar, 2025)[0]);
      btns[janIdx].focus();

      calendar.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
      await calendar.updateComplete;

      expect(getShadow(calendar).activeElement).toBe(btns[janIdx + 4]); // May
    });

    it('Home moves focus to January of the focused year section', async () => {
      render(html`<use-calendar year="2025" month="6"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getTitleButton(calendar).click();
      await calendar.updateComplete;

      const btns = allPickerBtns(calendar);
      const yearBtns = getYearSectionBtns(calendar, 2025);
      const junIdx = btns.indexOf(yearBtns[5]); // June
      btns[junIdx].focus();

      calendar.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true }));
      await calendar.updateComplete;

      expect(getShadow(calendar).activeElement).toBe(yearBtns[0]); // January
    });

    it('End moves focus to December of the focused year section', async () => {
      render(html`<use-calendar year="2025" month="1"></use-calendar>`);
      const calendar = getCalendar();
      await calendar.updateComplete;

      getTitleButton(calendar).click();
      await calendar.updateComplete;

      const btns = allPickerBtns(calendar);
      const yearBtns = getYearSectionBtns(calendar, 2025);
      const janIdx = btns.indexOf(yearBtns[0]);
      btns[janIdx].focus();

      calendar.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, composed: true }));
      await calendar.updateComplete;

      expect(getShadow(calendar).activeElement).toBe(yearBtns[11]); // December
    });
  });
});
