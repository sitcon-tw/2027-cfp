import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'
import { getSessionType, type SessionTypeId } from '@/lib/session-types'

/** 議程種別 / 議程介紹 — one card per format of the session type. */
export function SessionIntroCards({ type }: { type: SessionTypeId }) {
  const { title } = getSessionType(type)
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder
        label={content.session_page.placeholders.intro.replace(
          '{title}',
          title,
        )}
        className="mx-auto max-w-content"
      />
    </section>
  )
}
