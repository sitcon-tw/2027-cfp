import { createFileRoute, redirect } from '@tanstack/react-router'

import content from '@/content.json'
import { PageHero } from '@/components/page-hero'
import { PhotoCta } from '@/components/photo-cta'
import { CriteriaTable } from '@/components/sessions/criteria-table'
import { DemoGallery } from '@/components/sessions/demo-gallery'
import { EarlyBirdBanner } from '@/components/sessions/early-bird-banner'
import { ExamplesCarousel } from '@/components/sessions/examples-carousel'
import { Faq } from '@/components/sessions/faq'
import { InfoCardStack } from '@/components/sessions/info-card-stack'
import { PosterStrip } from '@/components/sessions/poster-strip'
import { SessionIntroCards } from '@/components/sessions/session-intro-cards'
import { SessionPageTabs } from '@/components/sessions/session-page-tabs'
import { getSessionType, isSessionTypeId } from '@/lib/session-types'

export const Route = createFileRoute('/sessions/$type')({
  params: {
    parse: ({ type }) => {
      if (!isSessionTypeId(type)) {
        throw redirect({ to: '/sessions/$type', params: { type: 'general' } })
      }
      return { type }
    },
  },
  component: SessionPage,
})

const text = content.session_page.placeholders

/** 一般議程 / 開放式議程 / Demo 展. Sections differ per type; see Figma. */
function SessionPage() {
  const { type } = Route.useParams()
  const { title } = getSessionType(type)
  return (
    <main className="overflow-x-clip">
      <PageHero label={text.hero.replace('{title}', title)}>
        <SessionPageTabs type={type} />
      </PageHero>
      <SessionIntroCards type={type} />
      <EarlyBirdBanner />
      {type === 'general' && (
        <>
          <ExamplesCarousel label={text.presentationExamples} />
          <ExamplesCarousel label={text.espressoExamples} />
        </>
      )}
      {type === 'open' && <ExamplesCarousel label={text.openExamples} />}
      {type === 'demo' && (
        <>
          <DemoGallery />
          <PosterStrip />
        </>
      )}
      <CriteriaTable label={text.reviewCriteria} />
      <InfoCardStack label={text.beforeSubmission} />
      {type === 'general' && <CriteriaTable label={text.requirements} />}
      <InfoCardStack label={text.afterSubmission} />
      <Faq type={type} />
      <PhotoCta label={text.cta} />
    </main>
  )
}
