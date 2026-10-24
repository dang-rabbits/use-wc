import { describe, expect, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";
import "../elements/use-date-input/use-date-input";
import { UseDateInput } from "../elements/use-date-input/use-date-input";

describe("LocaleDigitsElement", () => {
  function getSegmentInput(dateInput: UseDateInput, segment: string) {
    return dateInput.shadowRoot!.querySelector(
      `input[part~="segment-input-${segment}"]`,
    ) as HTMLInputElement;
  }

  it("refreshes its digits when lang changes", async () => {
    render(html`<use-date-input lang="en-US" value="2026-10-14"></use-date-input>`);
    const dateInput = document.querySelector("use-date-input") as UseDateInput;
    await dateInput.updateComplete;
    expect(getSegmentInput(dateInput, "day").value).toBe("14");

    dateInput.lang = "ar-EG";
    await dateInput.updateComplete;
    expect(getSegmentInput(dateInput, "day").value).toBe("١٤");

    dateInput.lang = "en-US";
    await dateInput.updateComplete;
    expect(getSegmentInput(dateInput, "day").value).toBe("14");
  });

  it("refreshes its digits when the document lang changes", async () => {
    const documentLang = document.documentElement.lang;
    render(html`<use-date-input value="2026-10-14"></use-date-input>`);
    const dateInput = document.querySelector("use-date-input") as UseDateInput;
    try {
      document.documentElement.lang = "ar-EG";
      await new Promise((resolve) => setTimeout(resolve));
      await dateInput.updateComplete;
      expect(getSegmentInput(dateInput, "day").value).toBe("١٤");
    } finally {
      document.documentElement.lang = documentLang;
    }
  });
});
