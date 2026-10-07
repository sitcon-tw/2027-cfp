import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'

/** Two staggered rows of event photos, bleeding past the content column. */
export function PhotoStrip() {
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder
        label={content.about_page.placeholders.photoStrip}
        className="mx-auto max-w-content"
      />
    </section>
  )
}
