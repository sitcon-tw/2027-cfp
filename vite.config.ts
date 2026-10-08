import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import content from './src/content.json' with { type: 'json' }

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'content-html',
      transformIndexHtml(html) {
        const escape = (text: string) =>
          text.replace(
            /[&<>"']/g,
            (character) =>
              ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
              })[character]!,
          )
        return html
          .replace('%CFP_LANG%', escape(content.metadata.lang))
          .replace('%CFP_TITLE%', escape(content.metadata.title))
      },
    },
    // Must come before the React plugin.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
