import content from '@/content.json'
import type { SessionTypeId } from '@/lib/session-types'

export interface SessionSectionLink {
  id: string
  title: string
}

/** Major reading sections, in page order; promotional CTAs are separate. */
export function sessionSectionLinks(type: SessionTypeId): SessionSectionLink[] {
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
