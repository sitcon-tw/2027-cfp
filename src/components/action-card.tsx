import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface ActionCardProps {
  /** The leading icon; pass `media` instead for an image. */
  icon?: LucideIcon
  /** A leading image in place of `icon`, sized to `cardMediaClassName`. */
  media?: ReactNode
  title: string
  description: string
  /** Extra content under the description, in the text column. */
  children?: ReactNode
  /** The button on the right, usually a dialog trigger. */
  action?: ReactNode
  /** Surface overrides, e.g. another background. */
  className?: string
  /** Description color; gray suits the cream surface. */
  descriptionClassName?: string
}

/** The leading icon or image of every card built on this layout. */
export const cardMediaClassName = 'size-12 shrink-0'

/** Padding shared by the cards that line up with ActionCard. */
export const cardPaddingClassName = 'px-7.5 py-5'

/**
 * Cream card with an icon, a title and description, and an optional action
 * on the right (不知道你適合哪一種議程？, 索票日程, 投稿日程, …). The icon
 * and the action both center on the title and description, and everything
 * after the icon starts at the same x on every card built from this layout.
 */
export function ActionCard({
  icon: Icon,
  media,
  title,
  description,
  children,
  action,
  className,
  descriptionClassName = 'text-gray',
}: ActionCardProps) {
  return (
    <Card className={cn('rounded-xl', cardPaddingClassName, className)}>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
        <div className="flex grow basis-60 flex-col">
          {/* The icon centers on the title and description, like the action. */}
          <div className="flex items-center gap-5">
            {media ??
              (Icon && <Icon aria-hidden className={cardMediaClassName} />)}
            <div className="flex min-w-0 flex-1 flex-col">
              <h3 className="text-h3 font-bold">{title}</h3>
              <p className={cn('text-paragraph', descriptionClassName)}>
                {description}
              </p>
            </div>
          </div>
          {/* Indented past the icon (size-12 + gap-5) to stay in the text column. */}
          {children && <div className="pl-17">{children}</div>}
        </div>
        {/* ml-auto keeps it right-aligned when it wraps onto its own row. */}
        {action && <div className="ml-auto">{action}</div>}
      </div>
    </Card>
  )
}
