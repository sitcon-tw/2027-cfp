import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'

/** 歷年海報展示 — horizontally scrolling row of past Demo posters. */
export function PosterStrip() {
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder
        label={content.session_page.placeholders.demoPosters}
        className="mx-auto max-w-content"
      />
    </section>
  )
}
