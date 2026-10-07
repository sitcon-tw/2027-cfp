import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'
import { getSessionType, type SessionTypeId } from '@/lib/session-types'

/** The fields, consent checkbox and submit button for one session type. */
export function SubmissionForm({ type }: { type: SessionTypeId }) {
  const { title } = getSessionType(type)
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder
        label={content.submit_page.placeholders.form.replace('{title}', title)}
        className="mx-auto max-w-content"
      />
    </section>
  )
}
