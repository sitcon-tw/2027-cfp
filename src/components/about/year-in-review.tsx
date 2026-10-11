import content from '@/content.json'
import { PageSection } from '@/components/about/page-section'
import { StatGrid } from '@/components/about/stat-grid'
import { PieChart, type PieScale } from '@/components/about/pie-chart'
import { Card } from '@/components/ui/card'

const review = content.about_page.review

/**
 * 回顧 2026 年 — last year's figures, then a card per chart of who
 * registered, with the data source and its caveat underneath.
 */
export function YearInReview() {
  return (
    <PageSection id="review-2026" title={review.title}>
      <div className="flex flex-col gap-5">
        <StatGrid stats={review.stats} className="sm:grid-cols-3" />
        <ul className="grid gap-5 md:grid-cols-2">
          {review.charts.map(({ title, items, scale }) => (
            <li key={title} className="flex">
              <Card
                tone="gray"
                className="flex flex-1 flex-col gap-5 rounded-lg p-5"
              >
                <h3 className="text-h3 font-bold">{title}</h3>
                <PieChart
                  title={title}
                  items={items}
                  scale={scale as PieScale}
                />
              </Card>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-1 text-body text-light">
          <p>{review.source}</p>
          <p>{review.note}</p>
        </div>
      </div>
    </PageSection>
  )
}
