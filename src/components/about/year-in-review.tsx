import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'

/** 回顧 2026 年 — last year's figures and charts. */
export function YearInReview() {
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder
        label={content.about_page.placeholders.yearInReview}
        className="mx-auto max-w-content"
      />
    </section>
  )
}
