import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";
import { userEvent } from "vite-plus/test/browser";
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

  function paste(input: HTMLInputElement, text: string) {
    const dataTransfer = new DataTransfer();
    dataTransfer.setData("text/plain", text);
    const event = new InputEvent("beforeinput", {
      inputType: "insertFromPaste",
      dataTransfer,
      bubbles: true,
      composed: true,
      cancelable: true,
    });
    input.dispatchEvent(event);
    return event;
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

  describe("invalid value", () => {
    it("leaves segments empty instead of showing NaN", async () => {
      render(html`<use-date-input value="not-a-date"></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;
      expect(getSegmentInput(dateInput, "year").value).toBe("");
      expect(getSegmentInput(dateInput, "month").value).toBe("");
      expect(getSegmentInput(dateInput, "day").value).toBe("");
      expect(dateInput.value).not.toContain("NaN");
    });
  });

  describe("segment labels", () => {
    it("keeps lang as the native attribute and re-renders when it changes", async () => {
      render(html`<use-date-input></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;
      expect(dateInput.lang).toBe("");

      dateInput.lang = "fr";
      await dateInput.updateComplete;
      expect(dateInput.getAttribute("lang")).toBe("fr");
      expect(dateInput.locale).toBe("fr");
      expect(getSegmentInput(dateInput, "year").getAttribute("aria-label")).toBe("an");
    });

    it("labels segments with Intl-derived names for the lang", async () => {
      render(html`<use-date-input lang="fr"></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;
      expect(getSegmentInput(dateInput, "year").getAttribute("aria-label")).toBe("an");
    });

    it("applies per-element strings overrides", async () => {
      render(html`<use-date-input lang="en"></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;
      expect(getSegmentInput(dateInput, "year").getAttribute("aria-label")).toBe("year");
      dateInput.strings = { year: "Calendar year" };
      await dateInput.updateComplete;
      expect(getSegmentInput(dateInput, "year").getAttribute("aria-label")).toBe("Calendar year");
    });
  });

  describe("locale digits", () => {
    it("shows segments in the locale's numbering system", async () => {
      render(html`<use-date-input lang="ar-SA" value="2026-10-14"></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;
      expect(getSegmentInput(dateInput, "year").value).toBe("٢٠٢٦");
      expect(getSegmentInput(dateInput, "month").value).toBe("١٠");
      expect(getSegmentInput(dateInput, "day").value).toBe("١٤");
    });

    it("reads typed locale or Latin digits and submits a Latin ISO value", async () => {
      render(
        html`<form>
          <use-date-input name="date" lang="ar-SA" value="2026-10-14"></use-date-input>
        </form>`,
      );
      const dateInput = getDateInput();
      await dateInput.updateComplete;

      await userEvent.fill(getSegmentInput(dateInput, "month"), "٣");
      await userEvent.fill(getSegmentInput(dateInput, "day"), "7");

      expect(getSegmentInput(dateInput, "month").value).toBe("٣");
      expect(getSegmentInput(dateInput, "day").value).toBe("٧");
      expect(dateInput.value).toBe("2026-03-07");
      expect(new FormData(document.querySelector("form")!).get("date")).toBe("2026-03-07");
    });

    it("steps segments with the arrow keys within their range", async () => {
      render(html`<use-date-input lang="ar-SA" value="2026-10-31"></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;
      const dayInput = getSegmentInput(dateInput, "day");

      dayInput.focus();
      await userEvent.keyboard("{ArrowUp}");
      expect(dayInput.value).toBe("٣١");

      await userEvent.keyboard("{ArrowDown}");
      await dateInput.updateComplete;
      expect(dayInput.value).toBe("٣٠");
      expect(dayInput.getAttribute("aria-valuenow")).toBe("30");
      expect(dateInput.value).toBe("2026-10-30");
    });

    it("exposes segments as spin buttons", async () => {
      render(html`<use-date-input lang="ar-SA"></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;
      const monthInput = getSegmentInput(dateInput, "month");
      expect(monthInput.getAttribute("role")).toBe("spinbutton");
      expect(monthInput.inputMode).toBe("numeric");
      expect(monthInput.getAttribute("aria-valuemin")).toBe("1");
      expect(monthInput.getAttribute("aria-valuemax")).toBe("12");
    });
  });

  describe("typing and pasting", () => {
    it("reads full-width digits", async () => {
      render(html`<use-date-input lang="ja" value="2026-10-14"></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;

      await userEvent.fill(getSegmentInput(dateInput, "month"), "１２");

      expect(getSegmentInput(dateInput, "month").value).toBe("12");
      expect(dateInput.value).toBe("2026-12-14");
    });

    it("waits for composition to end before reading a segment", async () => {
      render(html`<use-date-input lang="ja" value="2026-10-14"></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;
      const monthInput = getSegmentInput(dateInput, "month");

      monthInput.value = "３";
      monthInput.dispatchEvent(new InputEvent("input", { isComposing: true, bubbles: true }));
      expect(monthInput.value).toBe("３");
      expect(dateInput.value).toBe("2026-10-14");

      monthInput.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
      expect(monthInput.value).toBe("3");
      expect(dateInput.value).toBe("2026-03-14");
    });

    it("ignores typed characters that are not digits", async () => {
      render(html`<use-date-input value="2026-10-14"></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;
      const dayInput = getSegmentInput(dateInput, "day");

      await userEvent.click(dayInput);
      await userEvent.keyboard("{End}.5");

      expect(dayInput.value).toBe("31");
      expect(dateInput.value).toBe("2026-10-31");
    });

    it("fills every segment when an ISO date is pasted", async () => {
      render(html`<use-date-input lang="ar-SA"></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;
      let inputEvent: InputEvent | undefined;
      dateInput.addEventListener("input", (event) => (inputEvent = event as InputEvent));

      const event = paste(getSegmentInput(dateInput, "day"), "٢٠٢٦-١٠-١٤");
      await dateInput.updateComplete;

      expect(event.defaultPrevented).toBe(true);
      expect(dateInput.value).toBe("2026-10-14");
      expect(getSegmentInput(dateInput, "year").value).toBe("٢٠٢٦");
      expect(getSegmentInput(dateInput, "day").getAttribute("aria-valuenow")).toBe("14");
      expect(inputEvent?.inputType).toBe("insertFromPaste");
    });

    it("takes the date from a pasted ISO date-time", async () => {
      render(html`<use-date-input></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;

      paste(getSegmentInput(dateInput, "year"), "2026-10-14T09:30:00Z");

      expect(dateInput.value).toBe("2026-10-14");
    });

    it("cancels pasted text that is neither digits nor an ISO date", async () => {
      render(html`<use-date-input value="2026-10-14"></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;

      const event = paste(getSegmentInput(dateInput, "year"), "2026-13-45");

      expect(event.defaultPrevented).toBe(true);
      expect(dateInput.value).toBe("2026-10-14");
    });

    it("lets pasted digits through", async () => {
      render(html`<use-date-input></use-date-input>`);
      const dateInput = getDateInput();
      await dateInput.updateComplete;

      expect(paste(getSegmentInput(dateInput, "year"), "2026").defaultPrevented).toBe(false);
    });
  });
});
