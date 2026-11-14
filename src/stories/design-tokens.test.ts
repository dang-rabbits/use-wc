import { describe, expect, it } from "vite-plus/test";
import {
  groupByComponent,
  parseDesignTokens,
  tokensForElement,
  tokensForNativeElements,
} from "./design-tokens.ts";

const stylesheet = `
:root {
  /* Brand; with a semicolon */
  --usewc-color-brand-primary: var(--usewc-color-blue-600);
  --usewc-color-button-base-background-static: var(--usewc-color-brand-primary);
  --usewc-color-button-base-background-hover: oklch(
    from var(--usewc-color-button-base-background-static) calc(l + var(--usewc-effect-button-base-shift) * 0.1) c h
  );
  --usewc-effect-button-base-shift: -1;
  --usewc-effect-select-trigger-background-image: url("data:image/svg+xml;utf8,<svg>;</svg>");
  --usewc-layout-input-padding-inline: var(--usewc-space-8);
  color: red;
}

@media (prefers-color-scheme: dark) {
  :root {
    --usewc-effect-button-base-shift: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --usewc-layout-input-padding-inline: 0;
  }
}
`;

describe("parseDesignTokens", () => {
  const tokens = parseDesignTokens(stylesheet);

  it("reads every custom property in the root block in source order", () => {
    expect(tokens.map((token) => token.name)).toEqual([
      "--usewc-color-brand-primary",
      "--usewc-color-button-base-background-static",
      "--usewc-color-button-base-background-hover",
      "--usewc-effect-button-base-shift",
      "--usewc-effect-select-trigger-background-image",
      "--usewc-layout-input-padding-inline",
    ]);
  });

  it("splits the name into category and component", () => {
    expect(tokens[1]).toMatchObject({ category: "color", component: "button" });
    expect(tokens[5]).toMatchObject({ category: "layout", component: "input" });
  });

  it("collapses multi-line values and keeps semicolons inside strings", () => {
    expect(tokens[2].value).toBe(
      "oklch( from var(--usewc-color-button-base-background-static) calc(l + var(--usewc-effect-button-base-shift) * 0.1) c h )",
    );
    expect(tokens[4].value).toBe('url("data:image/svg+xml;utf8,<svg>;</svg>")');
  });

  it("attaches dark scheme overrides and ignores other media blocks", () => {
    expect(tokens[3].darkValue).toBe("1");
    expect(tokens[5].darkValue).toBeUndefined();
    expect(tokens[5].value).toBe("var(--usewc-space-8)");
  });

  it("groups tokens by component in first-seen order", () => {
    expect([...groupByComponent(tokens).keys()]).toEqual(["brand", "button", "select", "input"]);
  });
});

describe("tokens by element", () => {
  const tokens = parseDesignTokens(stylesheet);
  const names = (found: { name: string }[]) => found.map((token) => token.name);
  const stylesheets = {
    button: `
      @layer use-theme.button {
        /* use-grid in a comment is ignored */
        button:not(use-theme-escape *) {
          background: var(--usewc-color-button-base-background-hover);
          color: var(--usewc-local-button-text);
        }
      }
    `,
    grid: `
      @layer use-theme.grid {
        use-grid {
          use-gridrow & {
            padding-inline: var(--usewc-layout-input-padding-inline);
            background: var(--usewc-color-button-base-background-static);
          }
        }
      }
    `,
  };

  it("keeps an element's own groups, including nested and child element rules, and names the shared ones", () => {
    const { tokens: found, sharedGroups } = tokensForElement(stylesheets, tokens, "use-grid");
    expect(names(found)).toEqual(["--usewc-layout-input-padding-inline"]);
    expect(sharedGroups).toEqual(["button"]);
  });

  it("follows derivations within a group but not into other groups", () => {
    const { tokens: found, sharedGroups } = tokensForNativeElements(stylesheets, tokens);
    expect(names(found)).toEqual([
      "--usewc-color-button-base-background-static",
      "--usewc-color-button-base-background-hover",
      "--usewc-effect-button-base-shift",
    ]);
    expect(sharedGroups).toEqual([]);
  });
});
