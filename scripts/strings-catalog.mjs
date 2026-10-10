import { globSync, readFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const catalogPath = resolve(projectRoot, "src", "i18n", "catalog.ts");

export function readComponentStrings() {
  return Object.fromEntries(
    globSync("src/elements/**/*.strings.json", { cwd: projectRoot })
      .map((file) => [
        basename(file, ".strings.json"),
        JSON.parse(readFileSync(resolve(projectRoot, file), "utf-8")),
      ])
      .sort(([first], [second]) => first.localeCompare(second)),
  );
}

function propertyName(key) {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}

function defaultDoc(value) {
  return `/** Default: ${JSON.stringify(value).replaceAll("*/", "*\\/")} */`;
}

function renderComponent(component, defaults) {
  const properties = Object.entries(defaults).map(
    ([key, value]) => `    ${defaultDoc(value)}\n    ${propertyName(key)}?: StringTemplate;`,
  );
  return `  ${JSON.stringify(component)}?: {\n${properties.join("\n")}\n  };`;
}

export function renderCatalog(stringsByComponent = readComponentStrings()) {
  const components = Object.entries(stringsByComponent).map(([component, defaults]) =>
    renderComponent(component, defaults),
  );
  return [
    'import type { StringTemplate } from "../utils/strings";',
    "",
    `export type UseWcStrings = {\n${components.join("\n")}\n};`,
    "",
  ].join("\n");
}
