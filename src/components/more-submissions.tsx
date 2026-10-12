import { useId } from 'react'

import content from '@/content.json'
import { SessionTypeLinks } from '@/components/session-type-links'
import { sessionTypes, type SessionTypeId } from '@/lib/session-types'

const text = content.submit_page

/**
 * 參考更多稿件: one card per other session type, linking to its session
 * page, as on the homepage. Ends the submission page, and the session
 * pages after their 想要在舞臺發光發熱？ call to action. The title is a
 * sub-heading (`text-h1`, no rule), like the 想要在舞臺發光發熱？ band it
 * follows, not a full section title.
 */
export function MoreSubmissions({ type }: { type: SessionTypeId }) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="px-2.5 py-15">
      <div className="mx-auto flex max-w-content flex-col gap-5 p-2.5">
        <h2 id={titleId} className="text-h1 font-extrabold text-balance">
          {text.moreSubmissions}
        </h2>
        <SessionTypeLinks
          types={sessionTypes.filter((other) => other.id !== type)}
          row
        />
      </div>
    </section>
  )
}
