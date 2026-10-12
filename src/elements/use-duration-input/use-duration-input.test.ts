import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";
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
});
