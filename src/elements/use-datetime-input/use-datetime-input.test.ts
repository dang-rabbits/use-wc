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

  it("passes its initial value to the date and time inputs", async () => {
    render(
      html`<use-datetime-input
        hours
        minutes
        hourformat="24"
        value="2026-10-14T14:05"
      ></use-datetime-input>`,
    );
    const datetimeInput = document.querySelector("use-datetime-input") as UseDatetimeInput;
    await datetimeInput.updateComplete;

    expect(getSegmentInput(datetimeInput, "use-date-input", "day").value).toBe("14");
    expect(getSegmentInput(datetimeInput, "use-time-input", "minute").value).toBe("05");
  });

  it("fills the date and time when an ISO date-time is pasted into either", async () => {
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

    const event = paste(
      getSegmentInput(datetimeInput, "use-date-input", "month"),
      "٢٠٢٦-١٠-١٤T١٤:٠٥",
    );

    expect(event.defaultPrevented).toBe(true);
    expect(datetimeInput.value).toBe("2026-10-14T14:05");
    expect(getSegmentInput(datetimeInput, "use-time-input", "minute").value).toBe("٠٥");
    expect(new FormData(document.querySelector("form")!).get("datetime")).toBe("2026-10-14T14:05");
  });

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
