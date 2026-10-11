import { createFileRoute, redirect } from '@tanstack/react-router'

import content from '@/content.json'
import heroPhotoThumb from '@/assets/submit-hero-thumb.webp'
import heroPhoto from '@/assets/submit-hero.webp'
import { PageHero } from '@/components/page-hero'
import { MoreSubmissions } from '@/components/more-submissions'
import { SubmissionForm } from '@/components/submit/submission-form'
import { SubmissionTypeTabs } from '@/components/submit/submission-type-tabs'
import { isSessionTypeId } from '@/lib/session-types'

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
      <PageHero
        title={text.hero.title}
        description={text.hero.description}
        image={heroPhoto}
        placeholder={heroPhotoThumb}
      />
      <div className="px-2.5 py-7.5">
        <div className="mx-auto max-w-content">
          <SubmissionTypeTabs type={type} />
        </div>
      </div>
      <SubmissionForm type={type} />
      <MoreSubmissions type={type} />
    </main>
  )
}
