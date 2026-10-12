import type { LucideIcon } from 'lucide-react'

import content from '@/content.json'
import { ActionCard } from '@/components/action-card'
import { Badge, type BadgeTone } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  formatScheduleDate,
  scheduleStatus,
  type ScheduleItem,
  type ScheduleStatus,
} from '@/lib/schedule'
import { cn } from '@/lib/utils'

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
 * Teaser card for a schedule (ticketing, submission, a session type's
 * 重要時程). The full timeline
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

const dotClassNames: Record<ScheduleStatus, string> = {
  unannounced: 'border-2 border-gray/40 bg-foreground',
  upcoming: 'bg-blue',
  open: 'bg-green ring-4 ring-green/30',
  closed: 'bg-gray/40',
}

/** Unannounced items get no badge, so a missing date stays low-key. */
const badgeTones: Record<Exclude<ScheduleStatus, 'unannounced'>, BadgeTone> = {
  upcoming: 'blue',
  open: 'green',
  closed: 'light',
}

function ScheduleTimeline({ items }: { items: ScheduleItem[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((item) => {
        const status = scheduleStatus(item)
        return (
          <li
            key={item.id}
            className={cn(
              'group flex gap-5',
              status === 'closed' && 'opacity-60',
            )}
          >
            {/* Rail: a dot per item, joined by a line to the next one. */}
            <div aria-hidden className="flex flex-col items-center pt-2.5">
              <span
                className={cn('size-4 rounded-full', dotClassNames[status])}
              />
              <span className="mt-2.5 w-0.5 grow rounded-full bg-gray/20 group-last:hidden" />
            </div>
            <div className="flex flex-1 flex-col gap-1.25 pb-7.5 group-last:pb-0">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.25">
                <h3 className="text-lead font-bold">{item.name}</h3>
                {status !== 'unannounced' && (
                  <Badge tone={badgeTones[status]}>
                    {content.schedule.status[status]}
                  </Badge>
                )}
              </div>
              {(item.label || status !== 'unannounced') && (
                <p className="font-numeric text-body font-medium text-gray">
                  {item.label ?? formatScheduleDate(item)}
                </p>
              )}
              {item.summary && (
                <p className="text-paragraph font-bold">{item.summary}</p>
              )}
              {item.description && (
                <p className="text-paragraph text-gray">{item.description}</p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
