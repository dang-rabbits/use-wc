import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-week-picker";
import { UseWeekPicker } from "./use-week-picker";

describe("use-week-picker", () => {
  function getPicker() {
    return document.querySelector("use-week-picker") as UseWeekPicker;
  }

  function getCell(picker: UseWeekPicker, dateStr: string) {
    return picker.shadowRoot!.querySelector(`[data-usewc-date="${dateStr}"]`) as HTMLElement;
  }

  function getGridBody(picker: UseWeekPicker) {
    return picker.shadowRoot!.querySelector('[part="grid-body"]') as HTMLElement;
  }

  function keydown(target: HTMLElement, key: string) {
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, composed: true }));
  }

  it("clicking a day selects the full ISO Mon–Sun week", async () => {
    render(html`<use-week-picker year="2026" month="3"></use-week-picker>`);
    const picker = getPicker();
    await picker.updateComplete;

    getCell(picker, "2026-03-05").click();
    await picker.updateComplete;

    expect(picker.value).toBe("2026-W10");
  });

  it("clicking a sunday selects the ISO week ending on that sunday", async () => {
    render(html`<use-week-picker year="2026" month="3"></use-week-picker>`);
    const picker = getPicker();
    await picker.updateComplete;

    getCell(picker, "2026-03-01").click();
    await picker.updateComplete;

    expect(picker.value).toBe("2026-W09");
  });

  it("dispatches use-change with ISO week value and dates array", async () => {
    render(html`<use-week-picker year="2026" month="3"></use-week-picker>`);
    const picker = getPicker();
    await picker.updateComplete;

    let detail: { value: string; dates: string[] } | undefined;
    picker.addEventListener("use-change", (e) => (detail = (e as CustomEvent).detail), {
      once: true,
    });

    getCell(picker, "2026-03-05").click();
    await picker.updateComplete;

    expect(detail!.value).toBe("2026-W10");
    expect(detail!.dates).toEqual([
      "2026-03-02",
      "2026-03-03",
      "2026-03-04",
      "2026-03-05",
      "2026-03-06",
      "2026-03-07",
      "2026-03-08",
    ]);
  });

  it("setting value programmatically selects the ISO week", async () => {
    render(html`<use-week-picker year="2026" month="3" value="2026-W10"></use-week-picker>`);
    const picker = getPicker();
    await picker.updateComplete;

    const w10 = [
      "2026-03-02",
      "2026-03-03",
      "2026-03-04",
      "2026-03-05",
      "2026-03-06",
      "2026-03-07",
      "2026-03-08",
    ];
    for (const date of w10) {
      expect(getCell(picker, date)?.getAttribute("part")).toContain("day-selected");
    }
  });

  it("disabled dates are excluded from the selection but the ISO week value is still set", async () => {
    render(
      html`<use-week-picker
        year="2026"
        month="3"
        min="2026-03-04"
        max="2026-03-06"
      ></use-week-picker>`,
    );
    const picker = getPicker();
    await picker.updateComplete;

    let detail: { value: string; dates: string[] } | undefined;
    picker.addEventListener("use-change", (e) => (detail = (e as CustomEvent).detail), {
      once: true,
    });

    getCell(picker, "2026-03-05").click();
    await picker.updateComplete;

    expect(picker.value).toBe("2026-W10");
    expect(detail!.dates).toEqual(["2026-03-04", "2026-03-05", "2026-03-06"]);
  });

  it("a fully disabled week cannot be selected", async () => {
    render(html`<use-week-picker year="2026" month="3" min="2026-03-09"></use-week-picker>`);
    const picker = getPicker();
    await picker.updateComplete;

    getCell(picker, "2026-03-05").click();
    await picker.updateComplete;

    expect(picker.value).toBe("");
  });

  it("selected day cells have the day-selected part", async () => {
    render(html`<use-week-picker year="2026" month="3"></use-week-picker>`);
    const picker = getPicker();
    await picker.updateComplete;

    getCell(picker, "2026-03-05").click();
    await picker.updateComplete;

    const w10 = [
      "2026-03-02",
      "2026-03-03",
      "2026-03-04",
      "2026-03-05",
      "2026-03-06",
      "2026-03-07",
      "2026-03-08",
    ];
    for (const date of w10) {
      expect(getCell(picker, date)?.getAttribute("part")).toContain("day-selected");
    }
  });

  it("keyboard Enter on the focused date selects its ISO week", async () => {
    render(html`<use-week-picker year="2026" month="3"></use-week-picker>`);
    const picker = getPicker();
    await picker.updateComplete;

    picker.focus();
    await picker.updateComplete;

    keydown(getGridBody(picker), "Enter");
    await picker.updateComplete;

    expect(picker.value).toBe("2026-W09");
  });

  it("arrow key navigation then Enter selects the new week", async () => {
    render(html`<use-week-picker year="2026" month="3"></use-week-picker>`);
    const picker = getPicker();
    await picker.updateComplete;

    picker.focus();
    await picker.updateComplete;

    keydown(getGridBody(picker), "ArrowDown");
    await new Promise((r) => setTimeout(r, 50));

    keydown(getGridBody(picker), "Enter");
    await picker.updateComplete;

    expect(picker.value).toBe("2026-W10");
  });
});
