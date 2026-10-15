import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '../fonts/line-seed-tw/400.ttf?subsets'
import '../fonts/line-seed-tw/700.ttf?subsets'
import '../fonts/line-seed-tw/800.ttf?subsets'
import './index.css'
import { createAppRouter } from './router'

const router = createAppRouter()

// Keep the static page visible until its lazy route is ready to mount.
void router.load().then(() => {
  document.head.querySelectorAll('[data-page-metadata]').forEach((tag) => {
    tag.remove()
  })
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
})
