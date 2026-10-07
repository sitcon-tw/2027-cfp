import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'

/** 我們舉辦的活動 — alternating photo and text cards. */
export function Activities() {
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder
        label={content.about_page.placeholders.activities}
        className="mx-auto max-w-content"
      />
    </section>
  )
}
