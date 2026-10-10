import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";
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
});
