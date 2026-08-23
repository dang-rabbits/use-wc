import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-caret";
import { UseCaret } from "./use-caret";
import "../use-menu/use-menu";
// Button theming (padding, color) lives in the design system's theme layer, not in the
// component's own styles, so it has to be loaded explicitly here. theme.css consumes custom
// properties defined in tokens.css, so both are required.
import "../../styles/tokens.css";
import "../../styles/theme.css";

describe("use-caret", () => {
  it("renders a down caret for a top-level trigger", async () => {
    render(html`
      <button popovertarget="menu">
        <use-caret>Menu</use-caret>
      </button>
      <use-menu id="menu" aria-label="Menu">
        <button role="menuitem">menu item 1</button>
      </use-menu>
    `);

    const trigger = document.querySelector("use-caret") as UseCaret;
    await trigger.updateComplete;

    const icon = trigger.shadowRoot!.querySelector('[part="icon-default"]') as HTMLElement;
    expect(icon.textContent).toBe("▼");
  });

  it("renders a side caret when nested inside a use-menu", async () => {
    render(html`
      <use-menu aria-label="Menu">
        <button role="menuitem" popovertarget="submenu">
          <use-caret>Submenu</use-caret>
        </button>
        <use-menu id="submenu" aria-label="Submenu">
          <button role="menuitem">nested menu item 1</button>
        </use-menu>
      </use-menu>
    `);

    const trigger = document.querySelector("use-caret") as UseCaret;
    await trigger.updateComplete;

    const icon = trigger.shadowRoot!.querySelector('[part="icon-default"]') as HTMLElement;
    expect(icon.textContent).toBe("▶");
  });

  it("replaces the default caret when the icon slot is filled", async () => {
    render(html`
      <button popovertarget="menu">
        <use-caret>
          Menu
          <span slot="icon" id="custom-icon">+</span>
        </use-caret>
      </button>
      <use-menu id="menu" aria-label="Menu">
        <button role="menuitem">menu item 1</button>
      </use-menu>
    `);

    const trigger = document.querySelector("use-caret") as UseCaret;
    await trigger.updateComplete;

    const iconSlot = trigger.shadowRoot!.querySelector('slot[name="icon"]') as HTMLSlotElement;
    const assigned = iconSlot.assignedElements();

    expect(assigned).toHaveLength(1);
    expect(assigned[0].id).toBe("custom-icon");
  });

  it("renders a bare icon string instead of the built-in caret when set", async () => {
    UseCaret.icon = "→";

    try {
      render(html`
        <button popovertarget="menu">
          <use-caret>Menu</use-caret>
        </button>
        <use-menu id="menu" aria-label="Menu">
          <button role="menuitem">menu item 1</button>
        </use-menu>
      `);

      const trigger = document.querySelector("use-caret") as UseCaret;
      await trigger.updateComplete;

      const icon = trigger.shadowRoot!.querySelector('[part="icon-custom"]') as HTMLElement;
      expect(icon.textContent).toBe("→");
    } finally {
      UseCaret.icon = undefined;
    }
  });

  it("renders an icon function's string return value instead of the built-in caret", async () => {
    UseCaret.icon = () => "→";

    try {
      render(html`
        <button popovertarget="menu">
          <use-caret>Menu</use-caret>
        </button>
        <use-menu id="menu" aria-label="Menu">
          <button role="menuitem">menu item 1</button>
        </use-menu>
      `);

      const trigger = document.querySelector("use-caret") as UseCaret;
      await trigger.updateComplete;

      const icon = trigger.shadowRoot!.querySelector('[part="icon-custom"]') as HTMLElement;
      expect(icon.textContent).toBe("→");
    } finally {
      UseCaret.icon = undefined;
    }
  });

  it("renders an icon template built from the html tag it's passed", async () => {
    UseCaret.icon = (customHtml) => {
      expect(customHtml).toBe(html);
      return customHtml`<span id="custom-icon-template">custom</span>`;
    };

    try {
      render(html`
        <button popovertarget="menu">
          <use-caret>Menu</use-caret>
        </button>
        <use-menu id="menu" aria-label="Menu">
          <button role="menuitem">menu item 1</button>
        </use-menu>
      `);

      const trigger = document.querySelector("use-caret") as UseCaret;
      await trigger.updateComplete;

      const custom = trigger.shadowRoot!.querySelector("#custom-icon-template");
      expect(custom?.textContent).toBe("custom");
    } finally {
      UseCaret.icon = undefined;
    }
  });

  it("only affects triggers matching its own nesting: icon for top-level, nestedIcon for nested", async () => {
    UseCaret.icon = "top-level";
    UseCaret.nestedIcon = "nested";

    try {
      render(html`
        <button popovertarget="outer-menu">
          <use-caret>Menu</use-caret>
        </button>
        <use-menu id="outer-menu" aria-label="Menu">
          <button role="menuitem" popovertarget="inner-menu">
            <use-caret>Submenu</use-caret>
          </button>
          <use-menu id="inner-menu" aria-label="Submenu">
            <button role="menuitem">nested menu item 1</button>
          </use-menu>
        </use-menu>
      `);

      const [topLevelTrigger, nestedTrigger] = document.querySelectorAll("use-caret");
      await (topLevelTrigger as UseCaret).updateComplete;
      await (nestedTrigger as UseCaret).updateComplete;

      const topLevelIcon = topLevelTrigger.shadowRoot!.querySelector(
        '[part="icon-custom"]',
      ) as HTMLElement;
      const nestedIcon = nestedTrigger.shadowRoot!.querySelector(
        '[part="icon-custom"]',
      ) as HTMLElement;

      expect(topLevelIcon.textContent).toBe("top-level");
      expect(nestedIcon.textContent).toBe("nested");
    } finally {
      UseCaret.icon = undefined;
      UseCaret.nestedIcon = undefined;
    }
  });

  it("falls back to the built-in glyph for a kind whose static is left unset", async () => {
    UseCaret.nestedIcon = "nested";

    try {
      render(html`
        <button popovertarget="menu">
          <use-caret>Menu</use-caret>
        </button>
        <use-menu id="menu" aria-label="Menu">
          <button role="menuitem">menu item 1</button>
        </use-menu>
      `);

      const trigger = document.querySelector("use-caret") as UseCaret;
      await trigger.updateComplete;

      const icon = trigger.shadowRoot!.querySelector('[part="icon-default"]') as HTMLElement;
      expect(icon.textContent).toBe("▼");
    } finally {
      UseCaret.nestedIcon = undefined;
    }
  });

  describe("themed button", () => {
    it("reduces inline-end padding relative to inline-start when a caret is present", async () => {
      render(html`
        <button id="themed-trigger" popovertarget="themed-menu">
          <use-caret>Menu</use-caret>
        </button>
        <use-menu id="themed-menu" aria-label="Menu">
          <button role="menuitem">menu item 1</button>
        </use-menu>
      `);

      const button = document.getElementById("themed-trigger") as HTMLElement;
      await (document.querySelector("use-caret") as UseCaret).updateComplete;

      const style = getComputedStyle(button);
      const expectedEnd = getComputedStyle(document.documentElement).getPropertyValue(
        "--usewc-layout-button-padding-inline",
      );

      expect(style.paddingInlineEnd).not.toBe(style.paddingInlineStart);
      expect(style.paddingInlineEnd).not.toBe(expectedEnd.trim());
    });

    it("colors the icon with a semi-transparent tint of the surrounding text color", async () => {
      render(html`
        <button id="themed-trigger-2" popovertarget="themed-menu-2">
          <use-caret>Menu</use-caret>
        </button>
        <use-menu id="themed-menu-2" aria-label="Menu">
          <button role="menuitem">menu item 1</button>
        </use-menu>
      `);

      const trigger = document.querySelector("use-caret") as UseCaret;
      await trigger.updateComplete;
      const icon = trigger.shadowRoot!.querySelector('[part="icon-default"]') as HTMLElement;

      const token = getComputedStyle(icon).getPropertyValue(
        "--usewc-effect-dropdown-trigger-icon-background-color",
      );

      expect(token).toContain("color-mix");
      expect(token).toContain("currentColor");
    });
  });
});
