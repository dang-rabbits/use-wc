import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-treeitem";
import { UseTreeitem } from "./use-treeitem";
// Theming (mask-image tokens) lives in the design system's theme layer, not in the component's
// own styles, so it has to be loaded explicitly here. theme.css consumes custom properties
// defined in tokens.css, so both are required.
import "../../styles/tokens.css";
import "../../styles/theme.css";

describe("use-treeitem", () => {
  it("renders the built-in collapsed disclosure glyph by default", async () => {
    render(html`
      <use-treeitem value="1">
        Parent
        <use-treeitem value="1a">Child</use-treeitem>
      </use-treeitem>
    `);

    const item = document.querySelector("use-treeitem") as UseTreeitem;
    await item.updateComplete;

    const icon = item.shadowRoot!.querySelector(
      '[part="collapsed-indicator-default"]',
    ) as HTMLElement;
    expect(icon.textContent).toBe("+");
  });

  it("renders the built-in expanded disclosure glyph when expanded", async () => {
    render(html`
      <use-treeitem value="1" expanded>
        Parent
        <use-treeitem value="1a">Child</use-treeitem>
      </use-treeitem>
    `);

    const item = document.querySelector("use-treeitem") as UseTreeitem;
    await item.updateComplete;

    const icon = item.shadowRoot!.querySelector(
      '[part="expanded-indicator-default"]',
    ) as HTMLElement;
    expect(icon.textContent).toBe("-");
  });

  it("renders the built-in checkmark when selected", async () => {
    render(html`<use-treeitem value="1" selected>One</use-treeitem>`);

    const item = document.querySelector("use-treeitem") as UseTreeitem;
    await item.updateComplete;

    const icon = item.shadowRoot!.querySelector(
      '[part="selected-indicator-default"]',
    ) as HTMLElement;
    expect(icon.textContent).toBe("✔");
  });

  it("replaces the default glyph when a matching slot is filled", async () => {
    render(html`
      <use-treeitem value="1" expanded>
        Parent
        <span slot="expanded-indicator" id="custom-expanded">▾</span>
        <use-treeitem value="1a">Child</use-treeitem>
      </use-treeitem>
    `);

    const item = document.querySelector("use-treeitem") as UseTreeitem;
    await item.updateComplete;

    const slot = item.shadowRoot!.querySelector(
      'slot[name="expanded-indicator"]',
    ) as HTMLSlotElement;
    const assigned = slot.assignedElements();

    expect(assigned).toHaveLength(1);
    expect(assigned[0].id).toBe("custom-expanded");
  });

  it("renders a bare collapsedIcon string instead of the built-in glyph when set", async () => {
    UseTreeitem.collapsedIcon = "▸";

    try {
      render(html`
        <use-treeitem value="1">
          Parent
          <use-treeitem value="1a">Child</use-treeitem>
        </use-treeitem>
      `);

      const item = document.querySelector("use-treeitem") as UseTreeitem;
      await item.updateComplete;

      const icon = item.shadowRoot!.querySelector(
        '[part="collapsed-indicator-default"]',
      ) as HTMLElement;
      expect(icon.textContent).toBe("▸");
    } finally {
      UseTreeitem.collapsedIcon = undefined;
    }
  });

  it("renders an icon function's template built from the html tag it's passed", async () => {
    UseTreeitem.selectedIcon = (customHtml) => {
      expect(customHtml).toBe(html);
      return customHtml`<span id="custom-icon-template">custom</span>`;
    };

    try {
      render(html`<use-treeitem value="1" selected>One</use-treeitem>`);

      const item = document.querySelector("use-treeitem") as UseTreeitem;
      await item.updateComplete;

      const custom = item.shadowRoot!.querySelector("#custom-icon-template");
      expect(custom?.textContent).toBe("custom");
    } finally {
      UseTreeitem.selectedIcon = undefined;
    }
  });

  it("leaves indicators without their own static on the built-in default", async () => {
    UseTreeitem.selectedIcon = "custom-selected";

    try {
      render(html`
        <use-treeitem value="1" selected expanded>
          Parent
          <use-treeitem value="1a">Child</use-treeitem>
        </use-treeitem>
      `);

      const item = document.querySelector("use-treeitem") as UseTreeitem;
      await item.updateComplete;

      const expandedIcon = item.shadowRoot!.querySelector(
        '[part="expanded-indicator-default"]',
      ) as HTMLElement;
      const selectedIcon = item.shadowRoot!.querySelector(
        '[part="selected-indicator-default"]',
      ) as HTMLElement;

      expect(expandedIcon.textContent).toBe("-");
      expect(selectedIcon.textContent).toBe("custom-selected");
    } finally {
      UseTreeitem.selectedIcon = undefined;
    }
  });

  it("themes the disclosure indicators' mask-image from the design system tokens", async () => {
    render(html`
      <use-treeitem value="1">
        Parent
        <use-treeitem value="1a">Child</use-treeitem>
      </use-treeitem>
    `);

    const item = document.querySelector("use-treeitem") as UseTreeitem;
    await item.updateComplete;

    const icon = item.shadowRoot!.querySelector(
      '[part="collapsed-indicator-default"]',
    ) as HTMLElement;

    expect(getComputedStyle(icon).maskImage).not.toBe("none");
  });
});
