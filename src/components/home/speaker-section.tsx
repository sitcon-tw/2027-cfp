import { CalendarDays } from 'lucide-react'

import content from '@/content.json'
import bottomIcon from '@/assets/sitcon-icon-backdrop-bottom.svg'
import { ScheduleCard } from '@/components/home/schedule-card'
import { SessionQuiz } from '@/components/home/session-quiz'
import { SessionTypeTabs } from '@/components/home/session-type-tabs'
import { SectionHeading } from '@/components/section-heading'

/**
 * 想要成為舞臺上的講者？ — session types, the session-type quiz and the
 * submission schedule.
 */
export function SpeakerSection() {
  return (
    <section
      id="speakers"
      aria-labelledby="speakers-title"
      className="relative isolate px-2.5 pt-15 pb-40"
    >
      <img
        src={bottomIcon}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-188 -left-24.5 -z-10 -rotate-21 blur-md"
      />
      {/* Darkens toward the bottom, over the icon. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/0 via-black/36 via-24% to-black/40 to-83%" />
      <div className="mx-auto flex max-w-content flex-col gap-2.5 p-2.5">
        <SectionHeading id="speakers-title">
          {content.speaker_section.title}
        </SectionHeading>
        <div className="w-full pt-5 pb-2.5">
          <SessionTypeTabs />
        </div>
        <div className="w-full pt-7.5">
          <SessionQuiz />
        </div>
        <div className="w-full pt-7.5 pb-12.5">
          <ScheduleCard
            icon={CalendarDays}
            title={content.speaker_section.scheduleTitle}
            description={content.speaker_section.scheduleDescription}
            action={content.speaker_section.viewSchedule}
            dialogDescription={content.speaker_section.dialogDescription}
            items={content.speaker_section.schedule}
          />
        </div>
      </div>
    </section>
  )
}
