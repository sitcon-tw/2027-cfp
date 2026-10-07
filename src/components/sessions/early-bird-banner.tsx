import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'

/** Early Bird marquee and the early-bird submission countdown. */
export function EarlyBirdBanner() {
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder
        label={content.session_page.placeholders.earlyBird}
        className="mx-auto max-w-content"
      />
    </section>
  )
}
