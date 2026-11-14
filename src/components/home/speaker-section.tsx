import { CalendarDays } from 'lucide-react'

import content from '@/content.json'
import { ScheduleCard } from '@/components/schedule-card'
import { SessionQuiz } from '@/components/home/session-quiz'
import { SectionHeading } from '@/components/section-heading'
import { SessionTypeLinks } from '@/components/session-type-links'
import { sessionTypes } from '@/lib/session-types'

/**
 * 想要成為舞臺上的講者？ — session types, the session-type quiz and the
 * submission schedule.
 */
export function SpeakerSection() {
  return (
    <section
      id="speakers"
      aria-labelledby="speakers-title"
      className="px-2.5 py-15"
    >
      <div className="mx-auto flex max-w-content flex-col gap-2.5 p-2.5">
        <SectionHeading id="speakers-title">
          {content.speaker_section.title}
        </SectionHeading>
        <div className="w-full pt-5 pb-2.5">
          <SessionTypeLinks types={sessionTypes} />
        </div>
        <div className="w-full pt-7.5">
          <SessionQuiz />
        </div>
        <div className="w-full pt-7.5">
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
