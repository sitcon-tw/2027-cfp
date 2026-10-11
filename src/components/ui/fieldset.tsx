import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset'
import type { ReactNode } from 'react'

import { cn, type WithClassName } from '@/lib/utils'

/** A titled group of fields, e.g. 輸入欄位 or 單選與多選. */
export function Fieldset({
  className,
  ...props
}: WithClassName<BaseFieldset.Root.Props>) {
  return (
    <BaseFieldset.Root
      className={cn('flex flex-col gap-2.5', className)}
      {...props}
    />
  )
}

/**
 * The group title with a half-cream rule under it, and optional `aside`
 * content at the far end of the title row. Wrapping a `CheckboxGroup` or
 * `RadioGroup` in a `Fieldset` makes this its legend.
 */
export function FieldsetLegend({
  className,
  children,
  aside,
  ...props
}: WithClassName<BaseFieldset.Legend.Props> & { aside?: ReactNode }) {
  return (
    <BaseFieldset.Legend
      className={cn(
        'flex flex-col gap-2.5 text-h3 font-bold text-foreground',
        className,
      )}
      {...props}
    >
      <div className="flex items-baseline justify-between gap-2.5">
        {children}
        {aside}
      </div>
      <span aria-hidden className="h-0.75 rounded-full bg-foreground/50" />
    </BaseFieldset.Legend>
  )
}
