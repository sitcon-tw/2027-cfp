import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'

/** 歷年展區圖片 — two-column photo wall of past Demo booths. */
export function DemoGallery() {
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder
        label={content.session_page.placeholders.demoGallery}
        className="mx-auto max-w-content"
      />
    </section>
  )
}
