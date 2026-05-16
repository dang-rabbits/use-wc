import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";
import "./use-date-input";
import { UseDateInput } from "./use-date-input";

describe("use-date-input", () => {
  function getDateInput() {
    return document.querySelector("use-date-input") as UseDateInput;
  }

  function getSegmentInput(dateInput: UseDateInput, segment: string) {
    return dateInput.shadowRoot!.querySelector(
      `input[part~="segment-input-${segment}"]`,
    ) as HTMLInputElement;
  }

  function simulateInput(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  }

  describe("segment clamping", () => {
    it("clamps month value to 12 when a higher value is typed", async () => {
      render(html`<use-date-input></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;

      const monthInput = getSegmentInput(dateInput, "month");
      simulateInput(monthInput, "99");

      expect(monthInput.value).toBe("12");
    });

    it("clamps day value to 31 when a higher value is typed", async () => {
      render(html`<use-date-input></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;

      const dayInput = getSegmentInput(dateInput, "day");
      simulateInput(dayInput, "99");

      expect(dayInput.value).toBe("31");
    });

    it("allows year values greater than 31", async () => {
      render(html`<use-date-input></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;

      const yearInput = getSegmentInput(dateInput, "year");
      simulateInput(yearInput, "2099");

      expect(yearInput.value).toBe("2099");
    });

    it("does not clamp valid month values", async () => {
      render(html`<use-date-input></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;

      const monthInput = getSegmentInput(dateInput, "month");
      simulateInput(monthInput, "6");

      expect(monthInput.value).toBe("6");
    });
  });
});
