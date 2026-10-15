import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  pageMetadata,
  publicPagePaths,
  render,
} from '../node_modules/.tmp/prerender/entry-server.js'

// Schedule timestamps belong to the Taiwan event, regardless of the build host.
process.env.TZ = 'Asia/Taipei'

const template = await readFile('dist/index.html', 'utf8')
const headPattern =
  /<!-- page-metadata:start -->[\s\S]*?<!-- page-metadata:end -->/
assert(headPattern.test(template), 'Missing page metadata placeholder')
assert(template.includes('<div id="root"></div>'), 'Missing React root')
const base = (process.env.BASE_PATH ?? '/').replace(/\/$/, '')
const sitemapEntries = []

for (const path of publicPagePaths) {
  const { canonical } = pageMetadata(path)
  assert(canonical, `Missing canonical URL: ${path}`)
  const { head, body } = await render(`${base}${path}`)
  assert(body.includes('<main'), `Missing page content: ${path}`)
  assert(body.includes('<h1'), `Missing page heading: ${path}`)
  assert(!body.includes('<!--$!-->'), `Unresolved server render: ${path}`)
  for (const [image] of body.matchAll(/<img\b[^>]*>/g)) {
    assert(/\ssrc="[^"]+"/.test(image), `Missing image source: ${path}`)
  }
  const html = template
    .replace(headPattern, () => head)
    .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)
  const destination = join('dist', path.slice(1), 'index.html')
  await mkdir(dirname(destination), { recursive: true })
  await writeFile(destination, html)
  sitemapEntries.push(
    `  <url><loc>${canonical.replaceAll('&', '&amp;')}</loc></url>`,
  )
  console.log(`Prerendered ${base}${path}`)
}

await writeFile(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('\n')}
</urlset>
`,
)
