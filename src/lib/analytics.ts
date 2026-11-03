import type { SessionTypeId } from '@/lib/session-type-ids'

/**
 * Conversion events for Google Tag Manager, which the sitcon.org page shell
 * loads (`GTM-NPVBCDZ`). GTM picks them up from `window.dataLayer` and maps
 * them to its tags (e.g. the Meta Pixel's `Lead` and `SubmitApplication`), so
 * the site never talks to an ad platform itself. Events carry no personal
 * data: only the session type and the 投稿編號.
 */

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}

function push(event: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  ;(window.dataLayer ??= []).push(event)
}

/** A new submission was sent and now awaits its verification email. */
export function trackSubmissionSent(type: SessionTypeId) {
  push({ event: 'cfp_submission_sent', submission_type: type })
}

/**
 * A new submission was verified, which completes it. Sent once per
 * submission (see `VerifyResponse.newSubmission`); `submission_id` doubles as
 * the event ID for deduplicating against a server-side event later.
 */
export function trackSubmissionVerified(type: SessionTypeId, id: string) {
  push({
    event: 'cfp_submission_verified',
    submission_type: type,
    submission_id: id,
  })
}
