import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  content,
  pageMetadata,
  publicPagePaths,
  render,
  ticketCalendar,
} from '../node_modules/.tmp/prerender/entry-server.js'

// Schedule timestamps belong to the Taiwan event, regardless of the build host.
process.env.TZ = 'Asia/Taipei'

function assertReadingNavigation(body, path) {
  const maps = [
    ...body.matchAll(
      /<ol\b[^>]*\sclass="(?:[^"]* )?session-navigation-links(?: [^"]*)?"[^>]*>([\s\S]*?)<\/ol>/g,
    ),
  ]
  assert(maps.length, `Missing reading navigation: ${path}`)
  const targets = [...body.matchAll(/<\w+\b[^>]*\sid="([^"]*)"[^>]*>/g)]
  let expectedIds
  for (const [, map] of maps) {
    const links = [...map.matchAll(/<a\b[^>]*>/g)]
    assert(links.length, `Empty reading navigation: ${path}`)
    let previous = -1
    const ids = links.map(([link]) => {
      const href = link.match(/\shref="([^"]*)"/)?.[1]
      assert(href?.startsWith(`${path}#`), `Invalid reading link: ${path}`)
      const id = href.slice(path.length + 1)
      assert(id, `Invalid reading link: ${path}`)
      const matches = targets.filter(([, targetId]) => targetId === id)
      assert.equal(
        matches.length,
        1,
        `Missing or duplicate reading target #${id}: ${path}`,
      )
      const [target] = matches
      assert(
        /^<h2\b/.test(target[0]) && /\stabindex="-1"/.test(target[0]),
        `Reading target #${id} is not a focusable heading: ${path}`,
      )
      assert(target.index > previous, `Reading targets out of order: ${path}`)
      previous = target.index
      return id
    })
    if (expectedIds)
      assert.deepEqual(ids, expectedIds, `Reading maps differ: ${path}`)
    expectedIds = ids
  }
}

// Keep these failures covered without adding a browser dependency to the build.
const readingHeadings = [
  '<h2 id="one" tabindex="-1"></h2>',
  '<h2 id="two" tabindex="-1"></h2>',
]
const readingFixture =
  '<ol class="session-navigation-links"><li><a href="/test#one"></a></li><li><a href="/test#two"></a></li></ol>' +
  readingHeadings.join('')
assertReadingNavigation(readingFixture, '/test')
for (const [body, error] of [
  ['', /Missing reading navigation/],
  ['<ol class="session-navigation-links"></ol>', /Empty reading navigation/],
  [
    readingFixture.replace('id="one"', 'id="missing"'),
    /Missing or duplicate reading target/,
  ],
  [
    readingFixture + '<div id="one"></div>',
    /Missing or duplicate reading target/,
  ],
  [
    readingFixture.replace(
      readingHeadings.join(''),
      [...readingHeadings].reverse().join(''),
    ),
    /Reading targets out of order/,
  ],
  [readingFixture.replace('tabindex="-1"', ''), /not a focusable heading/],
  [readingFixture.replace('/test#one', '/test#'), /Invalid reading link/],
])
  assert.throws(() => assertReadingNavigation(body, '/test'), error)

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
  if (['/normal', '/undefined', '/demo'].includes(path))
    assertReadingNavigation(body, `${base}${path}`)
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

// The 索票重要時程 calendar, from the ticket dates in `content.json`.
const ticketCalendarFile = decodeURIComponent(
  new URL(content.links.ticketCalendarFile).pathname.split('/').pop(),
)
await writeFile(join('dist', ticketCalendarFile), ticketCalendar())
console.log(`Wrote ${base}/${ticketCalendarFile}`)
