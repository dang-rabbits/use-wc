import { create } from "storybook/theming";
import logo from "./logo.svg";
import { addons } from "storybook/manager-api";
import { fontBase, fontCode } from "./theme-fonts";
import "./brand-color-tool";

const darkSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

function themeFor(prefersDark: boolean) {
  return create({
    base: prefersDark ? "dark" : "light",
    brandTitle: "use-wc",
    brandImage: logo,
    fontBase,
    fontCode,
  });
}

addons.setConfig({
  theme: themeFor(darkSchemeQuery.matches),
});

addons.register("use-wc/system-theme", (api) => {
  darkSchemeQuery.addEventListener("change", (event) => {
    api.setOptions({ theme: themeFor(event.matches) });
  });
});
