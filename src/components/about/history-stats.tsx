import content from '@/content.json'
import { PageSection } from '@/components/about/page-section'
import { StatGrid } from '@/components/about/stat-grid'

const history = content.about_page.history

/** SITCON 自 2012 年來 — totals since the first conference. */
export function HistoryStats() {
  return (
    <PageSection id="history" title={history.title}>
      <StatGrid stats={history.stats} className="grid-cols-2 md:grid-cols-4" />
    </PageSection>
  )
}
