import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useEffect } from 'react'

import content from '@/content.json'
import ctaPhoto from '@/assets/session-cta.jpg?responsive'
import { MoreSubmissions } from '@/components/more-submissions'
import { heroSizes, PageHero } from '@/components/page-hero'
import { PhotoCta } from '@/components/photo-cta'
import { CriteriaTable } from '@/components/sessions/criteria-table'
import { EarlyBirdBanner } from '@/components/sessions/early-bird-banner'
import { ExamplesCarousel } from '@/components/sessions/examples-carousel'
import { Faq } from '@/components/sessions/faq'
import { InfoCardStack } from '@/components/sessions/info-card-stack'
import { OpenSessionIntro } from '@/components/sessions/open-session-intro'
import { PosterStrip } from '@/components/sessions/poster-strip'
import { ScheduleSection } from '@/components/sessions/schedule-section'
import { SessionIntroCards } from '@/components/sessions/session-intro-cards'
import { SessionPageTabs } from '@/components/sessions/session-page-tabs'
import { VenuePhotos } from '@/components/sessions/venue-photos'
import { Button, buttonVariants } from '@/components/ui/button'
import { useSubmissionClosed } from '@/lib/countdown'
import { preloadImage } from '@/lib/preload-image'
import {
  sessionPages,
  type SessionPage as SessionPageData,
} from '@/lib/session-pages'
import { isSessionTypeId, type SessionTypeId } from '@/lib/session-types'

export const Route = createFileRoute('/$type')({
  params: {
    parse: ({ type }) => {
      if (!isSessionTypeId(type)) {
        throw notFound()
      }
      return { type }
    },
  },
  component: SessionPage,
})

const text = content.session_page

const heroTexts = Object.values(sessionPages).map(({ hero }) => hero)

/**
 * 一般議程 / 開放式議程 / Demo 展. Sections differ per type; see Figma.
 * Hero, the early-bird countdown, 重要時程, Q&A and the closing call to
 * action are shared; the sections in between come in the order of each
 * type's CFP copy.
 */
function SessionPage() {
  const { type } = Route.useParams()
  const page = sessionPages[type]
  const submissionClosed = useSubmissionClosed()
  // Warm the cache with the other types' hero photos, so a tab switch
  // usually shows its photo at once.
  useEffect(() => {
    for (const { hero } of Object.values(sessionPages)) {
      preloadImage(hero.image, heroSizes)
    }
  }, [])
  return (
    <main className="overflow-x-clip">
      {/* Sized for every type's intro, so switching tabs moves nothing. */}
      <PageHero {...page.hero} reserve={heroTexts}>
        <SessionPageTabs type={type} />
      </PageHero>
      <EarlyBirdBanner type={type} />
      <ScheduleSection {...page.schedule} />
      {type === 'demo' ? (
        <DemoSections page={page} />
      ) : (
        <CfpSections type={type} page={page} />
      )}
      {/* Keyed by type, so switching type reopens the first question. */}
      <Faq key={type} items={page.faq} />
      <PhotoCta title={text.cta.title} className="pt-20 pb-15" image={ctaPhoto}>
        {submissionClosed ? (
          <Button shape="pill" disabled>
            {content.submit_closed.button}
          </Button>
        ) : (
          <Link
            to="/submit/$type"
            params={{ type }}
            className={buttonVariants({ shape: 'pill' })}
          >
            {text.cta.submit}
          </Link>
        )}
      </PhotoCta>
      <MoreSubmissions type={type} />
    </main>
  )
}

/**
 * 一般議程 and 開放式議程, in the order of their CFP copy: what it is,
 * examples, 投稿格式, 審稿方式, then the notes before and after submitting.
 */
function CfpSections({
  type,
  page,
}: {
  type: SessionTypeId
  page: SessionPageData
}) {
  return (
    <>
      {type === 'undefined' ? (
        <OpenSessionIntro
          title={page.introTitle}
          description={page.introDescription}
          lead={page.introLead}
          formats={page.intro}
          more={page.introMore}
        />
      ) : (
        <SessionIntroCards
          title={page.introTitle}
          description={page.introDescription}
          lead={page.introLead}
          cards={page.intro}
        />
      )}
      {page.examples && (
        // Keyed by type, so switching type starts on the first page.
        <ExamplesCarousel key={type} {...page.examples} />
      )}
      <CriteriaTable {...page.requirements} />
      <CriteriaTable {...page.reviewCriteria} />
      <InfoCardStack {...page.beforeSubmission} />
      <InfoCardStack {...page.afterSubmission} />
    </>
  )
}

/**
 * Demo 展: what it is, past exhibits and posters, 投稿格式, 審稿方式, then the notes
 * before and after submitting.
 */
function DemoSections({ page }: { page: SessionPageData }) {
  return (
    <>
      <SessionIntroCards
        title={page.introTitle}
        description={page.introDescription}
        lead={page.introLead}
        cards={page.intro}
      />
      <VenuePhotos />
      <PosterStrip />
      <CriteriaTable {...page.requirements} />
      <CriteriaTable {...page.reviewCriteria} />
      <InfoCardStack {...page.beforeSubmission} />
      <InfoCardStack {...page.afterSubmission} />
    </>
  )
}
