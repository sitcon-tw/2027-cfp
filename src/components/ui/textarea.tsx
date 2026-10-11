import { Field } from '@base-ui/react/field'

import { inputClassName } from '@/components/ui/input'
import { cn, type WithClassName } from '@/lib/utils'

/**
 * A multi-line `Input`. Not in Figma: the height and vertical padding are
 * our own.
 */
export function Textarea({
  className,
  ...props
}: WithClassName<Field.Control.Props>) {
  return (
    <Field.Control
      render={<textarea />}
      className={cn(inputClassName, 'min-h-40 resize-y py-4', className)}
      {...props}
    />
  )
}
