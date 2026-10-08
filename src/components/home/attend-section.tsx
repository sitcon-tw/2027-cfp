import {
  CalendarDays,
  GitPullRequest,
  HandHeart,
  MapPin,
  Sprout,
  Ticket,
  type LucideIcon,
} from 'lucide-react'

import content from '@/content.json'
import { ScheduleCard } from '@/components/home/schedule-card'
import { SectionHeading } from '@/components/section-heading'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/** Icon per ticket id in `content.attend_section.tickets`. */
const ticketIcons: Record<string, LucideIcon> = {
  contributor: GitPullRequest,
  far: MapPin,
  dream: Sprout,
  supporter: HandHeart,
  general: Ticket,
}

/**
 * 想要參與？ — every ticket type with a one-line "who it's for", since the
 * names alone (開源築夢計畫, 遠道而來票) don't explain themselves. The dates
 * live in the schedule dialog.
 */
export function AttendSection() {
  const { tickets } = content.attend_section

  return (
    <section
      id="attend"
      aria-labelledby="attend-title"
      className="px-2.5 py-15"
    >
      <div className="mx-auto flex max-w-content flex-col gap-2.5 p-2.5">
        <SectionHeading id="attend-title">
          {content.attend_section.title}
        </SectionHeading>
        <p className="pt-2.5 text-paragraph">
          {content.attend_section.description}
        </p>
        {/* One stack, so only its outer corners are xl. */}
        <ul className="flex w-full flex-col gap-2.5 pt-5 pb-2.5">
          {tickets.map(({ id, name, summary }, index) => {
            const Icon = ticketIcons[id] ?? Ticket
            return (
              <li key={id}>
                <Card
                  className={cn(
                    'flex flex-wrap items-center gap-x-5 gap-y-1.25 px-7.5 py-5',
                    index === 0 && 'rounded-t-xl',
                    index === tickets.length - 1 && 'rounded-b-xl',
                  )}
                >
                  <Icon aria-hidden className="size-8 shrink-0" />
                  <h3 className="text-h3 font-bold md:basis-55">{name}</h3>
                  <p className="text-paragraph text-gray max-md:basis-full">
                    {summary}
                  </p>
                </Card>
              </li>
            )
          })}
        </ul>
        <div className="w-full pt-5">
          <ScheduleCard
            icon={CalendarDays}
            title={content.attend_section.scheduleTitle}
            description={content.attend_section.scheduleDescription}
            action={content.attend_section.viewSchedule}
            dialogDescription={content.attend_section.dialogDescription}
            items={tickets}
          />
        </div>
      </div>
    </section>
  )
}
