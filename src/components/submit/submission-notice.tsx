import { useId } from 'react'

import { LinkedText } from '@/components/linked-text'

/**
 * A titled message in place of the submission form: 投稿已截止, the
 * verification outcome, or an edit link that can't be loaded. Not in Figma;
 * titled like the 參考更多稿件 sub-heading. `live` announces changes, for
 * messages that follow a request.
 */
export function SubmissionNotice({
  title,
  description,
  live = false,
}: {
  title: string
  description: string
  live?: boolean
}) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="px-2.5 py-15">
      <div
        aria-live={live ? 'polite' : undefined}
        className="mx-auto flex max-w-content flex-col gap-5 p-2.5"
      >
        <h2 id={titleId} className="text-h1 font-extrabold text-balance">
          {title}
        </h2>
        <p className="text-paragraph">
          <LinkedText text={description} />
        </p>
      </div>
    </section>
  )
}
