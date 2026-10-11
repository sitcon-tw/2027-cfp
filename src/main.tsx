import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './index.css'
import { routeTree } from './routeTree.gen'

const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches

const router = createRouter({
  routeTree,
  defaultHashScrollIntoView: { behavior: reduceMotion ? 'auto' : 'smooth' },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
