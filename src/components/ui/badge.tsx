import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const tones = {
  light: 'bg-light text-gray',
  red: 'bg-red text-background',
  blue: 'bg-blue text-background',
  green: 'bg-green text-background',
}

export type BadgeTone = keyof typeof tones

export interface BadgeProps extends ComponentProps<'span'> {
  tone?: BadgeTone
}

/** Static pill label: schedule statuses, form field metadata. */
export function Badge({ tone = 'light', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2.5 text-body font-bold',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
