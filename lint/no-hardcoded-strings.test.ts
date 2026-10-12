import { describe, it } from "vite-plus/test";
import { RuleTester } from "vite-plus/lint/plugins-dev";
import plugin from "./use-wc-plugin.mjs";

RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: { sourceType: "module", parserOptions: { lang: "ts" } },
});

const rule = plugin.rules["no-hardcoded-strings"];
const hardcoded = { messageId: "hardcoded" };

ruleTester.run("no-hardcoded-strings", rule, {
  valid: [
    { code: "html`<button aria-label=${label}></button>`" },
    { code: 'html`<button aria-label="${label}"></button>`' },
    { code: "html`<button .title=${label} ?hidden=${hidden}>◄</button>`" },
    { code: 'html`<div part="control control-previous" role="grid"></div>`' },
    { code: 'html`<div aria-label="${first} ${second}"></div>`' },
    { code: 'css`[title="x"] { color: red; }`' },
    { code: 'input.setAttribute("aria-label", label);' },
    { code: 'input.setAttribute("role", "row");' },
    { code: 'input.setAttribute("aria-label", `${label}`);' },
    { code: "input.ariaLabel = label;" },
    { code: 'input.dataset.title = "Close";' },
    { code: 'element.type = "checkbox";' },
    { code: '/** @example <button aria-label="Close"></button> */\nexport const value = 1;' },
    {
      code: 'html`<button aria-label="Close"></button>`',
      filename: "src/elements/use-button/use-button.test.ts",
    },
    {
      code: 'html`<button aria-label="Close"></button>`',
      filename: "src/elements/use-button/use-button.stories.ts",
    },
  ],
  invalid: [
    { code: 'html`<button aria-label="Close"></button>`', errors: [hardcoded] },
    { code: "html`<button aria-label='Close'></button>`", errors: [hardcoded] },
    { code: "html`<button aria-label=Close></button>`", errors: [hardcoded] },
    { code: 'html`<input placeholder="Name ${label}">`', errors: [hardcoded] },
    { code: 'html`<span aria-roledescription="slide"></span>`', errors: [hardcoded] },
    { code: 'html`<img alt="Avatar" title="Profile">`', errors: [hardcoded, hardcoded] },
    { code: 'svg`<rect aria-valuetext="half"></rect>`', errors: [hardcoded] },
    { code: 'input.setAttribute("aria-label", "Select all rows");', errors: [hardcoded] },
    { code: 'input.setAttribute("aria-label", `Select row ${index}`);', errors: [hardcoded] },
    { code: 'input.setAttribute("title", "Sélectionner");', errors: [hardcoded] },
    { code: 'input.ariaLabel = "Close";', errors: [hardcoded] },
    { code: "input.placeholder = `Search ${scope}`;", errors: [hardcoded] },
  ],
});
