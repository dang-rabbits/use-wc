import type { Meta, StoryObj } from "@storybook/web-components-vite";
import { html } from "lit";

const meta: Meta = {
  title: "Localization/Add-on API",
  tags: ["!dev"],
  argTypes: {
    registerLocales: {
      name: "registerLocales(options)",
      description:
        "Reads blocks matched by `selector`, then registers `locales`, and re-renders elements already on the page. Registering a locale again merges over its earlier strings.",
      table: { category: "Functions", type: { summary: "void" } },
    },
    clearLocales: {
      name: "clearLocales()",
      description:
        "Removes every registered locale, so elements fall back to `Intl` labels and English defaults.",
      table: { category: "Functions", type: { summary: "void" } },
    },
    selector: {
      name: "selector",
      description:
        "CSS selector for elements whose text is JSON keyed by locale. Every match is read and merged. Nothing is read without it.",
      table: { category: "registerLocales options", type: { summary: "string" } },
    },
    locales: {
      name: "locales",
      description: "Translations keyed by locale tag.",
      table: {
        category: "registerLocales options",
        type: { summary: "Record<string, UseWcStrings>" },
      },
    },
    UseWcStrings: {
      name: "UseWcStrings",
      description:
        "The strings for one locale, keyed by component name. Each key shows its English default.",
      table: { category: "Types" },
    },
  },
};

export default meta;

export const Api: StoryObj = {
  render: () => html``,
};
