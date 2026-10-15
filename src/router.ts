import { createRouter, type RouterHistory } from '@tanstack/react-router'

import { routeTree } from './routeTree.gen'

export function createAppRouter(history?: RouterHistory) {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return createRouter({
    routeTree,
    history,
    basepath: import.meta.env.BASE_URL,
    defaultHashScrollIntoView: { behavior: reduceMotion ? 'auto' : 'smooth' },
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>
  }
}
