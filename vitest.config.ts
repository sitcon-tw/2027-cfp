import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'

// Separate from vite.config.ts, whose font and image plugins tests don't need.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['worker/src/**/*.test.ts', 'src/**/*.test.ts'],
  },
})
