import { Separator as BaseSeparator } from '@base-ui/react/separator'

import { cn } from '@/lib/utils'

export interface SeparatorProps extends Omit<BaseSeparator.Props, 'className'> {
  className?: string
}

export function Separator({ className, ...props }: SeparatorProps) {
  return (
    <BaseSeparator
      className={cn(
        'shrink-0 bg-gray data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch',
        className,
      )}
      {...props}
    />
  )
}
