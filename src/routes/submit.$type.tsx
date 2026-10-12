import { createFileRoute, notFound, redirect } from '@tanstack/react-router'

import content from '@/content.json'
import heroPhotoPlaceholder from '@/assets/submit-hero.webp?placeholder'
import heroPhoto from '@/assets/submit-hero.webp?responsive'
import { PageHero } from '@/components/page-hero'
import { MoreSubmissions } from '@/components/more-submissions'
import { EditSubmission } from '@/components/submit/edit-submission'
import { SubmissionClosed } from '@/components/submit/submission-closed'
import { SubmissionForm } from '@/components/submit/submission-form'
import { SubmissionTypeTabs } from '@/components/submit/submission-type-tabs'
import { deadlines, useSubmissionClosed } from '@/lib/countdown'
import { resolveSessionTypeId } from '@/lib/session-type-ids'

export const Route = createFileRoute('/submit/$type')({
  params: {
    // Previous ids (`general`) resolve too, then redirect below.
    parse: ({ type: id }) => {
      const type = resolveSessionTypeId(id)
      if (!type) {
        throw notFound()
      }
      return { type }
    },
  },
  // `edit`: the token from an emailed edit link.
  validateSearch: (search: Record<string, unknown>): { edit?: string } =>
    typeof search.edit === 'string' && search.edit ? { edit: search.edit } : {},
  // Edit links in emails sent before #53 name the previous id.
  beforeLoad: ({ params: { type }, search, location }) => {
    if (!location.pathname.replace(/\/$/, '').endsWith(`/${type}`)) {
      throw redirect({
        to: '/submit/$type',
        params: { type },
        search,
        replace: true,
      })
    }
  },
  component: SubmitPage,
})

const text = content.submit_page

/**
 * 我要投稿 — one form per session type. An edit link opens the submission's
 * latest version instead of the type tabs and a blank form. After the
 * deadline, both give way to the 投稿已截止 message.
 */
function SubmitPage() {
  const { type } = Route.useParams()
  const { edit } = Route.useSearch()
  const submissionClosed = useSubmissionClosed()
  return (
    <main className="overflow-x-clip">
      <PageHero
        title={text.hero.title}
        description={text.hero.description}
        image={heroPhoto}
        placeholder={heroPhotoPlaceholder}
      />
      {submissionClosed && deadlines.submission ? (
        <SubmissionClosed deadline={deadlines.submission} />
      ) : edit ? (
        <EditSubmission key={edit} type={type} token={edit} />
      ) : (
        <>
          <div className="px-2.5 py-7.5">
            <div className="mx-auto max-w-content">
              <SubmissionTypeTabs type={type} />
            </div>
          </div>
          <SubmissionForm type={type} />
        </>
      )}
      <MoreSubmissions type={type} />
    </main>
  )
}
