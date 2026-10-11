import { useId } from 'react'

import content from '@/content.json'
import { LinkedText } from '@/components/linked-text'
import { formatDateTime } from '@/lib/schedule'

const text = content.submit_closed

/**
 * 投稿已截止: replaces the submission form once the deadline has passed.
 * Not in Figma; titled like the 參考更多稿件 sub-heading.
 */
export function SubmissionClosed({ deadline }: { deadline: Date }) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="px-2.5 py-15">
      <div className="mx-auto flex max-w-content flex-col gap-5 p-2.5">
        <h2 id={titleId} className="text-h1 font-extrabold text-balance">
          {text.title}
        </h2>
        <p className="text-paragraph">
          <LinkedText
            text={text.description.replace(
              '{deadline}',
              formatDateTime(deadline),
            )}
          />
        </p>
      </div>
    </section>
  )
}
