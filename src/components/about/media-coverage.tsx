import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'

/** 媒體報導 — news cards linking to the articles. */
export function MediaCoverage() {
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder
        label={content.about_page.placeholders.media}
        className="mx-auto max-w-content"
      />
    </section>
  )
}
