import { createMemoryHistory } from '@tanstack/react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createAppRouter } from './router'

vi.mock('./routeTree.gen', async () => {
  const { createRootRoute } = await import('@tanstack/react-router')
  return { routeTree: createRootRoute() }
})

const heading = { focus: vi.fn(), getAttribute: () => null }
const section = {
  focus: vi.fn(),
  getAttribute: () => 'participate-title',
}
const getElementById = vi.fn((id: string) => {
  if (id === 'participate') return section
  if (id === 'participate-title') return heading
  return null
})
let router: ReturnType<typeof createAppRouter>

function rendered(hash = 'participate', hashScrollIntoView = true) {
  const toLocation = {
    ...router.buildLocation({ to: '/about', hash }),
    state: {
      ...router.latestLocation.state,
      __hashScrollIntoViewOptions: hashScrollIntoView,
    },
  }
  return () =>
    router.emit({
      type: 'onRendered',
      toLocation,
      fromLocation: toLocation,
      pathChanged: false,
      hrefChanged: false,
      hashChanged: false,
    })
}

beforeEach(() => {
  vi.clearAllMocks()
  router = createAppRouter(createMemoryHistory({ initialEntries: ['/about'] }))
  vi.stubGlobal('document', { getElementById })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('hash navigation focus', () => {
  it('focuses the section heading without replacing the router scroll behavior', () => {
    rendered()()
    expect(heading.focus).toHaveBeenCalledExactlyOnceWith({
      preventScroll: true,
    })
    expect(section.focus).not.toHaveBeenCalled()
  })

  it('hands focus back to the target when the same hash is activated again', () => {
    const render = rendered()
    render()
    render()
    expect(heading.focus).toHaveBeenCalledTimes(2)
  })

  it('can focus a heading linked directly by its own id', () => {
    rendered('participate-title')()
    expect(heading.focus).toHaveBeenCalledExactlyOnceWith({
      preventScroll: true,
    })
  })

  it('leaves focus alone when ticket navigation disables hash handling', () => {
    rendered('participate', false)()
    expect(getElementById).not.toHaveBeenCalled()
    expect(heading.focus).not.toHaveBeenCalled()
  })

  it('leaves ordinary navigation and missing targets alone', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    rendered('')()
    expect(getElementById).not.toHaveBeenCalled()
    rendered('missing')()
    expect(heading.focus).not.toHaveBeenCalled()
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('does not access the DOM during server rendering', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.unstubAllGlobals()
    rendered()()
    expect(consoleError).not.toHaveBeenCalled()
  })
})
