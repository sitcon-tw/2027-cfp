import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import content from './src/content.json' with { type: 'json' }
import { sessionTypeIds } from './src/lib/session-type-ids.ts'

// Client routes that get a copy of index.html, so static hosts without an SPA
// fallback (GitHub Pages) serve them on direct visits and refreshes.
const routeShells = [
  'about',
  ...sessionTypeIds.flatMap((type) => [`sessions/${type}`, `submit/${type}`]),
]

// https://vite.dev/config/
export default defineConfig({
  // Production is served from sitcon.org/2027/cfp/; see README.
  base: process.env.BASE_PATH ?? '/',
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
    {
      name: 'route-shells',
      enforce: 'post',
      apply: 'build',
      generateBundle(_, bundle) {
        const index = bundle['index.html']
        if (index?.type !== 'asset') this.error('index.html was not emitted')
        // `404.html` is for hosts that serve one for missing paths; the
        // router renders the 404 page.
        const fileNames = [
          ...routeShells.map((route) => `${route}/index.html`),
          '404.html',
        ]
        for (const fileName of fileNames) {
          this.emitFile({ type: 'asset', fileName, source: index.source })
        }
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
