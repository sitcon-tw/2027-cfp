import content from '@/content.json'
import { SubmissionNotice } from '@/components/submit/submission-notice'
import { formatDateTime } from '@/lib/schedule'

const text = content.submit_closed

/** 投稿已截止: replaces the submission form once the deadline has passed. */
export function SubmissionClosed({ deadline }: { deadline: Date }) {
  return (
    <SubmissionNotice
      title={text.title}
      description={text.description.replace(
        '{deadline}',
        formatDateTime(deadline),
      )}
    />
  )
}
