import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'

export interface ActionCardProps {
  icon: LucideIcon
  title: string
  description: string
  /** Extra lines under the description. */
  children?: ReactNode
  /** The button on the right, usually a dialog trigger. */
  action: ReactNode
}

/**
 * Cream card with an icon, a title and description, and one action on the
 * right (不知道你適合哪一種議程？, 索票日程, 投稿日程, …).
 */
export function ActionCard({
  icon: Icon,
  title,
  description,
  children,
  action,
}: ActionCardProps) {
  return (
    <Card className="rounded-xl py-4 pr-7.5 pl-5">
      <div className="flex flex-wrap items-center gap-2.5 pl-1.25">
        <Icon aria-hidden className="mx-2.5 size-12 shrink-0" />
        <div className="grow basis-60 p-2.5">
          <h3 className="text-h3 font-bold">{title}</h3>
          <p className="text-paragraph text-gray">{description}</p>
          {children}
        </div>
        {/* ml-auto keeps it right-aligned when it wraps onto its own row. */}
        <div className="ml-auto">{action}</div>
      </div>
    </Card>
  )
}
