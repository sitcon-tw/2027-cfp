import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'

/** 關於 SITCON — page title, subtitle and introduction on cream. */
export function AboutIntro() {
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder
        label={content.about_page.placeholders.intro}
        className="mx-auto max-w-content"
      />
    </section>
  )
}
