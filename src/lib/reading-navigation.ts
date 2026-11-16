import content from '@/content.json'
import type { SessionTypeId } from '@/lib/session-types'

export interface ReadingSectionLink {
  id: string
  title: string
}

/** Major reading sections, in page order; promotional CTAs are separate. */
export function sessionSectionLinks(type: SessionTypeId): ReadingSectionLink[] {
  const text = content.session_page
  const page = text[type]
  return [
    { id: 'schedule', title: text.navigation.schedule },
    { id: 'intro', title: page.introTitle },
    ...(type === 'demo'
      ? [
          { id: 'venue', title: text.demoVenue.title },
          { id: 'posters', title: text.demoPosters.title },
        ]
      : [{ id: 'examples', title: text.examples[type].title }]),
    { id: 'requirements', title: page.requirements.title },
    { id: 'review', title: page.reviewCriteria.title },
    { id: 'before-submission', title: page.beforeSubmission.title },
    { id: 'after-submission', title: page.afterSubmission.title },
    { id: 'faq', title: text.faq.title },
  ]
}

const about = content.about_page

export const aboutSectionLinks: ReadingSectionLink[] = [
  { id: 'media-title', title: about.media.title },
  { id: 'history-title', title: about.navigation.history },
  { id: 'review-2026-title', title: about.navigation.review },
  { id: 'activities-title', title: about.navigation.activities },
  { id: 'participate-title', title: about.navigation.participate },
]
