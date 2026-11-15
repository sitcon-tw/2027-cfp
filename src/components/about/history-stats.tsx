import { ArrowUpRight } from 'lucide-react'

import content from '@/content.json'
import { PageSection } from '@/components/about/page-section'
import { StatGrid } from '@/components/about/stat-grid'
import { links } from '@/lib/links'

const history = content.about_page.history

/** SITCON 自 2012 年來 — totals since the first conference. */
export function HistoryStats() {
  return (
    <PageSection id="history" title={history.title}>
      <StatGrid stats={history.stats} className="grid-cols-2 md:grid-cols-4" />
      <div className="flex flex-col gap-2.5 pt-10">
        <p className="text-paragraph">{history.creditsDescription}</p>
        <a
          href={links.credits}
          className="inline-flex min-h-control items-center gap-2.5 self-start rounded-xs text-paragraph underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          {history.creditsAction}
          <ArrowUpRight aria-hidden className="size-5 shrink-0" />
        </a>
      </div>
    </PageSection>
  )
}
