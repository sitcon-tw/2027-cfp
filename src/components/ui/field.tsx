import { Field as BaseField } from '@base-ui/react/field'

import { cn } from '@/lib/utils'

type WithClassName<P> = Omit<P, 'className'> & { className?: string }

/**
 * One form field: label above the control, then description and error. Base
 * UI links the label, description and error to the control.
 */
export function Field({
  className,
  ...props
}: WithClassName<BaseField.Root.Props>) {
  return (
    <BaseField.Root
      className={cn('flex w-full flex-col gap-2.5 py-2.5', className)}
      {...props}
    />
  )
}

export function FieldLabel({
  className,
  ...props
}: WithClassName<BaseField.Label.Props>) {
  return (
    <BaseField.Label
      className={cn('text-paragraph text-foreground', className)}
      {...props}
    />
  )
}

/** Help text under the control. Not in Figma yet — a proposal. */
export function FieldDescription({
  className,
  ...props
}: WithClassName<BaseField.Description.Props>) {
  return (
    <BaseField.Description
      className={cn('text-body text-light', className)}
      {...props}
    />
  )
}

/** The validation message. Not in Figma yet — red text is a proposal. */
export function FieldError({
  className,
  ...props
}: WithClassName<BaseField.Error.Props>) {
  return (
    <BaseField.Error
      className={cn('text-body text-red', className)}
      {...props}
    />
  )
}
