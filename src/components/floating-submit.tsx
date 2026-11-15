import { Link, useMatchRoute, useParams } from '@tanstack/react-router'

import content from '@/content.json'
import { useSubmissionClosed } from '@/lib/countdown'
import { isSessionTypeId } from '@/lib/session-types'

/**
 * 立即投稿, pinned to the bottom-right corner of every page. On a session
 * page it opens that type's form; elsewhere it leads to 一般議程, like the
 * navbar's 我要投稿. It stays out of the way on the submission pages and
 * disappears once submissions close.
 */
export function FloatingSubmit() {
  const matchRoute = useMatchRoute()
  const { type } = useParams({ strict: false })
  const submissionClosed = useSubmissionClosed()

  const onSubmissionPage =
    matchRoute({ to: '/submit/$type' }) || matchRoute({ to: '/submit/verify' })
  if (submissionClosed || onSubmissionPage) {
    return null
  }

  // A cream disc inside a ring of the hero's three accent colors: the
  // gradient fills the link and the label's disc covers all but its edge.
  const className =
    'pointer-events-auto block size-27.5 rounded-full bg-linear-135 from-red via-blue to-green p-1 transition-[filter,scale] duration-300 ease-smooth select-none hover:scale-105 hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none motion-reduce:hover:scale-100'
  const label = (
    <span className="flex size-full items-center justify-center rounded-full bg-foreground text-center text-lead font-extrabold whitespace-pre-line text-background">
      {content.floating_submit.label}
    </span>
  )

  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-20 md:right-7.5 md:bottom-7.5">
      {type && isSessionTypeId(type) ? (
        <Link to="/submit/$type" params={{ type }} className={className}>
          {label}
        </Link>
      ) : (
        <Link to="/$type" params={{ type: 'normal' }} className={className}>
          {label}
        </Link>
      )}
    </div>
  )
}
