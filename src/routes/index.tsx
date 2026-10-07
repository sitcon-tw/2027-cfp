import { createFileRoute } from '@tanstack/react-router'

import { Hero } from '@/components/home/hero'
import { HomeBackdrop } from '@/components/home/home-backdrop'
import { SpeakerSection } from '@/components/home/speaker-section'
import { SponsorSection } from '@/components/home/sponsor-section'
import { SubmissionDeadline } from '@/components/home/submission-deadline'
import { Placeholder } from '@/components/placeholder'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="overflow-x-clip">
      <div className="relative isolate pt-header">
        <HomeBackdrop />
        <Hero />
        <SubmissionDeadline />
        {/* 甚麼是 SITCON ? and 重要時程 */}
        <div className="px-2.5 py-15">
          <Placeholder label="Nathan 詠唱" className="mx-auto max-w-content" />
        </div>
        <SpeakerSection />
      </div>
      <SponsorSection />
    </main>
  )
}
