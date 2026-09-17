import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";
import "./use-gridcell";

describe("use-gridcell", () => {
  describe("mode=action", () => {
    it("pulls its control out of the tab sequence before any focus event, not only after one", async () => {
      render(html`<use-gridcell mode="action"><a href="#x">link</a></use-gridcell>`);
      await Promise.resolve();
      const link = document.querySelector("a") as HTMLElement;
      expect(link.tabIndex).toBe(-1);
    });

    it("still forwards real focus to the control once the cell is focused", async () => {
      render(html`<use-gridcell mode="action"><a href="#x">link</a></use-gridcell>`);
      const cell = document.querySelector("use-gridcell") as HTMLElement;
      const link = document.querySelector("a") as HTMLElement;
      cell.focus();
      expect(document.activeElement).toBe(link);
    });
  });
});
