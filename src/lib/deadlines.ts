import content from '@/content.json'

/**
 * Parses an ISO timestamp with a time zone, or `null` while it is not
 * announced. Invalid strings count as unannounced.
 */
export function parseDeadline(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** The end of a speaker-schedule item in `content.json`, by id. */
function scheduleEnd(id: string) {
  const item = content.speaker_section.schedule.find((item) => item.id === id)
  return parseDeadline(item?.end as string | null | undefined)
}

/**
 * Deadlines from `content.speaker_section.schedule`: the countdowns show the
 * end of 早鳥投稿, then the end of 投稿期間, which also closes submissions.
 * React-free, so the submission API enforces the same submission deadline.
 */
export const deadlines = {
  submission: scheduleEnd('submission'),
  earlyBird: scheduleEnd('early'),
}

/** Whether submissions (and edits) are closed at `now`. */
export function isSubmissionClosed(now = Date.now()) {
  return deadlines.submission !== null && now >= deadlines.submission.getTime()
}
