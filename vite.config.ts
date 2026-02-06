import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

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

export default defineConfig({
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
});
