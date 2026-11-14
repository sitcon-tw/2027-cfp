import { createFileRoute } from '@tanstack/react-router'

import { HeroBackdrop } from '@/components/hero-backdrop'
import { AboutSection } from '@/components/home/about-section'
import { AttendSection } from '@/components/home/attend-section'
import { Hero } from '@/components/home/hero'
import { ParticipationSection } from '@/components/home/participation-section'
import { SpeakerSection } from '@/components/home/speaker-section'
import { SponsorSection } from '@/components/home/sponsor-section'
import { SubmissionDeadline } from '@/components/home/submission-deadline'
import { ThemeSection } from '@/components/home/theme-section'
import { findTicket } from '@/lib/tickets'

export const Route = createFileRoute('/')({
  // `ticket`: the ticket whose details are open, so a post can
  // link straight to one (`/?ticket=far`). Unknown ids are dropped.
  validateSearch: (search: Record<string, unknown>): { ticket?: string } =>
    typeof search.ticket === 'string' && findTicket(search.ticket)
      ? { ticket: search.ticket }
      : {},
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
        <SpeakerSection />
        <AttendSection />
      </div>
      <ParticipationSection />
      <SponsorSection />
      <ThemeSection />
    </main>
  )
}
