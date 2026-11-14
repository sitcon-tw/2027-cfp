import { createRouter, type RouterHistory } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

export function createAppRouter(history?: RouterHistory) {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const router = createRouter({
    routeTree,
    history,
    basepath: import.meta.env.BASE_URL,
    defaultHashScrollIntoView: { behavior: reduceMotion ? 'auto' : 'smooth' },
  })

  // Hash scrolling alone leaves keyboard users at the link they activated.
  router.subscribe('onRendered', ({ toLocation }) => {
    if (
      typeof document === 'undefined' ||
      !toLocation.hash ||
      toLocation.state.__hashScrollIntoViewOptions === false
    ) {
      return
    }

    const target = document.getElementById(toLocation.hash)
    const headingId = target?.getAttribute('aria-labelledby')
    const heading = headingId ? document.getElementById(headingId) : null
    const focusTarget = heading ?? target
    focusTarget?.focus({ preventScroll: true })
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
