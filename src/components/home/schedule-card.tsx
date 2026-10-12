import type { LucideIcon } from 'lucide-react'

import content from '@/content.json'
import { ActionCard } from '@/components/action-card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScheduleTimeline } from '@/components/schedule-timeline'
import type { ScheduleItem } from '@/lib/schedule'

export interface ScheduleCardProps {
  icon: LucideIcon
  title: string
  description: string
  /** Trigger label, e.g. 查看索票日程. */
  action: string
  /** Shown under the title inside the dialog. */
  dialogDescription: string
  items: ScheduleItem[]
}

/**
 * Teaser card for a schedule (ticketing or submission). The full timeline
 * opens in a dialog (a bottom sheet on mobile), like the session quiz.
 */
export function ScheduleCard({
  icon,
  title,
  description,
  action,
  dialogDescription,
  items,
}: ScheduleCardProps) {
  return (
    <ActionCard
      icon={icon}
      title={title}
      description={description}
      action={
        <Dialog>
          <DialogTrigger render={<Button variant="dark" />}>
            {action}
          </DialogTrigger>
          <DialogContent className="flex flex-col gap-7.5">
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex flex-col gap-1.25">
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{dialogDescription}</DialogDescription>
              </div>
              <DialogClose aria-label={content.schedule.close} />
            </div>
            <ScheduleTimeline items={items} />
          </DialogContent>
        </Dialog>
      }
    />
  )
}
