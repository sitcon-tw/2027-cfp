import {
  createRootRoute,
  lazyRouteComponent,
  Outlet,
  useLocation,
} from '@tanstack/react-router'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { PageMetadata } from '@/components/page-metadata'

export const Route = createRootRoute({
  component: RootLayout,
  // Rarely shown, so it stays out of the bundle every page loads.
  notFoundComponent: lazyRouteComponent(
    () => import('@/components/not-found'),
    'NotFound',
  ),
})

/** Pages start under the fixed header and pad themselves with `pt-header`. */
function RootLayout() {
  const pathname = useLocation({ select: (location) => location.pathname })
  return (
    <div className="relative flex min-h-svh flex-col">
      {!import.meta.env.SSR && <PageMetadata pathname={pathname} />}
      <SiteHeader className="fixed inset-x-0 top-0 z-10" />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  )
}
