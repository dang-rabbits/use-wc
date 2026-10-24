import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";
import { userEvent } from "vite-plus/test/browser";
import "./use-datetime-input";
import { UseDatetimeInput } from "./use-datetime-input";

describe("use-datetime-input", () => {
  function getSegmentInput(datetimeInput: UseDatetimeInput, element: string, segment: string) {
    return datetimeInput
      .shadowRoot!.querySelector(element)!
      .shadowRoot!.querySelector(`input[part~="segment-input-${segment}"]`) as HTMLInputElement;
  }

  describe("locale digits", () => {
    it("reads locale digits and submits a Latin ISO value", async () => {
      render(
        html`<form>
          <use-datetime-input
            name="datetime"
            lang="ar-SA"
            hours
            minutes
            hourformat="24"
          ></use-datetime-input>
        </form>`,
      );
      const datetimeInput = document.querySelector("use-datetime-input") as UseDatetimeInput;
      await datetimeInput.updateComplete;

      await userEvent.fill(getSegmentInput(datetimeInput, "use-date-input", "year"), "٢٠٢٦");
      await userEvent.fill(getSegmentInput(datetimeInput, "use-date-input", "month"), "١٠");
      await userEvent.fill(getSegmentInput(datetimeInput, "use-date-input", "day"), "١٤");
      await userEvent.fill(getSegmentInput(datetimeInput, "use-time-input", "hour"), "١٤");
      await userEvent.fill(getSegmentInput(datetimeInput, "use-time-input", "minute"), "٠٥");

      expect(getSegmentInput(datetimeInput, "use-time-input", "minute").value).toBe("٠٥");
      expect(datetimeInput.value).toBe("2026-10-14T14:05");
      expect(new FormData(document.querySelector("form")!).get("datetime")).toBe(
        "2026-10-14T14:05",
      );
    });
  });
});
