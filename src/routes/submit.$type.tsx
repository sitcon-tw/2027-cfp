import { createFileRoute, Link, redirect } from '@tanstack/react-router'

import content from '@/content.json'
import { PageHero } from '@/components/page-hero'
import { PhotoCta } from '@/components/photo-cta'
import { SubmissionForm } from '@/components/submit/submission-form'
import { SubmissionTypeTabs } from '@/components/submit/submission-type-tabs'
import { buttonVariants } from '@/components/ui/button'
import { isSessionTypeId, sessionTypes } from '@/lib/session-types'

export const Route = createFileRoute('/submit/$type')({
  params: {
    parse: ({ type }) => {
      if (!isSessionTypeId(type)) {
        throw redirect({ to: '/submit/$type', params: { type: 'general' } })
      }
      return { type }
    },
  },
  component: SubmitPage,
})

const text = content.submit_page

/** 我要投稿 — one form per session type. */
function SubmitPage() {
  const { type } = Route.useParams()
  return (
    <main className="overflow-x-clip">
      <PageHero title={text.placeholders.hero} />
      <div className="px-2.5 py-7.5">
        <div className="mx-auto max-w-content">
          <SubmissionTypeTabs type={type} />
        </div>
      </div>
      <SubmissionForm type={type} />
      <PhotoCta title={text.moreSubmissions}>
        {sessionTypes
          .filter((other) => other.id !== type)
          .map((other) => (
            <Link
              key={other.id}
              to="/sessions/$type"
              params={{ type: other.id }}
              className={buttonVariants({ shape: 'pill' })}
            >
              {other.title}
            </Link>
          ))}
      </PhotoCta>
    </main>
  )
}
