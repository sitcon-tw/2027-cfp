import { describe, expect, it } from 'vitest'

import content from '@/content.json'
import { pageMetadata, publicPagePaths } from './page-metadata'

describe('public page metadata', () => {
  it('gives all five public pages distinct titles, descriptions and canonicals', () => {
    const pages = publicPagePaths.map((path) => pageMetadata(path))
    expect(publicPagePaths).toEqual([
      '/',
      '/about',
      '/normal',
      '/undefined',
      '/demo',
    ])
    for (const key of ['title', 'description', 'canonical'] as const) {
      expect(new Set(pages.map((page) => page[key])).size).toBe(5)
    }
  })

  it('uses the production canonical with either deployment base and slash style', () => {
    for (const path of publicPagePaths) {
      const expected = pageMetadata(path)
      expect(pageMetadata(`/2027/cfp${path}`, '/2027/cfp/')).toEqual(expected)
      expect(pageMetadata(`${path}/`, '/')).toEqual(expected)
    }
    expect(pageMetadata('/2027/cfp', '/2027/cfp/').canonical).toBe(
      content.metadata.url,
    )
    expect(pageMetadata('/normal/').canonical).toBe(
      'https://sitcon.org/2027/cfp/normal/',
    )
  })

  it('does not canonicalize forms, legacy paths or unknown pages to the homepage', () => {
    for (const path of [
      '/submit/normal',
      '/submit/verify',
      '/sessions/general',
      '/missing',
      '/2027/cfpx/normal',
    ]) {
      expect(pageMetadata(path, '/2027/cfp/')).toMatchObject({
        title: content.metadata.title,
        description: content.metadata.description,
        canonical: undefined,
      })
    }
  })

  it('noindexes submission pages under either base without affecting public pages', () => {
    for (const path of [
      '/submit/normal',
      '/submit/undefined',
      '/submit/demo',
      '/submit/verify',
      '/submit/general',
      '/submit/open',
    ]) {
      expect(pageMetadata(path).noindex).toBe(true)
      expect(pageMetadata(`/2027/cfp${path}/`, '/2027/cfp/').noindex).toBe(true)
    }
    for (const path of [
      ...publicPagePaths,
      '/sessions/general',
      '/submit-example',
    ]) {
      expect(pageMetadata(path).noindex).toBe(false)
    }
  })
})
