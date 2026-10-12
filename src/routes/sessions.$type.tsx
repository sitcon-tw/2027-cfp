import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

import { isSessionTypeId } from '@/lib/session-types'

// The session pages used to live at /sessions/<id>; keep those links
// working by sending them to the page's current path.
export const Route = createFileRoute('/sessions/$type')({
  beforeLoad: ({ params: { type } }) => {
    if (!isSessionTypeId(type)) {
      throw notFound()
    }
    throw redirect({ to: '/$type', params: { type }, replace: true })
  },
})
