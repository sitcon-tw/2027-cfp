import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

import { resolveSessionTypeId } from '@/lib/session-type-ids'

// The session pages used to live at /sessions/<previous id>; keep those
// links working by sending them to the page's current path.
export const Route = createFileRoute('/sessions/$type')({
  beforeLoad: ({ params }) => {
    const type = resolveSessionTypeId(params.type)
    if (!type) {
      throw notFound()
    }
    throw redirect({ to: '/$type', params: { type }, replace: true })
  },
})
