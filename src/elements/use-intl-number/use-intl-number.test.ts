import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-intl-number";
import { UseIntlNumber } from "./use-intl-number";

function getDataElement(element: UseIntlNumber): HTMLDataElement {
  return element.shadowRoot!.querySelector("data")!;
}

describe("use-intl-number", () => {
  describe("decimal style (default)", () => {
    it("renders a data element with a numeric value attribute", async () => {
      render(html`<use-intl-number value="1234.5" lang="en-US"></use-intl-number>`);
      const element = document.querySelector("use-intl-number") as UseIntlNumber;
      await element.updateComplete;
      expect(getDataElement(element).getAttribute("value")).toBe("1234.5");
    });

    it("formats the number using the locale", async () => {
      render(html`<use-intl-number value="1234.5" lang="en-US"></use-intl-number>`);
      const element = document.querySelector("use-intl-number") as UseIntlNumber;
      await element.updateComplete;
      expect(getDataElement(element).textContent).toBe("1,234.5");
    });

    it("defaults to decimal style when style value is unrecognized", async () => {
      render(html`
        <use-intl-number id="empty" numberstyle="" value="1234.5" lang="en-US"></use-intl-number>
        <use-intl-number
          id="decimal"
          numberstyle="decimal"
          value="1234.5"
          lang="en-US"
        ></use-intl-number>
      `);
      const emptyElement = document.querySelector("#empty") as UseIntlNumber;
      const decimalElement = document.querySelector("#decimal") as UseIntlNumber;
      await emptyElement.updateComplete;
      await decimalElement.updateComplete;
      expect(getDataElement(emptyElement).textContent).toBe(
        getDataElement(decimalElement).textContent,
      );
    });
  });

  describe("percent style", () => {
    it("formats a fraction as a percentage", async () => {
      render(
        html`<use-intl-number numberstyle="percent" value="0.42" lang="en-US"></use-intl-number>`,
      );
      const element = document.querySelector("use-intl-number") as UseIntlNumber;
      await element.updateComplete;
      expect(getDataElement(element).textContent).toBe("42%");
    });
  });

  describe("currency style", () => {
    it("formats the amount using the locale and currency", async () => {
      render(
        html`<use-intl-number
          numberstyle="currency"
          currency="USD"
          value="1234.5"
          lang="en-US"
        ></use-intl-number>`,
      );
      const element = document.querySelector("use-intl-number") as UseIntlNumber;
      await element.updateComplete;
      expect(getDataElement(element).textContent).toContain("$");
      expect(getDataElement(element).textContent).toContain("1,234.50");
    });

    it("clears the data element when currency is missing", async () => {
      render(
        html`<use-intl-number
          numberstyle="currency"
          value="1234.5"
          lang="en-US"
        ></use-intl-number>`,
      );
      const element = document.querySelector("use-intl-number") as UseIntlNumber;
      await element.updateComplete;
      expect(getDataElement(element).textContent).toBe("");
      expect(getDataElement(element).hasAttribute("value")).toBe(false);
    });

    it("renders the currency code instead of a symbol", async () => {
      render(
        html`<use-intl-number
          numberstyle="currency"
          currency="USD"
          currencydisplay="code"
          value="1234.5"
          lang="en-US"
        ></use-intl-number>`,
      );
      const element = document.querySelector("use-intl-number") as UseIntlNumber;
      await element.updateComplete;
      expect(getDataElement(element).textContent).toContain("USD");
    });

    it("wraps negative amounts in parentheses when currencysign is accounting", async () => {
      render(
        html`<use-intl-number
          numberstyle="currency"
          currency="USD"
          currencysign="accounting"
          value="-1234.5"
          lang="en-US"
        ></use-intl-number>`,
      );
      const element = document.querySelector("use-intl-number") as UseIntlNumber;
      await element.updateComplete;
      expect(getDataElement(element).textContent).toContain("(");
      expect(getDataElement(element).textContent).not.toContain("-");
    });

    it("hides the sign on negative values when signdisplay is never", async () => {
      render(
        html`<use-intl-number
          numberstyle="currency"
          currency="USD"
          signdisplay="never"
          value="-1234.5"
          lang="en-US"
        ></use-intl-number>`,
      );
      const element = document.querySelector("use-intl-number") as UseIntlNumber;
      await element.updateComplete;
      expect(getDataElement(element).textContent).not.toContain("-");
    });
  });

  describe("unit style", () => {
    it("formats the amount with the given unit", async () => {
      render(
        html`<use-intl-number
          numberstyle="unit"
          unit="kilometer-per-hour"
          value="80"
          lang="en-US"
        ></use-intl-number>`,
      );
      const element = document.querySelector("use-intl-number") as UseIntlNumber;
      await element.updateComplete;
      expect(getDataElement(element).textContent).toContain("80");
      expect(getDataElement(element).textContent).toContain("km/h");
    });

    it("clears the data element when unit is missing", async () => {
      render(html`<use-intl-number numberstyle="unit" value="80" lang="en-US"></use-intl-number>`);
      const element = document.querySelector("use-intl-number") as UseIntlNumber;
      await element.updateComplete;
      expect(getDataElement(element).textContent).toBe("");
      expect(getDataElement(element).hasAttribute("value")).toBe(false);
    });

    it("uses the long form when unitdisplay is long", async () => {
      render(
        html`<use-intl-number
          numberstyle="unit"
          unit="kilometer-per-hour"
          unitdisplay="long"
          value="80"
          lang="en-US"
        ></use-intl-number>`,
      );
      const element = document.querySelector("use-intl-number") as UseIntlNumber;
      await element.updateComplete;
      expect(getDataElement(element).textContent).toContain("kilometers per hour");
    });
  });

  describe("lang attribute", () => {
    it("produces different output for different locales", async () => {
      render(html`
        <use-intl-number
          id="en"
          numberstyle="currency"
          currency="USD"
          value="1234.5"
          lang="en-US"
        ></use-intl-number>
        <use-intl-number
          id="de"
          numberstyle="currency"
          currency="EUR"
          value="1234.5"
          lang="de-DE"
        ></use-intl-number>
      `);
      const englishElement = document.querySelector("#en") as UseIntlNumber;
      const germanElement = document.querySelector("#de") as UseIntlNumber;
      await englishElement.updateComplete;
      await germanElement.updateComplete;
      expect(getDataElement(englishElement).textContent).not.toBe(
        getDataElement(germanElement).textContent,
      );
    });
  });

  describe("attribute changes", () => {
    it("re-renders when the value attribute changes", async () => {
      render(html`<use-intl-number value="1234.5" lang="en-US"></use-intl-number>`);
      const element = document.querySelector("use-intl-number") as UseIntlNumber;
      await element.updateComplete;
      const originalText = getDataElement(element).textContent;

      element.setAttribute("value", "9999.99");
      await element.updateComplete;
      expect(getDataElement(element).textContent).not.toBe(originalText);
    });

    it("clears the data element when value is removed", async () => {
      render(html`<use-intl-number value="1234.5" lang="en-US"></use-intl-number>`);
      const element = document.querySelector("use-intl-number") as UseIntlNumber;
      await element.updateComplete;

      element.setAttribute("value", "");
      await element.updateComplete;
      expect(getDataElement(element).textContent).toBe("");
      expect(getDataElement(element).hasAttribute("value")).toBe(false);
    });
  });
});
