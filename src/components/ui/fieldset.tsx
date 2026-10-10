import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset'

import { cn } from '@/lib/utils'

type WithClassName<P> = Omit<P, 'className'> & { className?: string }

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
 * The group title with a half-cream rule under it. Wrapping a
 * `CheckboxGroup` or `RadioGroup` in a `Fieldset` makes this its legend.
 */
export function FieldsetLegend({
  className,
  children,
  ...props
}: WithClassName<BaseFieldset.Legend.Props>) {
  return (
    <BaseFieldset.Legend
      className={cn(
        'flex flex-col gap-2.5 text-h3 font-bold text-foreground',
        className,
      )}
      {...props}
    >
      {children}
      <span aria-hidden className="h-0.75 rounded-full bg-foreground/50" />
    </BaseFieldset.Legend>
  )
}
