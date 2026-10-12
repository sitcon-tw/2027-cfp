import { ScheduleTimeline } from '@/components/schedule-timeline'
import { SessionSection } from '@/components/sessions/session-section'
import { Card } from '@/components/ui/card'
import type { ScheduleItem } from '@/lib/schedule'

export interface ScheduleSectionProps {
  title: string
  items: ScheduleItem[]
}

/**
 * 重要時程: the session type's dates on the homepage schedule's timeline,
 * on a cream card like the schedule dialog.
 */
export function ScheduleSection({ title, items }: ScheduleSectionProps) {
  return (
    <SessionSection title={title}>
      <Card className="rounded-xl p-5 md:p-7.5">
        <ScheduleTimeline items={items} />
      </Card>
    </SessionSection>
  )
}
