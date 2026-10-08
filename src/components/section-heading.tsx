import type { ReactNode } from 'react'

import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export interface SectionHeadingProps {
  /** For the section's `aria-labelledby`. */
  id: string
  children: ReactNode
  className?: string
}

/**
 * Left-aligned section title over a rule (想要參與？, 我要贊助, …). The rule
 * takes the text color, so it works on the dark page and on cream.
 */
export function SectionHeading({
  id,
  children,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('flex w-full flex-col gap-2.5', className)}>
      <h2 id={id} className="text-display font-extrabold text-balance">
        {children}
      </h2>
      <Separator className="rounded-full bg-current opacity-50 data-[orientation=horizontal]:h-0.75" />
    </div>
  )
}
