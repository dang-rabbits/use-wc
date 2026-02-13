/// <reference types="vitest/config" />
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
function resolveImports(filePath: string): string {
  const dir = dirname(filePath);
  const content = readFileSync(filePath, 'utf-8');
  return content.replace(/@import\s+['"](.+?)['"]\s*;/g, (_, importPath) => {
    const resolved = resolve(dir, importPath);
    return resolveImports(resolved);
  });
}
function cssEntries(entries: Record<string, string>) {
  return {
    name: 'css-entries',
    closeBundle() {
      for (const [name, entryPath] of Object.entries(entries)) {
        const css = resolveImports(entryPath);
        writeFileSync(resolve(__dirname, 'dist', `${name}.css`), css);
      }
    },
  };
}
export default defineConfig(({ command }) => ({
  define: {
    'globalThis.DEV_MODE': command === 'build' ? 'false' : 'true',
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/use-wc.ts'),
      name: 'use-wc',
      fileName: 'use-wc',
    },
  },
  plugins: [
    dts(),
    externalizeDeps(),
    cssEntries({
      'design-system': resolve(__dirname, 'src/styles/theme.css'),
      'default-tokens': resolve(__dirname, 'src/styles/tokens.css'),
    }),
  ],
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          // storybookTest({
          //   configDir: path.join(dirname, '.storybook'),
          // }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          // setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
}));
