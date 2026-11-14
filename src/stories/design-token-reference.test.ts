import { describe, expect, it } from "vite-plus/test";
import { render } from "vitest-browser-lit";
import { page, userEvent } from "vite-plus/test/browser";

import "../styles/tokens.css";
import {
  nativeThemeTokens,
  semanticTokens,
  themeTokensFor,
  tokenReference,
} from "./design-token-reference.ts";

function row(name: string) {
  return document.querySelector<HTMLTableRowElement>(`tr[data-token="${name}"]`)!;
}

function swatchColor(cell: Element) {
  return getComputedStyle(cell.querySelector(".swatch > span")!).backgroundColor;
}

describe("tokenReference", () => {
  it("previews light and dark values side by side, including values derived from overridden tokens", async () => {
    render(tokenReference(semanticTokens));

    const [, lightBackground, darkBackground] = row("--usewc-color-document-background").cells;
    expect(swatchColor(lightBackground)).not.toBe(swatchColor(darkBackground));

    const [, lightSidebar, darkSidebar] = row("--usewc-color-sidebar-item-text-static").cells;
    expect(swatchColor(lightSidebar)).not.toBe(swatchColor(darkSidebar));
  });

  it("filters rows and hides empty groups", async () => {
    render(tokenReference(semanticTokens));
    await userEvent.fill(page.getByRole("searchbox"), "badge");

    expect(row("--usewc-color-badge-background-static").hidden).toBe(false);
    expect(row("--usewc-color-document-text").hidden).toBe(true);
    const visibleGroups = [...document.querySelectorAll("section")].filter(
      (section) => !section.hidden,
    );
    expect(visibleGroups.map((section) => section.querySelector("h3")!.textContent)).toEqual([
      "badge",
    ]);
  });
});

describe("theme tokens by element", () => {
  const names = (tokens: { name: string }[]) => tokens.map((token) => token.name);

  it("lists native button tokens and the derivation knobs behind them", () => {
    const { tokens, sharedGroups } = nativeThemeTokens();
    expect(names(tokens)).toContain("--usewc-color-button-base-background-hover");
    expect(names(tokens)).toContain("--usewc-effect-button-base-shift");
    expect(names(tokens)).not.toContain("--usewc-color-grid-header-text");
    expect(sharedGroups).toEqual([]);
  });

  it("lists an element's own tokens and names the shared groups it reads", () => {
    const { tokens, sharedGroups } = themeTokensFor("use-grid");
    expect(new Set(tokens.map((token) => token.component))).toEqual(new Set(["grid"]));
    expect(names(tokens)).not.toContain("--usewc-color-brand-accent");
    expect(sharedGroups).toContain("outline");
    expect(sharedGroups).not.toContain("brand");
  });

  it("lists nothing for an element the theme doesn't style", () => {
    expect(themeTokensFor("use-focusgroup")).toEqual({ tokens: [], sharedGroups: [] });
  });
});
