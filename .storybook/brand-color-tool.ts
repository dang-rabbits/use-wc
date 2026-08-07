import * as React from "react";
import { addons, types, useGlobals } from "storybook/manager-api";

// oklch(0.545 0.196 258), the default --usewc-color-brand-primary (blue-600)
const DEFAULT_BRAND_PRIMARY_HEX = "#0a6adf";

function BrandColorTool() {
  const [globals, updateGlobals] = useGlobals();
  const override: string | undefined = globals.brandPrimary;

  return React.createElement(
    "div",
    { style: { display: "flex", alignItems: "center", gap: 2 } },
    React.createElement("input", {
      type: "color",
      value: override ?? DEFAULT_BRAND_PRIMARY_HEX,
      title: "Brand primary color (--usewc-color-brand-primary)",
      "aria-label": "Brand primary color",
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        updateGlobals({ brandPrimary: event.target.value });
      },
      style: {
        width: 28,
        height: 28,
        padding: 0,
        border: "none",
        background: "none",
        cursor: "pointer",
      },
    }),
    override
      ? React.createElement(
          "button",
          {
            type: "button",
            title: "Reset brand primary color to the design system default",
            "aria-label": "Reset brand primary color",
            onClick: () => updateGlobals({ brandPrimary: undefined }),
            style: {
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              lineHeight: 1,
              padding: "0 4px",
              color: "inherit",
            },
          },
          "✕",
        )
      : null,
  );
}

addons.register("use-wc/brand-color", () => {
  addons.add("use-wc/brand-color-tool", {
    type: types.TOOL,
    title: "Brand primary color",
    match: ({ viewMode }) => viewMode === "story" || viewMode === "docs",
    render: BrandColorTool,
  });
});
