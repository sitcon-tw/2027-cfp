import { createRootRoute, Outlet } from '@tanstack/react-router'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export const Route = createRootRoute({
  component: RootLayout,
})

/** Pages start under the fixed header and pad themselves with `pt-header`. */
function RootLayout() {
  return (
    <div className="relative flex min-h-svh flex-col">
      <SiteHeader className="fixed inset-x-0 top-0 z-10" />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  )
}
