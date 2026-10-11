import { createRouter, RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '../fonts/line-seed-tw/400.ttf?subsets'
import '../fonts/line-seed-tw/700.ttf?subsets'
import '../fonts/line-seed-tw/800.ttf?subsets'
import './index.css'
import { routeTree } from './routeTree.gen'

const reduceMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches

const router = createRouter({
  routeTree,
  // Vite's `base`: `/2027/cfp/` in production, `/` elsewhere.
  basepath: import.meta.env.BASE_URL,
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
