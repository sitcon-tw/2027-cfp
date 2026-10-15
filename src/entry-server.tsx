import { createMemoryHistory, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'

import { PageMetadata } from '@/components/page-metadata'
import { createAppRouter } from './router'

export { publicPagePaths } from '@/lib/page-metadata'

export async function render(pathname: string) {
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: [pathname] }),
  )
  await router.load()
  for (const match of router.state.matches) {
    if (match.status !== 'success') {
      throw new Error(`Cannot prerender ${pathname}: ${match.status}`, {
        cause: match.error,
      })
    }
  }

  return {
    head: renderToStaticMarkup(<PageMetadata pathname={pathname} />),
    body: renderToString(
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>,
    ),
  }
}
