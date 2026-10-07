import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'
import { getSessionType, type SessionTypeId } from '@/lib/session-types'

/** Q&A — the session type's questions as an accordion. */
export function Faq({ type }: { type: SessionTypeId }) {
  const { title } = getSessionType(type)
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder
        label={content.session_page.placeholders.faq.replace('{title}', title)}
        className="mx-auto max-w-content"
      />
    </section>
  )
}
