import type { Preview } from "@storybook/web-components-vite";
import { setCustomElementsManifest } from "@storybook/web-components-vite";
import { create } from "storybook/theming";
import { createElement } from "react";
import { fontBase, fontCode } from "./theme-fonts";
import { sampleStrings } from "./sample-strings";
import { registerLocales } from "../src/i18n/i18n";
import {
  Controls,
  Description,
  Primary,
  Stories,
  Subtitle,
  Title,
} from "@storybook/addon-docs/blocks";
import { addons } from "storybook/preview-api";
import { html } from "lit";

import "../src/styles/tokens.css";
import "../src/styles/theme.css";
import "../src/elements";

import customElements from "../custom-elements.json";

setCustomElementsManifest(customElements);
registerLocales({ locales: sampleStrings });

const stringFiles = import.meta.glob<Record<string, unknown>>("../src/elements/**/*.strings.json", {
  eager: true,
  import: "default",
});
const stringsByTag = Object.fromEntries(
  Object.entries(stringFiles).map(([path, strings]) => [
    path.split("/").pop()!.replace(".strings.json", ""),
    strings,
  ]),
);

// Adds a read-only "strings" section to a component's API table from its `<tag>.strings.json`.
const addStringArgTypes: NonNullable<Preview["argTypesEnhancers"]>[number] = (context) => {
  const tag = typeof context.component === "string" ? context.component : undefined;
  const rows = Object.entries((tag && stringsByTag[tag]) ?? {}).map(([key, value]) => [
    `strings:${key}`,
    {
      name: key,
      description:
        "Override with the localization add-on, or the `strings` property of the element that renders it.",
      control: false,
      table: {
        category: "strings",
        type: { summary: "string" },
        defaultValue: { summary: JSON.stringify(value) },
      },
    },
  ]);
  return { ...context.argTypes, ...Object.fromEntries(rows) };
};

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

const defaultLang = document.documentElement.getAttribute("lang");

function applyLocale(globals: Record<string, unknown> | undefined) {
  const value = globals?.locale;
  const lang = typeof value === "string" && value !== "default" ? value : defaultLang;
  if (lang) {
    document.documentElement.setAttribute("lang", lang);
  } else {
    document.documentElement.removeAttribute("lang");
  }
}

// Applied via the channel rather than a decorator so it also reaches
// `<Meta>`-only docs pages (e.g. Native Elements, Web Components) that render
// raw HTML directly and have no CSF story — and thus never run decorators —
// but share the same preview iframe and document.
const channel = addons.getChannel();
function applyGlobals(globals: Record<string, unknown> | undefined) {
  applyBrandPrimary(globals);
  applyLocale(globals);
}

channel.on(SET_GLOBALS, (data: { globals: Record<string, unknown> }) => applyGlobals(data.globals));
channel.on(GLOBALS_UPDATED, (data: { globals: Record<string, unknown> }) =>
  applyGlobals(data.globals),
);

const preview: Preview = {
  argTypesEnhancers: [addStringArgTypes],
  globalTypes: {
    brandPrimary: {
      name: "Brand primary color",
      description: "Overrides --usewc-color-brand-primary to preview a custom brand color",
    },
    locale: {
      name: "Locale",
      description: "Sets <html lang> so locale-aware components render in that locale",
      toolbar: {
        icon: "globe",
        dynamicTitle: true,
        items: [
          { value: "default", title: "Default locale" },
          { value: "en-US", title: "English (US)" },
          { value: "en-GB", title: "English (UK)" },
          { value: "fr", title: "Français" },
          { value: "de", title: "Deutsch" },
          { value: "es", title: "Español" },
          { value: "ja", title: "日本語" },
          { value: "ar", title: "العربية" },
          { value: "zh-Hans", title: "简体中文" },
        ],
      },
    },
  },
  initialGlobals: { locale: "default" },
  parameters: {
    docs: {
      // The stock autodocs template renders `<Primary/>` and then `<Stories/>`, and `Stories`
      // defaults to `includePrimary: true` — so the first story of every page is shown twice.
      // Same template, with that turned off.
      page: () =>
        createElement(
          "div",
          null,
          createElement(Title, null),
          createElement(Subtitle, null),
          createElement(Description, { of: "meta" }),
          createElement(Primary, null),
          createElement(Controls, null),
          createElement(Stories, { includePrimary: false }),
        ),
      theme: create({
        base: window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light",
        fontBase,
        fontCode,
      }),
      // Keeps the `<use-theme-escape>` wrapper the preview decorator below adds (see its own
      // comment) out of "Show code" — that wrapper is preview-only scaffolding, not something a
      // consumer would ever write themselves.
      source: {
        excludeDecorators: true,
      },
    },

    options: {
      storySort: {
        order: [
          "About use-wc",
          "Localization",
          ["Overview", "Add-on"],
          "Design System",
          ["Overview"],
        ],
      },
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
