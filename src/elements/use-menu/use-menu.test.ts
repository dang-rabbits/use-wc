import { expect, describe, it } from "vite-plus/test";
import { userEvent } from "vite-plus/test/browser";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-menu";
import { UseMenu } from "./use-menu";
import "../use-caret/use-caret";
// The menu's positioning and surface styling live in the design system's theme layer, not in
// the component's own styles, so it has to be loaded explicitly here. theme.css consumes custom
// properties defined in tokens.css, so both are required.
import "../../styles/tokens.css";
import "../../styles/theme.css";

// Popover show/hide dispatches its "toggle" event as a queued task rather than synchronously,
// so state-based assertions need to wait past the current task.
function waitForOpenState(menu: UseMenu, expected: boolean) {
  return new Promise<void>((resolve, reject) => {
    const deadline = Date.now() + 1000;
    const check = () => {
      if (menu.matches(":popover-open") === expected) {
        resolve();
        return;
      }
      if (Date.now() > deadline) {
        reject(new Error(`Timed out waiting for :popover-open to be ${expected}`));
        return;
      }
      setTimeout(check, 10);
    };
    check();
  });
}

// For "stays open" assertions there is no state transition to poll for, so instead give any
// incorrectly-queued close a chance to land before asserting it didn't happen.
function settle() {
  return new Promise<void>((resolve) => setTimeout(resolve, 100));
}

describe("use-menu", () => {
  describe("anchored to an invoker", () => {
    function renderAnchored() {
      render(html`
        <button id="trigger" popovertarget="anchored-menu">
          <use-caret>Menu</use-caret>
        </button>
        <use-menu id="anchored-menu" aria-label="Menu">
          <button role="menuitem">menu item 1</button>
          <button role="menuitem">menu item 2</button>
          <button role="menuitem" menu-item="keep-open">keep open item</button>
        </use-menu>
      `);

      const trigger = document.getElementById("trigger") as HTMLButtonElement;
      const menu = document.getElementById("anchored-menu") as UseMenu;
      return { trigger, menu };
    }

    it("applies popover to itself once it notices an invoker", async () => {
      const { menu } = renderAnchored();
      await menu.updateComplete;

      expect(menu.getAttribute("popover")).toBe("auto");
    });

    it("assigns the sole invoker an id and anchors to it even when the markup didn't set one", async () => {
      render(html`
        <button popovertarget="id-less-menu">Open</button>
        <use-menu id="id-less-menu" aria-label="Menu">
          <button role="menuitem">menu item 1</button>
        </use-menu>
      `);

      const trigger = document.querySelector("button") as HTMLButtonElement;
      const menu = document.getElementById("id-less-menu") as UseMenu;
      await menu.updateComplete;

      expect(trigger.id).not.toBe("");

      await userEvent.click(trigger);
      await waitForOpenState(menu, true);

      const menuRect = menu.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      expect(menuRect.top).toBeGreaterThanOrEqual(triggerRect.bottom - 1);
      expect(menuRect.left).toBeCloseTo(triggerRect.left, 0);
    });

    it("anchors to whichever invoker opened it when there are multiple, without anchortarget", async () => {
      render(html`
        <button id="left" popovertarget="shared-menu">Left</button>
        <button id="right" popovertarget="shared-menu">Right</button>
        <use-menu id="shared-menu" aria-label="Menu">
          <button role="menuitem">menu item 1</button>
        </use-menu>
      `);

      const left = document.getElementById("left") as HTMLButtonElement;
      const right = document.getElementById("right") as HTMLButtonElement;
      const menu = document.getElementById("shared-menu") as UseMenu;
      await menu.updateComplete;

      await userEvent.click(right);
      await waitForOpenState(menu, true);

      let menuRect = menu.getBoundingClientRect();
      let rightRect = right.getBoundingClientRect();
      expect(menuRect.top).toBeGreaterThanOrEqual(rightRect.bottom - 1);
      expect(menuRect.left).toBeCloseTo(rightRect.left, 0);

      await userEvent.click(right);
      await waitForOpenState(menu, false);

      await userEvent.click(left);
      await waitForOpenState(menu, true);

      menuRect = menu.getBoundingClientRect();
      const leftRect = left.getBoundingClientRect();
      expect(menuRect.top).toBeGreaterThanOrEqual(leftRect.bottom - 1);
      expect(menuRect.left).toBeCloseTo(leftRect.left, 0);
    });

    it("opens when the invoker is clicked and focuses the first item", async () => {
      const { trigger, menu } = renderAnchored();
      await menu.updateComplete;

      await userEvent.click(trigger);
      await waitForOpenState(menu, true);

      const firstItem = menu.querySelector('[role="menuitem"]') as HTMLElement;
      expect(document.activeElement).toBe(firstItem);
    });

    it("syncs aria-expanded on the invoker as the menu opens and closes", async () => {
      const { trigger, menu } = renderAnchored();
      await menu.updateComplete;

      expect(trigger.getAttribute("aria-expanded")).toBe("false");

      await userEvent.click(trigger);
      await waitForOpenState(menu, true);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");

      await userEvent.click(trigger);
      await waitForOpenState(menu, false);
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    });

    it("returns focus to the invoker on Escape", async () => {
      const { trigger, menu } = renderAnchored();
      await menu.updateComplete;

      await userEvent.click(trigger);
      await waitForOpenState(menu, true);

      await userEvent.keyboard("{Escape}");
      await waitForOpenState(menu, false);

      expect(document.activeElement).toBe(trigger);
    });

    it("closes when a plain menu item is clicked", async () => {
      const { trigger, menu } = renderAnchored();
      await menu.updateComplete;

      await userEvent.click(trigger);
      await waitForOpenState(menu, true);

      const item = menu.querySelector('[role="menuitem"]') as HTMLElement;
      item.click();

      await waitForOpenState(menu, false);
    });

    it("stays open when a menu-item='keep-open' item is clicked", async () => {
      const { trigger, menu } = renderAnchored();
      await menu.updateComplete;

      await userEvent.click(trigger);
      await waitForOpenState(menu, true);

      const item = menu.querySelector('[menu-item="keep-open"]') as HTMLElement;
      item.click();
      await settle();

      expect(menu.matches(":popover-open")).toBe(true);
    });
  });

  describe("nested submenus", () => {
    it("keeps the parent menu open when a submenu invoker is clicked", async () => {
      render(html`
        <button id="outer-trigger" popovertarget="outer-menu">
          <use-caret>Menu</use-caret>
        </button>
        <use-menu id="outer-menu" aria-label="Menu">
          <button role="menuitem">item 1</button>
          <button role="menuitem" popovertarget="inner-menu">
            <use-caret>Submenu</use-caret>
          </button>
          <use-menu id="inner-menu" aria-label="Submenu">
            <button role="menuitem">nested 1</button>
            <button role="menuitem">nested 2</button>
          </use-menu>
        </use-menu>
      `);

      const outerTrigger = document.getElementById("outer-trigger") as HTMLButtonElement;
      const outerMenu = document.getElementById("outer-menu") as UseMenu;
      await outerMenu.updateComplete;

      await userEvent.click(outerTrigger);
      await waitForOpenState(outerMenu, true);

      const submenuTrigger = outerMenu.querySelector(
        '[popovertarget="inner-menu"]',
      ) as HTMLButtonElement;
      const innerMenu = document.getElementById("inner-menu") as UseMenu;

      await userEvent.click(submenuTrigger);
      await waitForOpenState(innerMenu, true);

      expect(outerMenu.matches(":popover-open")).toBe(true);
      expect(innerMenu.matches(":popover-open")).toBe(true);
    });
  });

  describe("anchortarget", () => {
    it("writes anchor-name onto the target and removes it on disconnect", async () => {
      render(html`
        <div>
          <button id="anchor-target">Left</button>
          <button id="other-invoker" popovertarget="pinned-menu">Right</button>
          <use-menu id="pinned-menu" aria-label="Menu" anchortarget="anchor-target">
            <button role="menuitem">menu item 1</button>
          </use-menu>
        </div>
      `);

      const anchorTarget = document.getElementById("anchor-target") as HTMLElement;
      const menu = document.getElementById("pinned-menu") as UseMenu;
      await menu.updateComplete;

      expect(anchorTarget.style.getPropertyValue("anchor-name")).not.toBe("");
      expect(menu.matches(":state(anchored)")).toBe(true);

      menu.remove();
      expect(anchorTarget.style.getPropertyValue("anchor-name")).toBe("");
    });

    it("anchors to the pinned target rather than whichever invoker was clicked", async () => {
      render(html`
        <div>
          <button id="pin-anchor">Anchor</button>
          <button id="pin-invoker" popovertarget="pin-menu">Open</button>
          <use-menu id="pin-menu" aria-label="Menu" anchortarget="pin-anchor">
            <button role="menuitem">menu item 1</button>
          </use-menu>
        </div>
      `);

      const invoker = document.getElementById("pin-invoker") as HTMLButtonElement;
      const menu = document.getElementById("pin-menu") as UseMenu;
      await menu.updateComplete;

      await userEvent.click(invoker);
      await waitForOpenState(menu, true);

      expect(menu.style.getPropertyValue("position-anchor")).not.toBe("");
      expect(menu.matches(":state(anchored)")).toBe(true);
    });
  });

  describe("anchoralign", () => {
    // Centered via flexbox, rather than a fixed pixel margin, so the trigger sits equally clear
    // of both viewport edges regardless of the test runner's viewport width — otherwise
    // flip-inline or the viewport clamp could mask a real regression. A tall spacer above the
    // trigger does the same for the block axis: with no room above, position-try's flip-block
    // fallback would flip a block-start alignment back below the trigger, masking a regression
    // there too.
    async function renderAligned(anchoralign?: string) {
      render(html`
        <div style="display: flex; justify-content: center;">
          <div>
            <div style="block-size: 300px;"></div>
            <button id="align-trigger" popovertarget="align-menu">
              <use-caret>Menu</use-caret>
            </button>
            <use-menu id="align-menu" aria-label="Menu" anchoralign=${anchoralign ?? "end start"}>
              <button role="menuitem">menu item 1</button>
              <button role="menuitem">menu item 2</button>
            </use-menu>
          </div>
        </div>
      `);

      const trigger = document.getElementById("align-trigger") as HTMLButtonElement;
      const menu = document.getElementById("align-menu") as UseMenu;
      await menu.updateComplete;
      return { trigger, menu };
    }

    it("opens below the trigger with inline-start edges aligned by default", async () => {
      const { trigger, menu } = await renderAligned();

      await userEvent.click(trigger);
      await waitForOpenState(menu, true);

      const menuRect = menu.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();

      expect(menuRect.top).toBeGreaterThanOrEqual(triggerRect.bottom);
      expect(menuRect.left).toBeCloseTo(triggerRect.left, 0);
    });

    it("aligns the menu's inline-end edge with the trigger when anchoralign is 'end end'", async () => {
      const { trigger, menu } = await renderAligned("end end");

      await userEvent.click(trigger);
      await waitForOpenState(menu, true);

      const menuRect = menu.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();

      expect(menuRect.right).toBeCloseTo(triggerRect.right, 0);
    });

    it("opens above the trigger when anchoralign is 'start start'", async () => {
      const { trigger, menu } = await renderAligned("start start");

      await userEvent.click(trigger);
      await waitForOpenState(menu, true);

      const menuRect = menu.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();

      expect(menuRect.bottom).toBeLessThanOrEqual(triggerRect.top);
      expect(menuRect.left).toBeCloseTo(triggerRect.left, 0);
    });

    it("opens above and aligns the inline-end edge when anchoralign is 'start end'", async () => {
      const { trigger, menu } = await renderAligned("start end");

      await userEvent.click(trigger);
      await waitForOpenState(menu, true);

      const menuRect = menu.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();

      expect(menuRect.bottom).toBeLessThanOrEqual(triggerRect.top);
      expect(menuRect.right).toBeCloseTo(triggerRect.right, 0);
    });
  });

  describe("standalone popover with no invoker", () => {
    it("anchors to its previous sibling when no [popovertarget] invoker was ever discovered", async () => {
      render(html`
        <button
          id="manual-trigger"
          type="button"
          @click=${(event: Event) => {
            const button = event.currentTarget as HTMLElement;
            const menu = button.nextElementSibling as HTMLElement & { showPopover(): void };
            menu.showPopover();
          }}
        >
          Menu
        </button>
        <use-menu id="manual-popover-menu" aria-label="Menu" popover>
          <button role="menuitem">menu item 1</button>
        </use-menu>
      `);

      const trigger = document.getElementById("manual-trigger") as HTMLButtonElement;
      const menu = document.getElementById("manual-popover-menu") as UseMenu;
      await menu.updateComplete;

      await userEvent.click(trigger);
      await waitForOpenState(menu, true);

      const menuRect = menu.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      expect(menuRect.top).toBeGreaterThanOrEqual(triggerRect.bottom - 1);
      expect(menuRect.left).toBeCloseTo(triggerRect.left, 0);
    });
  });

  // theme.css wraps non-allowTheme story content in <use-theme-escape>, which sweeps "all:
  // revert-layer !important" across its light-DOM descendants to render unstyled native
  // defaults for Storybook demos. anchor-name/position-anchor are functional, not decorative,
  // so they need to survive that sweep the same way use-anchored's positioning already does —
  // regression coverage for a real bug where they got reverted to "none"/"normal", stranding the
  // menu at the viewport's default position despite everything else about it looking anchored.
  describe("wrapped in use-theme-escape", () => {
    it("still anchors to its invoker despite the all: revert-layer sweep", async () => {
      render(html`
        <use-theme-escape>
          <button id="escaped-trigger" popovertarget="escaped-menu">
            <use-caret>Menu</use-caret>
          </button>
          <use-menu id="escaped-menu" aria-label="Menu">
            <button role="menuitem">menu item 1</button>
          </use-menu>
        </use-theme-escape>
      `);

      const trigger = document.getElementById("escaped-trigger") as HTMLButtonElement;
      const menu = document.getElementById("escaped-menu") as UseMenu;
      await menu.updateComplete;

      await userEvent.click(trigger);
      await waitForOpenState(menu, true);

      const menuRect = menu.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      expect(menuRect.top).toBeGreaterThanOrEqual(triggerRect.bottom - 1);
      expect(menuRect.left).toBeCloseTo(triggerRect.left, 0);
    });
  });

  describe("plain, non-popover usage", () => {
    it("keeps roving-tabindex keyboard navigation without a popover", async () => {
      render(html`
        <use-menu aria-label="Menu">
          <button role="menuitem">menu item 1</button>
          <button role="menuitem">menu item 2</button>
          <button role="menuitem">menu item 3</button>
        </use-menu>
      `);

      const menu = document.querySelector("use-menu") as UseMenu;
      await menu.updateComplete;

      expect(menu.hasAttribute("popover")).toBe(false);

      const items = menu.querySelectorAll('[role="menuitem"]');
      (items[0] as HTMLElement).focus();
      await userEvent.keyboard("{ArrowDown}");

      expect(document.activeElement).toBe(items[1]);
    });
  });
});
