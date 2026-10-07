import { createFileRoute } from '@tanstack/react-router'

import { AboutIntro } from '@/components/about/about-intro'
import { Activities } from '@/components/about/activities'
import { HistoryStats } from '@/components/about/history-stats'
import { MediaCoverage } from '@/components/about/media-coverage'
import { PhotoStrip } from '@/components/about/photo-strip'
import { YearInReview } from '@/components/about/year-in-review'

export const Route = createFileRoute('/about')({
  component: About,
})

/** 關於 SITCON. The intro and photos sit on cream, the rest on the dark page. */
function About() {
  return (
    <main className="overflow-x-clip">
      <div className="bg-foreground pt-header text-background">
        <AboutIntro />
        <PhotoStrip />
      </div>
      <MediaCoverage />
      <HistoryStats />
      <YearInReview />
      <Activities />
    </main>
  )
}
