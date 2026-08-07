import type { Preview } from "@storybook/web-components-vite";
import { setCustomElementsManifest } from "@storybook/web-components-vite";
import { themes } from "storybook/theming";
import { addons } from "storybook/preview-api";
import { html } from "lit";

import "../src/styles/tokens.css";
import "../src/styles/theme.css";
import "../src/elements";

import customElements from "../custom-elements.json";

setCustomElementsManifest(customElements);

// Not imported from "storybook/core-events" — that subpath isn't exported
// under the preview build's package.json conditions. The values are stable.
const SET_GLOBALS = "setGlobals";
const GLOBALS_UPDATED = "globalsUpdated";

function applyBrandPrimary(globals: Record<string, unknown> | undefined) {
  const value = globals?.brandPrimary;
  if (typeof value === "string" && value) {
    document.documentElement.style.setProperty("--usewc-color-brand-primary", value);
  } else {
    document.documentElement.style.removeProperty("--usewc-color-brand-primary");
  }
}

// Applied via the channel rather than a decorator so it also reaches
// `<Meta>`-only docs pages (e.g. Native Elements, Web Components) that render
// raw HTML directly and have no CSF story — and thus never run decorators —
// but share the same preview iframe and document.
const channel = addons.getChannel();
channel.on(SET_GLOBALS, (data: { globals: Record<string, unknown> }) =>
  applyBrandPrimary(data.globals),
);
channel.on(GLOBALS_UPDATED, (data: { globals: Record<string, unknown> }) =>
  applyBrandPrimary(data.globals),
);

const preview: Preview = {
  globalTypes: {
    brandPrimary: {
      name: "Brand primary color",
      description: "Overrides --usewc-color-brand-primary to preview a custom brand color",
    },
  },
  parameters: {
    docs: {
      theme: window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? themes.dark
        : themes.normal,
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
  decorators: [
    (story, context) => {
      // theme.css is loaded globally for every story. Component stories stay
      // wrapped in `use-theme-escape` to render as native, unstyled
      // elements; set `allowTheme: true` in a story's parameters for the one
      // themed example per doc page.
      if (context.parameters.allowTheme) {
        return story();
      }
      return html`<use-theme-escape>${story()}</use-theme-escape>`;
    },
  ],
};

export default preview;
