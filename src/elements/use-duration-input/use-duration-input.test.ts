import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";
import { userEvent } from "vite-plus/test/browser";
import "./use-duration-input";
import { UseDurationInput } from "./use-duration-input";

describe("use-duration-input", () => {
  function getDurationInput() {
    return document.querySelector("use-duration-input") as UseDurationInput;
  }

  function getSegmentInput(durationInput: UseDurationInput, segment: string) {
    return durationInput.shadowRoot!.querySelector(
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

  describe("segment labels", () => {
    it("labels segments with plural Intl-derived names and applies overrides", async () => {
      render(html`<use-duration-input lang="en" hours minutes></use-duration-input>`);
      const durationInput = getDurationInput();
      await durationInput.updateComplete;
      expect(getSegmentInput(durationInput, "hour").getAttribute("aria-label")).toBe("hours");
      durationInput.strings = { hour: "Hours spent" };
      await durationInput.updateComplete;
      expect(getSegmentInput(durationInput, "hour").getAttribute("aria-label")).toBe("Hours spent");
    });
  });

  describe("locale digits", () => {
    it("shows segments in the locale's numbering system and submits an ISO 8601 value", async () => {
      render(
        html`<form>
          <use-duration-input
            name="duration"
            lang="ar-SA"
            hours
            minutes
            value="PT2H30M"
          ></use-duration-input>
        </form>`,
      );
      const durationInput = getDurationInput();
      await durationInput.updateComplete;
      expect(getSegmentInput(durationInput, "hour").value).toBe("٢");
      expect(getSegmentInput(durationInput, "minute").value).toBe("٣٠");

      await userEvent.fill(getSegmentInput(durationInput, "hour"), "٥");
      await userEvent.fill(getSegmentInput(durationInput, "minute"), "15");

      expect(getSegmentInput(durationInput, "hour").value).toBe("٥");
      expect(getSegmentInput(durationInput, "minute").value).toBe("١٥");
      expect(durationInput.value).toBe("PT5H15M");
      expect(new FormData(document.querySelector("form")!).get("duration")).toBe("PT5H15M");
    });

    it("steps segments with the arrow keys without going below zero", async () => {
      render(html`<use-duration-input lang="ar-SA" hours value="PT1H"></use-duration-input>`);
      const durationInput = getDurationInput();
      await durationInput.updateComplete;
      const hourInput = getSegmentInput(durationInput, "hour");

      hourInput.focus();
      await userEvent.keyboard("{ArrowDown}");
      await userEvent.keyboard("{ArrowDown}");
      await durationInput.updateComplete;
      expect(hourInput.value).toBe("٠");
      expect(hourInput.getAttribute("aria-valuenow")).toBe("0");

      await userEvent.keyboard("{ArrowUp}");
      expect(hourInput.value).toBe("١");
      expect(durationInput.value).toBe("PT1H");
    });
  });

  describe("pasting", () => {
    it("fills every segment when an ISO 8601 duration is pasted", async () => {
      render(html`<use-duration-input lang="ar-SA" hours minutes></use-duration-input>`);
      const durationInput = getDurationInput();
      await durationInput.updateComplete;

      const event = paste(getSegmentInput(durationInput, "hour"), "PT3H15M");
      await durationInput.updateComplete;

      expect(event.defaultPrevented).toBe(true);
      expect(durationInput.value).toBe("PT3H15M");
      expect(getSegmentInput(durationInput, "minute").value).toBe("١٥");
    });

    it("cancels pasted text that is neither digits nor a duration", async () => {
      render(html`<use-duration-input hours value="PT1H"></use-duration-input>`);
      const durationInput = getDurationInput();
      await durationInput.updateComplete;

      const event = paste(getSegmentInput(durationInput, "hour"), "1.5");

      expect(event.defaultPrevented).toBe(true);
      expect(durationInput.value).toBe("PT1H");
    });
  });
});
