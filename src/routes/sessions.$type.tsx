import { createFileRoute, redirect } from '@tanstack/react-router'

import content from '@/content.json'
import ctaPhoto from '@/assets/session-cta.jpg'
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
import { links } from '@/lib/links'
import { sessionPages } from '@/lib/session-pages'
import { isSessionTypeId } from '@/lib/session-types'

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

const text = content.session_page

/** 一般議程 / 開放式議程 / Demo 展. Sections differ per type; see Figma. */
function SessionPage() {
  const { type } = Route.useParams()
  const page = sessionPages[type]
  return (
    <main className="overflow-x-clip">
      <PageHero {...page.hero}>
        <SessionPageTabs type={type} />
      </PageHero>
      <SessionIntroCards title={page.introTitle} cards={page.intro} />
      <EarlyBirdBanner type={type} />
      {page.examples.map((section) => (
        // Keyed by page too, so switching type starts on the first page.
        <ExamplesCarousel key={`${type}-${section.title}`} {...section} />
      ))}
      {type === 'demo' && (
        <>
          <DemoGallery />
          <PosterStrip />
        </>
      )}
      <CriteriaTable {...text.reviewCriteria} />
      <InfoCardStack {...text.beforeSubmission} />
      {type === 'general' && <CriteriaTable {...text.requirements} />}
      <InfoCardStack {...text.afterSubmission} />
      <Faq type={type} />
      <PhotoCta
        title={text.cta.title}
        actions={[{ label: text.cta.submit, href: links.submit[type] }]}
        image={ctaPhoto}
      />
    </main>
  )
}
