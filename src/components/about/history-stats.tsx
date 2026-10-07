import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'

/** SITCON 自 2012 年來 — totals since the first conference. */
export function HistoryStats() {
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder
        label={content.about_page.placeholders.history}
        className="mx-auto max-w-content"
      />
    </section>
  )
}
