import { create } from "storybook/theming";
import logo from "./logo.svg";
import { addons } from "storybook/manager-api";
import { fontBase, fontCode } from "./theme-fonts";
import "./brand-color-tool";

const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;

const theme = create({
  base: prefersDark ? "dark" : "light",
  brandTitle: "use-wc",
  brandImage: logo,
  fontBase,
  fontCode,
});

addons.setConfig({
  theme,
});
