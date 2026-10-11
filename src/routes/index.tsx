import { createFileRoute } from '@tanstack/react-router'

import { HeroBackdrop } from '@/components/hero-backdrop'
import { AboutSection } from '@/components/home/about-section'
import { AttendSection } from '@/components/home/attend-section'
import { Hero } from '@/components/home/hero'
import { SpeakerSection } from '@/components/home/speaker-section'
import { SponsorSection } from '@/components/home/sponsor-section'
import { SubmissionDeadline } from '@/components/home/submission-deadline'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="overflow-x-clip">
      <div className="relative isolate pt-header">
        <HeroBackdrop />
        <Hero />
        <SubmissionDeadline />
        <AboutSection />
        <AttendSection />
        <SpeakerSection />
      </div>
      <SponsorSection />
    </main>
  )
}
