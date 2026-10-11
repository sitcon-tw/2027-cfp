import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset'

import content from '@/content.json'
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
 * The group title with a half-cream rule under it. Wrapping a
 * `CheckboxGroup` or `RadioGroup` in a `Fieldset` makes this its legend.
 */
export function FieldsetLegend({
  className,
  children,
  position,
  total,
  ...props
}: WithClassName<BaseFieldset.Legend.Props> & {
  position?: number
  total?: number
}) {
  const text = content.submit_page
  const cue =
    position != null && total != null
      ? text.sectionPosition
          .replace('{position}', String(position).padStart(2, '0'))
          .replace('{total}', String(total).padStart(2, '0'))
      : null

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
        {cue ? (
          <span
            aria-hidden="true"
            className="shrink-0 font-numeric text-caption font-medium text-light"
          >
            {cue}
          </span>
        ) : null}
      </div>
      <span aria-hidden className="h-0.75 rounded-full bg-foreground/50" />
    </BaseFieldset.Legend>
  )
}
