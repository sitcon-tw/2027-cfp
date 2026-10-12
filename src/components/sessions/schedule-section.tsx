import { CalendarDays } from 'lucide-react'

import content from '@/content.json'
import { ScheduleCard } from '@/components/schedule-card'
import type { ScheduleItem } from '@/lib/schedule'

const text = content.session_page.schedule

/**
 * 重要時程: the homepage's schedule card, whose button opens the session
 * type's dates in the timeline dialog. Shares the early-bird banner's column.
 */
export function ScheduleSection({ items }: { items: ScheduleItem[] }) {
  return (
    <section className="px-2.5 py-15">
      <div className="mx-auto max-w-content px-2.5">
        <ScheduleCard
          icon={CalendarDays}
          title={text.title}
          description={text.description}
          action={text.viewSchedule}
          dialogDescription={content.speaker_section.dialogDescription}
          items={items}
        />
      </div>
    </section>
  )
}
