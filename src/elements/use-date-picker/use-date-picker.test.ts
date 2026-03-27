import { expect, describe, it } from 'vite-plus/test';
import { render } from 'vitest-browser-lit';
import { html } from 'lit';
import './use-date-picker';
import { UseDatePicker } from './use-date-picker';

describe('use-date-picker', () => {
  function getPicker() {
    return document.querySelector('use-date-picker') as UseDatePicker;
  }

  function getCell(picker: UseDatePicker, dateStr: string) {
    return picker.shadowRoot!.querySelector(`[data-usewc-date="${dateStr}"]`) as HTMLElement;
  }

  function getGridBody(picker: UseDatePicker) {
    return picker.shadowRoot!.querySelector('[part="grid-body"]') as HTMLElement;
  }

  function keydown(target: HTMLElement, key: string) {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, composed: true }));
  }

  describe('controls', () => {
    it('renders navigation buttons', async () => {
      render(html`<use-date-picker controls></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;
      const controls = picker.shadowRoot!.querySelectorAll('[part~="control"]');
      expect(controls.length).toBe(3);
    });

    it('goes to previous month', async () => {
      render(html`<use-date-picker year="2020" month="4" controls></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;
      picker.shadowRoot!.querySelector<HTMLButtonElement>('[part~="control-previous"]')!.click();
      await picker.updateComplete;
      expect(picker.month).toBe(3);
      expect(picker.year).toBe(2020);
    });

    it('goes to current month', async () => {
      const today = new Date();
      render(html`<use-date-picker year="2020" month="4" controls></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;
      picker.shadowRoot!.querySelector<HTMLButtonElement>('[part~="control-today"]')!.click();
      await picker.updateComplete;
      expect(picker.month).toBe(today.getMonth() + 1);
      expect(picker.year).toBe(today.getFullYear());
    });

    it('goes to next month', async () => {
      render(html`<use-date-picker year="2020" month="4" controls></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;
      picker.shadowRoot!.querySelector<HTMLButtonElement>('[part~="control-next"]')!.click();
      await picker.updateComplete;
      expect(picker.month).toBe(5);
      expect(picker.year).toBe(2020);
    });
  });

  describe('date selection', () => {
    it('clicking a day sets the value to YYYY-MM-DD', async () => {
      render(html`<use-date-picker year="2026" month="3"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;

      getCell(picker, '2026-03-15').click();
      await picker.updateComplete;

      expect(picker.value).toBe('2026-03-15');
    });

    it('dispatches use-change with value string', async () => {
      render(html`<use-date-picker year="2026" month="3"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;

      let detail: { value: string } | undefined;
      picker.addEventListener('use-change', (e) => (detail = (e as CustomEvent).detail), { once: true });

      getCell(picker, '2026-03-15').click();
      await picker.updateComplete;

      expect(detail!.value).toBe('2026-03-15');
    });

    it('selected cell has day-selected part', async () => {
      render(html`<use-date-picker year="2026" month="3"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;

      getCell(picker, '2026-03-15').click();
      await picker.updateComplete;

      expect(getCell(picker, '2026-03-15').getAttribute('part')).toContain('day-selected');
    });

    it('clicking a disabled date does not update value', async () => {
      render(html`<use-date-picker year="2026" month="3" min="2026-03-10"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;

      getCell(picker, '2026-03-05').click();
      await picker.updateComplete;

      expect(picker.value).toBe('');
    });

    it('value attribute sets the initial selection', async () => {
      render(html`<use-date-picker year="2026" month="3" value="2026-03-15"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;

      expect(picker.value).toBe('2026-03-15');
      expect(getCell(picker, '2026-03-15').getAttribute('part')).toContain('day-selected');
    });

    it('keyboard Enter selects the focused date', async () => {
      render(html`<use-date-picker year="2026" month="3"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;

      picker.focus();
      await picker.updateComplete;

      keydown(getGridBody(picker), 'Enter');
      await picker.updateComplete;

      expect(picker.value).toBe('2026-03-01');
    });

    it('keyboard Space selects the focused date', async () => {
      render(html`<use-date-picker year="2026" month="3"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;

      picker.focus();
      await picker.updateComplete;

      keydown(getGridBody(picker), ' ');
      await picker.updateComplete;

      expect(picker.value).toBe('2026-03-01');
    });
  });

  describe('month/year picker', () => {
    function getShadow(picker: UseDatePicker) {
      return picker.shadowRoot!;
    }

    function getTitleButton(picker: UseDatePicker) {
      return getShadow(picker).querySelector<HTMLButtonElement>('[part="title-button"]')!;
    }

    function getYearSectionBtns(picker: UseDatePicker, year: number) {
      const section = getShadow(picker).querySelector(`[data-picker-year="${year}"]`)!;
      return Array.from(section.querySelectorAll<HTMLButtonElement>('[part~="picker-month"]'));
    }

    function allPickerBtns(picker: UseDatePicker) {
      return Array.from(getShadow(picker).querySelectorAll<HTMLButtonElement>('[part~="picker-month"]'));
    }

    it('title button is present with aria-expanded="false" initially', async () => {
      render(html`<use-date-picker year="2025" month="6"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;

      const btn = getTitleButton(picker);
      expect(btn).toBeTruthy();
      expect(btn.getAttribute('aria-expanded')).toBe('false');
    });

    it('clicking the title button shows the picker and hides the day grid', async () => {
      render(html`<use-date-picker year="2025" month="6"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;

      expect(getShadow(picker).querySelector('[part="grid"]')).toBeTruthy();
      expect(getShadow(picker).querySelector('[part="picker"]')).toBeNull();

      getTitleButton(picker).click();
      await picker.updateComplete;

      expect(getShadow(picker).querySelector('[part="picker"]')).toBeTruthy();
      expect(getShadow(picker).querySelector('[part="grid"]')).toBeNull();
      expect(getTitleButton(picker).getAttribute('aria-expanded')).toBe('true');
    });

    it('clicking the title button again closes the picker', async () => {
      render(html`<use-date-picker year="2025" month="6"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;

      getTitleButton(picker).click();
      await picker.updateComplete;

      getTitleButton(picker).click();
      await picker.updateComplete;

      expect(getShadow(picker).querySelector('[part="picker"]')).toBeNull();
      expect(getShadow(picker).querySelector('[part="grid"]')).toBeTruthy();
    });

    it('clicking a month navigates to it and closes the picker', async () => {
      render(html`<use-date-picker year="2025" month="6"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;

      getTitleButton(picker).click();
      await picker.updateComplete;

      const yearBtns = getYearSectionBtns(picker, 2025);
      yearBtns[0].click();
      await picker.updateComplete;

      expect(picker.month).toBe(1);
      expect(picker.year).toBe(2025);
      expect(getShadow(picker).querySelector('[part="picker"]')).toBeNull();
    });

    it('Escape key closes the picker', async () => {
      render(html`<use-date-picker year="2025" month="6"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;

      getTitleButton(picker).click();
      await picker.updateComplete;

      picker.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
      await picker.updateComplete;

      expect(getShadow(picker).querySelector('[part="picker"]')).toBeNull();
    });

    it('with min set, picker starts from the min year', async () => {
      render(html`<use-date-picker year="2025" month="6" min="2024-03-01"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;
      getTitleButton(picker).click();
      await picker.updateComplete;

      const sections = getShadow(picker).querySelectorAll('[part="picker-year-section"]');
      const years = Array.from(sections).map((s) => Number(s.getAttribute('data-picker-year')));
      expect(years[0]).toBe(2024);
      expect(years).not.toContain(2023);
    });

    it('with max set, picker ends at the max year', async () => {
      render(html`<use-date-picker year="2025" month="6" max="2026-09-30"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;
      getTitleButton(picker).click();
      await picker.updateComplete;

      const sections = getShadow(picker).querySelectorAll('[part="picker-year-section"]');
      const years = Array.from(sections).map((s) => Number(s.getAttribute('data-picker-year')));
      expect(years[years.length - 1]).toBe(2026);
      expect(years).not.toContain(2027);
    });

    it('ArrowRight moves focus to the next month button', async () => {
      render(html`<use-date-picker year="2025" month="1"></use-date-picker>`);
      const picker = getPicker();
      await picker.updateComplete;

      getTitleButton(picker).click();
      await picker.updateComplete;

      const btns = allPickerBtns(picker);
      const janIdx = btns.indexOf(getYearSectionBtns(picker, 2025)[0]);
      btns[janIdx].focus();

      picker.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
      await picker.updateComplete;

      expect(getShadow(picker).activeElement).toBe(btns[janIdx + 1]);
    });
  });
});
