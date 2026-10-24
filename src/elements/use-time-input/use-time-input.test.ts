import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";
import { userEvent } from "vite-plus/test/browser";
import "./use-time-input";
import { UseTimeInput } from "./use-time-input";

describe("use-time-input", () => {
  function getTimeInput() {
    return document.querySelector("use-time-input") as UseTimeInput;
  }

  function getSegmentInput(timeInput: UseTimeInput, segment: string) {
    return timeInput.shadowRoot!.querySelector(
      `input[part~="segment-input-${segment}"]`,
    ) as HTMLInputElement;
  }

  describe("segment labels", () => {
    it("labels segments with Intl-derived names", async () => {
      render(
        html`<use-time-input
          lang="en-US"
          hours
          minutes
          dayperiod
          hourformat="12"
        ></use-time-input>`,
      );
      const timeInput = getTimeInput();
      await timeInput.updateComplete;
      expect(getSegmentInput(timeInput, "hour").getAttribute("aria-label")).toBe("hours");
      expect(getSegmentInput(timeInput, "dayPeriod").getAttribute("aria-label")).toBe("AM/PM");
    });

    it("shows overridden day period names", async () => {
      render(
        html`<use-time-input
          lang="en-US"
          hours
          minutes
          dayperiod
          hourformat="12"
          value="21:15"
        ></use-time-input>`,
      );
      const timeInput = getTimeInput();
      await timeInput.updateComplete;
      expect(getSegmentInput(timeInput, "dayPeriod").value).toBe("PM");
      timeInput.strings = { pm: "p.m.", hour: "Hour" };
      await timeInput.updateComplete;
      expect(getSegmentInput(timeInput, "dayPeriod").value).toBe("p.m.");
      expect(getSegmentInput(timeInput, "hour").getAttribute("aria-label")).toBe("Hour");
    });
  });

  describe("locale digits", () => {
    it("shows segments in the locale's numbering system", async () => {
      render(
        html`<use-time-input
          lang="ar-SA"
          hours
          minutes
          hourformat="24"
          value="14:05"
        ></use-time-input>`,
      );
      const timeInput = getTimeInput();
      await timeInput.updateComplete;
      expect(getSegmentInput(timeInput, "hour").value).toBe("١٤");
      expect(getSegmentInput(timeInput, "minute").value).toBe("٠٥");
    });

    it("reads typed locale or Latin digits and submits a Latin value", async () => {
      render(
        html`<form>
          <use-time-input
            name="time"
            lang="ar-SA"
            hours
            minutes
            hourformat="24"
            value="14:05"
          ></use-time-input>
        </form>`,
      );
      const timeInput = getTimeInput();
      await timeInput.updateComplete;

      await userEvent.fill(getSegmentInput(timeInput, "hour"), "٩");
      await userEvent.fill(getSegmentInput(timeInput, "minute"), "7");

      expect(getSegmentInput(timeInput, "hour").value).toBe("٠٩");
      expect(getSegmentInput(timeInput, "minute").value).toBe("٠٧");
      expect(timeInput.value).toBe("09:07");
      expect(new FormData(document.querySelector("form")!).get("time")).toBe("09:07");
    });

    it("rewrites edited segments in the new locale's digits when lang changes", async () => {
      render(
        html`<use-time-input
          lang="en-US"
          hours
          minutes
          hourformat="24"
          value="14:05"
        ></use-time-input>`,
      );
      const timeInput = getTimeInput();
      await timeInput.updateComplete;

      await userEvent.fill(getSegmentInput(timeInput, "minute"), "7");
      timeInput.lang = "ar-EG";
      await timeInput.updateComplete;

      expect(getSegmentInput(timeInput, "hour").value).toBe("١٤");
      expect(getSegmentInput(timeInput, "minute").value).toBe("٠٧");
      expect(timeInput.value).toBe("14:07");
    });

    it("steps segments with the arrow keys within their range", async () => {
      render(
        html`<use-time-input
          lang="ar-SA"
          hours
          minutes
          hourformat="24"
          value="14:59"
        ></use-time-input>`,
      );
      const timeInput = getTimeInput();
      await timeInput.updateComplete;
      const minuteInput = getSegmentInput(timeInput, "minute");

      minuteInput.focus();
      await userEvent.keyboard("{ArrowUp}");
      expect(minuteInput.value).toBe("٥٩");

      await userEvent.keyboard("{ArrowDown}");
      await timeInput.updateComplete;
      expect(minuteInput.value).toBe("٥٨");
      expect(minuteInput.getAttribute("aria-valuenow")).toBe("58");
      expect(timeInput.value).toBe("14:58");
    });
  });
});
