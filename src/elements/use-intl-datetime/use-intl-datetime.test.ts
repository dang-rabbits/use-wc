import { expect, describe, it } from "vitest";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-intl-datetime";
import { UseIntlDatetime } from "./use-intl-datetime";

function getTimeElement(element: UseIntlDatetime): HTMLTimeElement {
  return element.shadowRoot!.querySelector("time")!;
}

describe("use-intl-datetime", () => {
  describe("datestyle only", () => {
    it("renders a time element with a YYYY-MM-DD datetime attribute", async () => {
      render(
        html`<use-intl-datetime
          datestyle="medium"
          value="2024-07-04"
          lang="en-US"
        ></use-intl-datetime>`,
      );
      const element = document.querySelector("use-intl-datetime") as UseIntlDatetime;
      await element.updateComplete;
      expect(getTimeElement(element).getAttribute("datetime")).toBe("2024-07-04");
    });

    it("formats the date using the locale", async () => {
      render(
        html`<use-intl-datetime
          datestyle="long"
          value="2024-07-04"
          lang="en-US"
        ></use-intl-datetime>`,
      );
      const element = document.querySelector("use-intl-datetime") as UseIntlDatetime;
      await element.updateComplete;
      expect(getTimeElement(element).textContent).toContain("July");
      expect(getTimeElement(element).textContent).toContain("2024");
    });

    it("produces shorter output for short format than long format", async () => {
      render(html`
        <use-intl-datetime
          id="short"
          datestyle="short"
          value="2024-07-04"
          lang="en-US"
        ></use-intl-datetime>
        <use-intl-datetime
          id="long"
          datestyle="long"
          value="2024-07-04"
          lang="en-US"
        ></use-intl-datetime>
      `);
      const shortElement = document.querySelector("#short") as UseIntlDatetime;
      const longElement = document.querySelector("#long") as UseIntlDatetime;
      await shortElement.updateComplete;
      await longElement.updateComplete;
      expect(getTimeElement(shortElement).textContent!.length).toBeLessThan(
        getTimeElement(longElement).textContent!.length,
      );
    });

    it("defaults to medium format when datestyle value is unrecognized", async () => {
      render(html`
        <use-intl-datetime
          id="empty"
          datestyle=""
          value="2024-07-04"
          lang="en-US"
        ></use-intl-datetime>
        <use-intl-datetime
          id="medium"
          datestyle="medium"
          value="2024-07-04"
          lang="en-US"
        ></use-intl-datetime>
      `);
      const emptyElement = document.querySelector("#empty") as UseIntlDatetime;
      const mediumElement = document.querySelector("#medium") as UseIntlDatetime;
      await emptyElement.updateComplete;
      await mediumElement.updateComplete;
      expect(getTimeElement(emptyElement).textContent).toBe(
        getTimeElement(mediumElement).textContent,
      );
    });
  });

  describe("timestyle only", () => {
    it("renders a time element with a HH:MM:SS datetime attribute from a time string", async () => {
      render(
        html`<use-intl-datetime
          timestyle="medium"
          value="14:30:00"
          lang="en-US"
        ></use-intl-datetime>`,
      );
      const element = document.querySelector("use-intl-datetime") as UseIntlDatetime;
      await element.updateComplete;
      expect(getTimeElement(element).getAttribute("datetime")).toBe("14:30:00");
    });

    it("formats the time using the locale", async () => {
      render(
        html`<use-intl-datetime
          timestyle="medium"
          value="14:30:00"
          lang="en-US"
        ></use-intl-datetime>`,
      );
      const element = document.querySelector("use-intl-datetime") as UseIntlDatetime;
      await element.updateComplete;
      expect(getTimeElement(element).textContent).toMatch(/2:30/);
    });
  });

  describe("datestyle and timestyle", () => {
    it("renders a time element with an ISO 8601 datetime attribute", async () => {
      render(
        html`<use-intl-datetime
          datestyle="medium"
          timestyle="medium"
          value="2024-07-04T14:30:00.000Z"
          lang="en-US"
        ></use-intl-datetime>`,
      );
      const element = document.querySelector("use-intl-datetime") as UseIntlDatetime;
      await element.updateComplete;
      expect(getTimeElement(element).getAttribute("datetime")).toBe("2024-07-04T14:30:00.000Z");
    });

    it("formats both date and time parts", async () => {
      render(
        html`<use-intl-datetime
          datestyle="long"
          timestyle="long"
          value="2024-07-04T14:30:00.000Z"
          lang="en-US"
        ></use-intl-datetime>`,
      );
      const element = document.querySelector("use-intl-datetime") as UseIntlDatetime;
      await element.updateComplete;
      expect(getTimeElement(element).textContent).toContain("July");
    });

    it("allows independent datestyle and timestyle values", async () => {
      render(html`
        <use-intl-datetime
          id="mixed"
          datestyle="full"
          timestyle="short"
          value="2024-07-04T14:30:00.000Z"
          lang="en-US"
        ></use-intl-datetime>
        <use-intl-datetime
          id="both-short"
          datestyle="short"
          timestyle="short"
          value="2024-07-04T14:30:00.000Z"
          lang="en-US"
        ></use-intl-datetime>
      `);
      const mixedElement = document.querySelector("#mixed") as UseIntlDatetime;
      const shortElement = document.querySelector("#both-short") as UseIntlDatetime;
      await mixedElement.updateComplete;
      await shortElement.updateComplete;
      expect(getTimeElement(mixedElement).textContent!.length).toBeGreaterThan(
        getTimeElement(shortElement).textContent!.length,
      );
    });
  });

  describe("lang attribute", () => {
    it("produces different output for different locales", async () => {
      render(html`
        <use-intl-datetime
          id="en"
          datestyle="long"
          value="2024-07-04"
          lang="en-US"
        ></use-intl-datetime>
        <use-intl-datetime
          id="fr"
          datestyle="long"
          value="2024-07-04"
          lang="fr-FR"
        ></use-intl-datetime>
      `);
      const englishElement = document.querySelector("#en") as UseIntlDatetime;
      const frenchElement = document.querySelector("#fr") as UseIntlDatetime;
      await englishElement.updateComplete;
      await frenchElement.updateComplete;
      expect(getTimeElement(englishElement).textContent).not.toBe(
        getTimeElement(frenchElement).textContent,
      );
    });
  });

  describe("attribute changes", () => {
    it("re-renders when the value attribute changes", async () => {
      render(
        html`<use-intl-datetime
          datestyle="long"
          value="2024-07-04"
          lang="en-US"
        ></use-intl-datetime>`,
      );
      const element = document.querySelector("use-intl-datetime") as UseIntlDatetime;
      await element.updateComplete;
      const originalText = getTimeElement(element).textContent;

      element.setAttribute("value", "2025-01-01");
      await element.updateComplete;
      expect(getTimeElement(element).textContent).not.toBe(originalText);
    });

    it("clears the time element when value is removed", async () => {
      render(
        html`<use-intl-datetime
          datestyle="long"
          value="2024-07-04"
          lang="en-US"
        ></use-intl-datetime>`,
      );
      const element = document.querySelector("use-intl-datetime") as UseIntlDatetime;
      await element.updateComplete;

      element.setAttribute("value", "");
      await element.updateComplete;
      expect(getTimeElement(element).textContent).toBe("");
      expect(getTimeElement(element).hasAttribute("datetime")).toBe(false);
    });
  });
});
