import { CalendarDays } from 'lucide-react'

import content from '@/content.json'
import { ScheduleCard } from '@/components/schedule-card'
import type { ScheduleItem } from '@/lib/schedule'

const text = content.session_page.schedule

export interface ScheduleSectionProps {
  /** What the dialog lists, e.g. 錄取通知、試講、彩排與年會日期. */
  description: string
  items: ScheduleItem[]
}

/**
 * 更多重要時程: the homepage's schedule card, whose button opens the session
 * type's dates in the timeline dialog. It follows on from the early-bird
 * banner, so it pulls up into that section's bottom padding and sits one
 * tile gap (`gap-2.5`) under it.
 */
export function ScheduleSection({ description, items }: ScheduleSectionProps) {
  return (
    <section className="-mt-12.5 px-2.5 pb-15">
      <div className="mx-auto max-w-content px-2.5">
        <ScheduleCard
          icon={CalendarDays}
          title={text.title}
          description={description}
          action={text.viewSchedule}
          dialogDescription={content.speaker_section.dialogDescription}
          items={items}
        />
      </div>
    </section>
  )
}
