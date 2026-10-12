import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import viteFont from 'vite-plugin-font'
import { imagetools } from 'vite-imagetools'

import content from './src/content.json' with { type: 'json' }
import {
  previousSessionTypeIds,
  sessionTypeIds,
} from './src/lib/session-type-ids.ts'

// The package's CJS entry replaces `module.exports` with the plugin, so the
// default import is the plugin itself rather than the module its types describe.
const fontPlugin = viteFont as unknown as typeof viteFont.default

// Client routes that get a copy of index.html, so static hosts without an SPA
// fallback (GitHub Pages) serve them on direct visits and refreshes.
const routeShells = [
  'about',
  'submit/verify',
  ...sessionTypeIds.flatMap((type) => [type, `submit/${type}`]),
  // Paths before #53, redirected by their routes.
  ...Object.keys(previousSessionTypeIds).flatMap((id) => [
    `sessions/${id}`,
    `submit/${id}`,
  ]),
]

// Image presets, applied by import query (typed in `src/images.d.ts`):
// `?responsive` makes AVIF and WebP at several widths for a `<picture>`
// (`ResponsiveImage`), and `?placeholder` inlines a tiny blurred-in preview.
// Widths above the original's are dropped, so images are never upscaled.
const imagePresets: Record<string, Record<string, string>> = {
  responsive: {
    w: '320;640;960;1280;1600',
    format: 'avif;webp',
    as: 'picture',
  },
  placeholder: { w: '32', format: 'webp', quality: '50', inline: '' },
}

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
          .replaceAll('%CFP_TITLE%', escape(content.metadata.title))
          .replaceAll('%CFP_DESCRIPTION%', escape(content.metadata.description))
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
    // LINE Seed TW, subset to the characters in src (imported with
    // `?subsets` in src/main.tsx) plus what people type into the form.
    fontPlugin.vite({
      include: [/\/fonts\/line-seed-tw\/.+\.ttf/],
      scanFiles: ['src/**/*.{json,ts,tsx,css}'],
      whiteList: [
        // Printable ASCII and common full-width punctuation.
        String.fromCharCode(...Array.from({ length: 95 }, (_, i) => 32 + i)),
        '，。、：；！？「」『』（）《》〈〉…—～·',
      ],
      // Typed as cn-font-split's protobuf class, but read as a plain object.
      css: { fontFamily: 'LINESeedTW', fontDisplay: 'swap' } as never,
    }),
    {
      // cn-font-split's native binding blocks Node from exiting after it has
      // subset a font, so an uncached `vite build` (every CI build) hangs
      // once the bundle is written. Exit here instead; it has to be
      // synchronous, since the event loop never runs a deferred exit.
      name: 'exit-after-build',
      apply: 'build',
      enforce: 'post',
      closeBundle(error) {
        if (!this.meta.watchMode) process.exit(error ? 1 : 0)
      },
    },
    imagetools({
      defaultDirectives: (url) => {
        const preset = Object.keys(imagePresets).find((name) =>
          url.searchParams.has(name),
        )
        return new URLSearchParams(preset && imagePresets[preset])
      },
    }),
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
