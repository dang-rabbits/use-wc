import { expect, describe, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { html } from "lit";

import "./use-option";
import { UseOption } from "./use-option";
// Theming (mask-image tokens) lives in the design system's theme layer, not in the component's
// own styles, so it has to be loaded explicitly here. theme.css consumes custom properties
// defined in tokens.css, so both are required.
import "../../styles/tokens.css";
import "../../styles/theme.css";

describe("use-option", () => {
  it("renders the built-in checkmark when selected", async () => {
    render(html`<use-option value="1" selected>One</use-option>`);

    const option = document.querySelector("use-option") as UseOption;
    await option.updateComplete;

    const icon = option.shadowRoot!.querySelector(
      '[part="selected-indicator-default"]',
    ) as HTMLElement;
    expect(icon.textContent).toBe("✔");
  });

  it("replaces the default checkmark when the selected-indicator slot is filled", async () => {
    render(html`
      <use-option value="1" selected>
        One
        <span slot="selected-indicator" id="custom-selected">★</span>
      </use-option>
    `);

    const option = document.querySelector("use-option") as UseOption;
    await option.updateComplete;

    const slot = option.shadowRoot!.querySelector(
      'slot[name="selected-indicator"]',
    ) as HTMLSlotElement;
    const assigned = slot.assignedElements();

    expect(assigned).toHaveLength(1);
    expect(assigned[0].id).toBe("custom-selected");
  });

  it("replaces the default deselected placeholder when the deselected-indicator slot is filled", async () => {
    render(html`
      <use-option value="1">
        One
        <span slot="deselected-indicator" id="custom-deselected">☆</span>
      </use-option>
    `);

    const option = document.querySelector("use-option") as UseOption;
    await option.updateComplete;

    const slot = option.shadowRoot!.querySelector(
      'slot[name="deselected-indicator"]',
    ) as HTMLSlotElement;
    const assigned = slot.assignedElements();

    expect(assigned).toHaveLength(1);
    expect(assigned[0].id).toBe("custom-deselected");
  });

  it("renders a bare selectedIcon string instead of the built-in checkmark when set", async () => {
    UseOption.selectedIcon = "★";

    try {
      render(html`<use-option value="1" selected>One</use-option>`);

      const option = document.querySelector("use-option") as UseOption;
      await option.updateComplete;

      const icon = option.shadowRoot!.querySelector(
        '[part="selected-indicator-default"]',
      ) as HTMLElement;
      expect(icon.textContent).toBe("★");
    } finally {
      UseOption.selectedIcon = undefined;
    }
  });

  it("renders a selectedIcon function's template built from the html tag it's passed", async () => {
    UseOption.selectedIcon = (customHtml) => {
      expect(customHtml).toBe(html);
      return customHtml`<span id="custom-icon-template">custom</span>`;
    };

    try {
      render(html`<use-option value="1" selected>One</use-option>`);

      const option = document.querySelector("use-option") as UseOption;
      await option.updateComplete;

      const custom = option.shadowRoot!.querySelector("#custom-icon-template");
      expect(custom?.textContent).toBe("custom");
    } finally {
      UseOption.selectedIcon = undefined;
    }
  });

  it("only affects its own state: selectedIcon and deselectedIcon apply independently", async () => {
    UseOption.selectedIcon = "selected-glyph";
    UseOption.deselectedIcon = "deselected-glyph";

    try {
      render(html`
        <use-option value="1" id="selected-option" selected>One</use-option>
        <use-option value="2" id="deselected-option">Two</use-option>
      `);

      const selectedOption = document.getElementById("selected-option") as UseOption;
      const deselectedOption = document.getElementById("deselected-option") as UseOption;
      await selectedOption.updateComplete;
      await deselectedOption.updateComplete;

      const selectedIcon = selectedOption.shadowRoot!.querySelector(
        '[part="selected-indicator-default"]',
      ) as HTMLElement;
      const deselectedIcon = deselectedOption.shadowRoot!.querySelector(
        '[part="deselected-indicator-default"]',
      ) as HTMLElement;

      expect(selectedIcon.textContent).toBe("selected-glyph");
      expect(deselectedIcon.textContent).toBe("deselected-glyph");
    } finally {
      UseOption.selectedIcon = undefined;
      UseOption.deselectedIcon = undefined;
    }
  });

  it("themes the selected indicator's mask-image from the design system token", async () => {
    render(html`<use-option value="1" selected>One</use-option>`);

    const option = document.querySelector("use-option") as UseOption;
    await option.updateComplete;

    const icon = option.shadowRoot!.querySelector(
      '[part="selected-indicator-default"]',
    ) as HTMLElement;

    const token = getComputedStyle(icon).getPropertyValue(
      "--usewc-effect-selected-indicator-mask-image",
    );

    expect(token.trim()).not.toBe("");
    expect(getComputedStyle(icon).maskImage).not.toBe("none");
  });
});
