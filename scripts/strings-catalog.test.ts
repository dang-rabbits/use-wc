import { existsSync, globSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { readComponentStrings, renderCatalog } from "./strings-catalog.mjs";

describe("strings catalog", () => {
  it("names every localized component after a strings file next to it", () => {
    const projectRoot = resolve(import.meta.dirname, "..");
    const namedComponents = new Set<string>();
    for (const file of globSync("src/elements/*/*.ts", { cwd: projectRoot })) {
      const source = readFileSync(resolve(projectRoot, file), "utf-8");
      if (!source.includes("LocalizedElement(")) {
        continue;
      }
      const component =
        source.match(/owner = "([^"]+)"/)?.[1] ?? source.match(/@customElement\("([^"]+)"\)/)?.[1];
      expect(existsSync(resolve(projectRoot, dirname(file), `${component}.strings.json`))).toBe(
        true,
      );
      namedComponents.add(component!);
    }
    expect([...namedComponents].sort()).toEqual(Object.keys(readComponentStrings()));
  });

  it("keeps the calendar pickers' navigation strings identical", () => {
    const strings = readComponentStrings();
    expect(strings["use-week-picker"]).toEqual(strings["use-date-picker"]);
  });

  it("documents each key with its English default", () => {
    const catalog = renderCatalog({
      "use-example": { label: "Select {label}", count: { one: "# row", other: "# rows" } },
    });
    expect(catalog).toContain('export type UseWcStrings = {\n  "use-example"?: {\n');
    expect(catalog).toContain('    /** Default: "Select {label}" */\n    label?: StringTemplate;');
    expect(catalog).toContain('/** Default: {"one":"# row","other":"# rows"} */');
  });
});
