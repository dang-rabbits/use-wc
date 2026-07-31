import { expect, describe, it } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-dropdown";
import { UseDropdown } from "./use-dropdown";
// The dropdown's positioning and scroll behavior live in the design system's theme layer,
// not in the component's own styles, so it has to be loaded explicitly here. theme.css
// consumes custom properties defined in tokens.css, so both are required.
import "../../styles/tokens.css";
import "../../styles/theme.css";

// Popover show/hide dispatches its "toggle" event as a queued task rather than
// synchronously, so state-based assertions need to wait past the current task.
function waitForOpenState(dropdown: UseDropdown, expected: boolean) {
  return new Promise<void>((resolve, reject) => {
    const deadline = Date.now() + 1000;
    const check = () => {
      if (dropdown.matches(":state(open)") === expected) {
        resolve();
        return;
      }
      if (Date.now() > deadline) {
        reject(new Error(`Timed out waiting for :state(open) to be ${expected}`));
        return;
      }
      setTimeout(check, 10);
    };
    check();
  });
}

// For "stays open" assertions there is no state transition to poll for, so instead give
// any incorrectly-queued close a chance to land before asserting it didn't happen.
function settle() {
  return new Promise<void>((resolve) => setTimeout(resolve, 100));
}

describe("use-dropdown", () => {
  describe("nested dropdowns", () => {
    function renderNested() {
      render(html`
        <use-dropdown label="Menu">
          <button role="menuitem">menu item 1</button>
          <use-dropdown id="nested">
            <div slot="trigger-content">▶</div>
            <button role="menuitem">nested menu item 1</button>
          </use-dropdown>
        </use-dropdown>
      `);

      const outer = document.querySelector("use-dropdown") as UseDropdown;
      const nested = document.querySelector("#nested") as UseDropdown;
      return { outer, nested };
    }

    it("stays open when the nested trigger's slotted trigger-content is clicked", async () => {
      const { outer, nested } = renderNested();
      await outer.updateComplete;
      await nested.updateComplete;

      await userEvent.click(outer.trigger!);
      await waitForOpenState(outer, true);

      // Dispatched directly on the element (rather than via userEvent's coordinate-based
      // click) so the target is unambiguously the slotted div, not whatever happens to be
      // under its bounding-box center.
      const triggerContent = nested.querySelector('[slot="trigger-content"]') as HTMLElement;
      triggerContent.click();
      await settle();

      expect(outer.matches(":state(open)")).toBe(true);
    });

    it("stays open when the nested trigger's shadow button is clicked", async () => {
      const { outer, nested } = renderNested();
      await outer.updateComplete;
      await nested.updateComplete;

      await userEvent.click(outer.trigger!);
      await waitForOpenState(outer, true);

      nested.trigger?.click();
      await settle();

      expect(outer.matches(":state(open)")).toBe(true);
    });

    it("closes when a plain menu item is clicked", async () => {
      const { outer } = renderNested();
      await outer.updateComplete;

      await userEvent.click(outer.trigger!);
      await waitForOpenState(outer, true);

      const item = outer.querySelector('[role="menuitem"]') as HTMLElement;
      item.click();

      await waitForOpenState(outer, false);
    });

    it("stays open when a menu-item='keep-open' item is clicked", async () => {
      render(html`
        <use-dropdown label="Menu">
          <button role="menuitem" menu-item="keep-open">keep open item</button>
        </use-dropdown>
      `);
      const outer = document.querySelector("use-dropdown") as UseDropdown;
      await outer.updateComplete;

      await userEvent.click(outer.trigger!);
      await waitForOpenState(outer, true);

      const item = outer.querySelector('[role="menuitem"]') as HTMLElement;
      item.click();
      await settle();

      expect(outer.matches(":state(open)")).toBe(true);
    });
  });

  describe("accessible name", () => {
    it("forwards the host's aria-label to the trigger button", async () => {
      render(html`
        <use-dropdown aria-label="Menu">
          <button role="menuitem">menu item 1</button>
        </use-dropdown>
      `);

      const dropdown = document.querySelector("use-dropdown") as UseDropdown;
      await dropdown.updateComplete;

      expect(dropdown.trigger?.getAttribute("aria-label")).toBe("Menu");
    });

    it("leaves no visible label text when label is omitted", async () => {
      render(html`
        <use-dropdown aria-label="Menu">
          <button role="menuitem">menu item 1</button>
        </use-dropdown>
      `);

      const dropdown = document.querySelector("use-dropdown") as UseDropdown;
      await dropdown.updateComplete;

      const label = dropdown.shadowRoot!.querySelector('[part="trigger-label"]') as HTMLElement;
      expect(label.textContent?.trim()).toBe("");
    });
  });

  describe("viewport overflow", () => {
    it("keeps a menu taller than the viewport within bounds and scrollable", async () => {
      const items = Array.from({ length: 60 }, (_, index) => index + 1);
      render(html`
        <use-dropdown label="Menu">
          ${items.map((item) => html`<button role="menuitem">menu item ${item}</button>`)}
        </use-dropdown>
      `);

      const dropdown = document.querySelector("use-dropdown") as UseDropdown;
      await dropdown.updateComplete;

      await userEvent.click(dropdown.trigger!);
      await waitForOpenState(dropdown, true);

      const menu = dropdown.shadowRoot!.querySelector('[part="menu"]') as HTMLElement;
      const rect = menu.getBoundingClientRect();
      const triggerRect = dropdown.trigger!.getBoundingClientRect();

      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
      expect(menu.scrollHeight).toBeGreaterThan(menu.clientHeight);
      expect(rect.top).toBeGreaterThanOrEqual(triggerRect.bottom);
    });
  });

  describe("menu alignment", () => {
    // Centered via flexbox, rather than a fixed pixel margin, so the trigger sits equally
    // clear of both viewport edges regardless of the test runner's viewport width —
    // otherwise flip-inline or the viewport clamp could mask a real regression.
    async function renderAligned(inlinealign?: "start" | "end") {
      render(html`
        <div style="display: flex; justify-content: center;">
          <use-dropdown label="Menu" inlinealign=${inlinealign ?? "start"}>
            <button role="menuitem">menu item 1</button>
            <button role="menuitem">menu item 2</button>
            <button role="menuitem">menu item 3</button>
          </use-dropdown>
        </div>
      `);

      const dropdown = document.querySelector("use-dropdown") as UseDropdown;
      await dropdown.updateComplete;
      return dropdown;
    }

    it("aligns the menu's inline-start edge with the trigger by default", async () => {
      const dropdown = await renderAligned();

      await userEvent.click(dropdown.trigger!);
      await waitForOpenState(dropdown, true);

      const menu = dropdown.shadowRoot!.querySelector('[part="menu"]') as HTMLElement;
      const menuRect = menu.getBoundingClientRect();
      const triggerRect = dropdown.trigger!.getBoundingClientRect();

      expect(menuRect.left).toBeCloseTo(triggerRect.left, 0);
    });

    it("aligns the menu's inline-end edge with the trigger when inlinealign is end", async () => {
      const dropdown = await renderAligned("end");

      await userEvent.click(dropdown.trigger!);
      await waitForOpenState(dropdown, true);

      const menu = dropdown.shadowRoot!.querySelector('[part="menu"]') as HTMLElement;
      const menuRect = menu.getBoundingClientRect();
      const triggerRect = dropdown.trigger!.getBoundingClientRect();

      expect(menuRect.right).toBeCloseTo(triggerRect.right, 0);
    });
  });
});
