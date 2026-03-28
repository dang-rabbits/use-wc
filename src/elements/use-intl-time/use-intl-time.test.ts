import { expect, describe, it } from "vitest";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-intl-time";
import { UseIntlTime } from "./use-intl-time";

function getTimeElement(element: UseIntlTime): HTMLTimeElement {
  return element.shadowRoot!.querySelector("time")!;
}

describe("use-intl-time", () => {
  describe("date type", () => {
    it("renders a time element with a YYYY-MM-DD datetime attribute", () => {
      render(html`<use-intl-time date="medium" value="2024-07-04" locale="en-US"></use-intl-time>`);
      const element = document.querySelector("use-intl-time") as UseIntlTime;
      const timeElement = getTimeElement(element);
      expect(timeElement.getAttribute("datetime")).toBe("2024-07-04");
    });

    it("formats the date using the locale", () => {
      render(html`<use-intl-time date="long" value="2024-07-04" locale="en-US"></use-intl-time>`);
      const element = document.querySelector("use-intl-time") as UseIntlTime;
      const timeElement = getTimeElement(element);
      expect(timeElement.textContent).toContain("July");
      expect(timeElement.textContent).toContain("2024");
    });

    it("produces shorter output for short format than long format", () => {
      render(html`
        <use-intl-time
          id="short-date"
          date="short"
          value="2024-07-04"
          locale="en-US"
        ></use-intl-time>
        <use-intl-time id="long-date" date="long" value="2024-07-04" locale="en-US"></use-intl-time>
      `);
      const shortElement = document.querySelector("#short-date") as UseIntlTime;
      const longElement = document.querySelector("#long-date") as UseIntlTime;
      const shortText = getTimeElement(shortElement).textContent ?? "";
      const longText = getTimeElement(longElement).textContent ?? "";
      expect(shortText.length).toBeLessThan(longText.length);
    });

    it("defaults to medium format when format attribute is empty", () => {
      render(html`
        <use-intl-time id="empty-format" date="" value="2024-07-04" locale="en-US"></use-intl-time>
        <use-intl-time
          id="medium-format"
          date="medium"
          value="2024-07-04"
          locale="en-US"
        ></use-intl-time>
      `);
      const emptyElement = document.querySelector("#empty-format") as UseIntlTime;
      const mediumElement = document.querySelector("#medium-format") as UseIntlTime;
      expect(getTimeElement(emptyElement).textContent).toBe(
        getTimeElement(mediumElement).textContent,
      );
    });
  });

  describe("time type", () => {
    it("renders a time element with a HH:MM:SS datetime attribute from a time string", () => {
      render(html`<use-intl-time time="medium" value="14:30:00" locale="en-US"></use-intl-time>`);
      const element = document.querySelector("use-intl-time") as UseIntlTime;
      const timeElement = getTimeElement(element);
      expect(timeElement.getAttribute("datetime")).toBe("14:30:00");
    });

    it("formats the time using the locale", () => {
      render(html`<use-intl-time time="medium" value="14:30:00" locale="en-US"></use-intl-time>`);
      const element = document.querySelector("use-intl-time") as UseIntlTime;
      const timeElement = getTimeElement(element);
      expect(timeElement.textContent).toMatch(/2:30/);
    });
  });

  describe("datetime type", () => {
    it("renders a time element with an ISO 8601 datetime attribute", () => {
      render(
        html`<use-intl-time
          datetime="medium"
          value="2024-07-04T14:30:00.000Z"
          locale="en-US"
        ></use-intl-time>`,
      );
      const element = document.querySelector("use-intl-time") as UseIntlTime;
      const timeElement = getTimeElement(element);
      expect(timeElement.getAttribute("datetime")).toBe("2024-07-04T14:30:00.000Z");
    });

    it("formats both date and time parts", () => {
      render(
        html`<use-intl-time
          datetime="long"
          value="2024-07-04T14:30:00.000Z"
          locale="en-US"
        ></use-intl-time>`,
      );
      const element = document.querySelector("use-intl-time") as UseIntlTime;
      const timeElement = getTimeElement(element);
      expect(timeElement.textContent).toContain("July");
    });
  });

  describe("duration type", () => {
    it("renders a time element with the original ISO 8601 duration as datetime attribute", () => {
      render(html`<use-intl-time duration="short" value="PT2H30M" locale="en-US"></use-intl-time>`);
      const element = document.querySelector("use-intl-time") as UseIntlTime;
      const timeElement = getTimeElement(element);
      expect(timeElement.getAttribute("datetime")).toBe("PT2H30M");
    });

    it("formats the duration using the locale", () => {
      render(html`<use-intl-time duration="long" value="PT2H30M" locale="en-US"></use-intl-time>`);
      const element = document.querySelector("use-intl-time") as UseIntlTime;
      const timeElement = getTimeElement(element);
      expect(timeElement.textContent).toMatch(/hour|hr/i);
    });
  });

  describe("relative type", () => {
    it("renders a time element with an ISO 8601 datetime attribute for the reference point", () => {
      const referenceDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      render(
        html`<use-intl-time
          relative="long"
          value=${referenceDate.toISOString()}
          locale="en-US"
        ></use-intl-time>`,
      );
      const element = document.querySelector("use-intl-time") as UseIntlTime;
      const timeElement = getTimeElement(element);
      expect(timeElement.getAttribute("datetime")).toBe(referenceDate.toISOString());
    });

    it("formats a past date as a negative relative time", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      render(
        html`<use-intl-time
          relative="long"
          value=${threeDaysAgo.toISOString()}
          locale="en-US"
        ></use-intl-time>`,
      );
      const element = document.querySelector("use-intl-time") as UseIntlTime;
      const timeElement = getTimeElement(element);
      expect(timeElement.textContent).toMatch(/ago|3 days/i);
    });

    it("formats a future date as a positive relative time", () => {
      const fiveDaysFromNow = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      render(
        html`<use-intl-time
          relative="long"
          value=${fiveDaysFromNow.toISOString()}
          locale="en-US"
        ></use-intl-time>`,
      );
      const element = document.querySelector("use-intl-time") as UseIntlTime;
      const timeElement = getTimeElement(element);
      expect(timeElement.textContent).toMatch(/in 5 days/i);
    });
  });

  describe("locale attribute", () => {
    it("produces different output for different locales", () => {
      render(html`
        <use-intl-time id="en" date="long" value="2024-07-04" locale="en-US"></use-intl-time>
        <use-intl-time id="fr" date="long" value="2024-07-04" locale="fr-FR"></use-intl-time>
      `);
      const englishElement = document.querySelector("#en") as UseIntlTime;
      const frenchElement = document.querySelector("#fr") as UseIntlTime;
      expect(getTimeElement(englishElement).textContent).not.toBe(
        getTimeElement(frenchElement).textContent,
      );
    });
  });

  describe("attribute changes", () => {
    it("re-renders when the value attribute changes", () => {
      render(html`<use-intl-time date="long" value="2024-07-04" locale="en-US"></use-intl-time>`);
      const element = document.querySelector("use-intl-time") as UseIntlTime;
      const originalText = getTimeElement(element).textContent;

      element.setAttribute("value", "2025-01-01");
      expect(getTimeElement(element).textContent).not.toBe(originalText);
    });

    it("clears the time element when value is removed", () => {
      render(html`<use-intl-time date="long" value="2024-07-04" locale="en-US"></use-intl-time>`);
      const element = document.querySelector("use-intl-time") as UseIntlTime;

      element.setAttribute("value", "");
      expect(getTimeElement(element).textContent).toBe("");
      expect(getTimeElement(element).hasAttribute("datetime")).toBe(false);
    });
  });
});
