import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { playwright } from "vite-plus/test/browser-playwright";

const rootDir =
  typeof __dirname !== "undefined" ? __dirname : dirname(fileURLToPath(import.meta.url));

function resolveImports(filePath: string): string {
  const dir = dirname(filePath);
  const content = readFileSync(filePath, "utf-8");
  return content.replace(/@import\s+['"](.+?)['"]\s*;/g, (_, importPath) => {
    const resolved = resolve(dir, importPath);
    return resolveImports(resolved);
  });
}
function cssEntries(entries: Record<string, string>) {
  return {
    name: "css-entries",
    closeBundle() {
      for (const [name, entryPath] of Object.entries(entries)) {
        const css = resolveImports(entryPath);
        writeFileSync(resolve(rootDir, "dist", `${name}.css`), css);
      }
    },
  };
}

export default {
  staged: {
    "*": "vp check --fix",
  },
  fmt: {},
  lint: { ignorePatterns: ["dist/**", "node_modules/**", ".claude/**"] },
  pack: {
    entry: ["src/use-wc.ts"],
    dts: {
      tsgo: true,
    },
    exports: false,
    plugins: [
      cssEntries({
        "design-system": resolve(rootDir, "src/styles/theme.css"),
        tokens: resolve(rootDir, "src/styles/tokens.css"),
      }),
    ],
  },
  test: {
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "json-summary"],
      include: ["src/**"],
      exclude: ["src/**/*.test.ts"],
    },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [{ browser: "chromium" }],
    },
  },
};
