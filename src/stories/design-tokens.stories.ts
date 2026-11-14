import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { semanticTokens, tokenReference } from "./design-token-reference.ts";

const meta: Meta = {
  title: "Design System/Tokens",
  tags: ["autodocs", "!dev", "utility"],
  parameters: {
    allowTheme: true,
    docs: {
      canvas: { sourceState: "none" },
      description: {
        component: [
          "Every semantic token the theme reads, grouped by component and read straight from `src/styles/tokens/semantic.css`. Override any of these on `:root` (or a narrower selector) to retheme; see [Token Naming](?path=/docs/design-system-token-naming--docs) for how the names are built.",
          "",
          "The light and dark columns preview what each token resolves to in that scheme, including tokens it derives from. Click a token name to copy it.",
        ].join("\n"),
      },
    },
  },
};
export default meta;

export const Reference: StoryObj = {
  render: () => tokenReference(semanticTokens),
};
