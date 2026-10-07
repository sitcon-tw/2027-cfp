import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

const tones = {
  cream: 'bg-foreground text-background',
  light: 'bg-light text-background',
  gray: 'bg-gray text-foreground',
  ink: 'bg-background text-foreground',
}

export type CardTone = keyof typeof tones

export interface CardProps extends ComponentProps<'div'> {
  tone?: CardTone
}

/**
 * Static surface. Defaults to `rounded-sm` on every corner; callers set the
 * outer corners to `xl` per the corner rule in AGENTS.md.
 */
export function Card({ tone = 'cream', className, ...props }: CardProps) {
  return (
    <div
      className={cn('overflow-clip rounded-sm', tones[tone], className)}
      {...props}
    />
  )
}
