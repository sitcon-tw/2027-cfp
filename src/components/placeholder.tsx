import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export interface PlaceholderProps extends ComponentProps<'div'> {
  label: string
}

/** Stand-in for regions that are not designed yet. See AGENTS.md. */
export function Placeholder({ label, className, ...props }: PlaceholderProps) {
  return (
    <div
      className={cn(
        'flex min-h-40 items-center justify-center rounded-sm border-2 border-dashed border-gray p-5 text-h3 font-bold text-gray',
        className,
      )}
      {...props}
    >
      {label}
    </div>
  )
}
