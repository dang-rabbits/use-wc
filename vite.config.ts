import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { externalizeDeps } from 'vite-plugin-externalize-deps'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/use-wc.ts'),
      name: 'use-wc',
      fileName: 'use-wc',
    },
  },
  plugins: [dts(), externalizeDeps()]
})
