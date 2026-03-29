import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-month-picker";
import { UseMonthPicker } from "./use-month-picker";

function getMonthPicker() {
  return document.querySelector("use-month-picker") as UseMonthPicker;
}

function getGrid(picker: UseMonthPicker) {
  return picker.shadowRoot!.querySelector('[part="grid"]') as HTMLElement;
}

function getMonthButtons(picker: UseMonthPicker): HTMLButtonElement[] {
  return Array.from(picker.shadowRoot!.querySelectorAll('[part~="month"]'));
}

function keydown(target: HTMLElement, key: string) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, composed: true }));
}

describe("use-month-picker", () => {
  describe("rendering", () => {
    it("renders 12 month buttons", async () => {
      render(html`<use-month-picker></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;
      expect(getMonthButtons(picker)).toHaveLength(12);
    });

    it("renders month names from locale", async () => {
      render(html`<use-month-picker locale="en-US"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;
      expect(picker.shadowRoot!.textContent).toContain("Jan");
      expect(picker.shadowRoot!.textContent).toContain("Dec");
    });

    it("displays the current year in the header", async () => {
      const year = new Date().getFullYear();
      render(html`<use-month-picker></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;
      expect(picker.shadowRoot!.querySelector('[part="title"]')!.textContent!.trim()).toBe(
        String(year),
      );
    });

    it("applies month-current part to the real-world current month", async () => {
      const today = new Date();
      render(html`<use-month-picker year=${today.getFullYear()}></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;
      const current = picker.shadowRoot!.querySelector('[part~="month-current"]');
      expect(current).not.toBeNull();
    });

    it("renders month names in the given locale", async () => {
      render(html`<use-month-picker lang="fr-FR"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;
      expect(picker.shadowRoot!.textContent).toContain("janv");
    });
  });

  describe("value", () => {
    it("pre-selects the month matching the value attribute", async () => {
      render(html`<use-month-picker value="2026-03" year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;
      const selected = picker.shadowRoot!.querySelector('[part~="month-selected"]');
      expect(selected).not.toBeNull();
      const btns = getMonthButtons(picker);
      expect(btns[2].part.contains("month-selected")).toBe(true);
    });

    it("exposes the selected value via the value getter", async () => {
      render(html`<use-month-picker value="2026-06" year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;
      expect(picker.value).toBe("2026-06");
    });

    it("returns empty string when nothing is selected", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;
      expect(picker.value).toBe("");
    });

    it("updates selection when value property is set programmatically", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      picker.value = "2026-09";
      await picker.updateComplete;

      const btns = getMonthButtons(picker);
      expect(btns[8].part.contains("month-selected")).toBe(true);
    });
  });

  describe("month selection", () => {
    it("clicking a month fires use-change with the YYYY-MM value", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      let detail: { value: string } | null = null;
      picker.addEventListener("use-change", (e) => (detail = (e as CustomEvent).detail), {
        once: true,
      });

      const btns = getMonthButtons(picker);
      btns[5].click();
      await picker.updateComplete;

      expect(detail).not.toBeNull();
      expect(detail!.value).toBe("2026-06");
    });

    it("clicking a month updates the value", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      getMonthButtons(picker)[0].click();
      await picker.updateComplete;

      expect(picker.value).toBe("2026-01");
    });

    it("clicking a disabled month does not change the value", async () => {
      render(html`<use-month-picker year="2026" min="2026-06" max="2026-09"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      getMonthButtons(picker)[0].click();
      await picker.updateComplete;

      expect(picker.value).toBe("");
    });

    it("use-change event bubbles and is composed", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      let captured: CustomEvent | undefined;
      document.addEventListener("use-change", (e) => (captured = e as CustomEvent), { once: true });

      getMonthButtons(picker)[0].click();

      expect(captured).not.toBeUndefined();
      expect(captured!.bubbles).toBe(true);
      expect(captured!.composed).toBe(true);
    });
  });

  describe("min/max", () => {
    it("months before min have month-disabled part", async () => {
      render(html`<use-month-picker year="2026" min="2026-06"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const btns = getMonthButtons(picker);
      for (let i = 0; i < 5; i++) {
        expect(btns[i].part.contains("month-disabled")).toBe(true);
      }
      expect(btns[5].part.contains("month-disabled")).toBe(false);
    });

    it("months after max have month-disabled part", async () => {
      render(html`<use-month-picker year="2026" max="2026-09"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const btns = getMonthButtons(picker);
      for (let i = 9; i < 12; i++) {
        expect(btns[i].part.contains("month-disabled")).toBe(true);
      }
      expect(btns[8].part.contains("month-disabled")).toBe(false);
    });

    it("previous-year button is disabled when already at min year", async () => {
      render(html`<use-month-picker year="2025" min="2025-01"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const prevBtn = picker.shadowRoot!.querySelector<HTMLButtonElement>(
        '[part~="control-previous"]',
      )!;
      expect(prevBtn.disabled).toBe(true);
    });

    it("next-year button is disabled when already at max year", async () => {
      render(html`<use-month-picker year="2027" max="2027-12"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const nextBtn =
        picker.shadowRoot!.querySelector<HTMLButtonElement>('[part~="control-next"]')!;
      expect(nextBtn.disabled).toBe(true);
    });
  });

  describe("year navigation", () => {
    it("next-year button increments the year", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      picker.shadowRoot!.querySelector<HTMLButtonElement>('[part~="control-next"]')!.click();
      await picker.updateComplete;

      expect(picker.year).toBe(2027);
      expect(picker.shadowRoot!.querySelector('[part="title"]')!.textContent!.trim()).toBe("2027");
    });

    it("previous-year button decrements the year", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      picker.shadowRoot!.querySelector<HTMLButtonElement>('[part~="control-previous"]')!.click();
      await picker.updateComplete;

      expect(picker.year).toBe(2025);
    });

    it("previousYear() method works programmatically", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      picker.previousYear();
      await picker.updateComplete;

      expect(picker.year).toBe(2025);
    });

    it("nextYear() method works programmatically", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      picker.nextYear();
      await picker.updateComplete;

      expect(picker.year).toBe(2027);
    });

    it("previousYear() does not go below min year", async () => {
      render(html`<use-month-picker year="2025" min="2025-01"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      picker.previousYear();
      await picker.updateComplete;

      expect(picker.year).toBe(2025);
    });

    it("nextYear() does not exceed max year", async () => {
      render(html`<use-month-picker year="2027" max="2027-12"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      picker.nextYear();
      await picker.updateComplete;

      expect(picker.year).toBe(2027);
    });
  });

  describe("keyboard navigation", () => {
    it("ArrowRight moves focus to the next month", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const btns = getMonthButtons(picker);
      btns[0].focus();
      keydown(getGrid(picker), "ArrowRight");

      expect(btns[1]).toBe(picker.shadowRoot!.activeElement);
    });

    it("ArrowLeft moves focus to the previous month", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const btns = getMonthButtons(picker);
      btns[5].focus();
      keydown(getGrid(picker), "ArrowLeft");

      expect(btns[4]).toBe(picker.shadowRoot!.activeElement);
    });

    it("ArrowDown moves focus down one row (+ 4 months)", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const btns = getMonthButtons(picker);
      btns[0].focus();
      keydown(getGrid(picker), "ArrowDown");

      expect(btns[4]).toBe(picker.shadowRoot!.activeElement);
    });

    it("ArrowUp moves focus up one row (- 4 months)", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const btns = getMonthButtons(picker);
      btns[8].focus();
      keydown(getGrid(picker), "ArrowUp");

      expect(btns[4]).toBe(picker.shadowRoot!.activeElement);
    });

    it("Home moves focus to January", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const btns = getMonthButtons(picker);
      btns[6].focus();
      keydown(getGrid(picker), "Home");

      expect(btns[0]).toBe(picker.shadowRoot!.activeElement);
    });

    it("End moves focus to December", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const btns = getMonthButtons(picker);
      btns[3].focus();
      keydown(getGrid(picker), "End");

      expect(btns[11]).toBe(picker.shadowRoot!.activeElement);
    });

    it("Enter selects the focused month", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const btns = getMonthButtons(picker);
      btns[7].focus();
      keydown(getGrid(picker), "Enter");
      await picker.updateComplete;

      expect(picker.value).toBe("2026-08");
    });

    it("Space selects the focused month", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const btns = getMonthButtons(picker);
      btns[2].focus();
      keydown(getGrid(picker), " ");
      await picker.updateComplete;

      expect(picker.value).toBe("2026-03");
    });

    it("PageDown navigates to the next year", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const btns = getMonthButtons(picker);
      btns[5].focus();
      keydown(getGrid(picker), "PageDown");
      await picker.updateComplete;

      expect(picker.year).toBe(2027);
    });

    it("PageUp navigates to the previous year", async () => {
      render(html`<use-month-picker year="2026"></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const btns = getMonthButtons(picker);
      btns[5].focus();
      keydown(getGrid(picker), "PageUp");
      await picker.updateComplete;

      expect(picker.year).toBe(2025);
    });
  });

  describe("disabled", () => {
    it("clicking a month does not change value when disabled", async () => {
      render(html`<use-month-picker year="2026" disabled></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;

      getMonthButtons(picker)[0].click();
      await picker.updateComplete;

      expect(picker.value).toBe("");
    });

    it("disabled reflects to :state(disabled)", async () => {
      render(html`<use-month-picker disabled></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;
      expect(picker.matches(":state(disabled)")).toBe(true);
    });

    it("disabled property getter returns true when disabled", async () => {
      render(html`<use-month-picker disabled></use-month-picker>`);
      const picker = getMonthPicker();
      await picker.updateComplete;
      expect(picker.disabled).toBe(true);
    });
  });

  describe("form association", () => {
    it("submits the selected value under the element name", async () => {
      render(html`
        <form id="test-form">
          <use-month-picker name="report-month" value="2026-04" year="2026"></use-month-picker>
        </form>
      `);
      const picker = getMonthPicker();
      await picker.updateComplete;

      const form = document.getElementById("test-form") as HTMLFormElement;
      const data = new FormData(form);
      expect(data.get("report-month")).toBe("2026-04");
    });

    it("formAssociated is true", () => {
      expect(UseMonthPicker.formAssociated).toBe(true);
    });

    it("updates the form value when selection changes", async () => {
      render(html`
        <form id="test-form2">
          <use-month-picker name="period" year="2026"></use-month-picker>
        </form>
      `);
      const picker = getMonthPicker();
      await picker.updateComplete;

      getMonthButtons(picker)[11].click();
      await picker.updateComplete;

      const form = document.getElementById("test-form2") as HTMLFormElement;
      const data = new FormData(form);
      expect(data.get("period")).toBe("2026-12");
    });
  });
});
