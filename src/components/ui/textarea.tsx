import { Field } from '@base-ui/react/field'
import type { ComponentProps } from 'react'

import { inputClassName } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type WithClassName<P> = Omit<P, 'className'> & { className?: string }

/**
 * A multi-line `Input`. Not in Figma yet: the height and vertical padding are
 * proposals.
 */
export function Textarea({
  className,
  ...props
}: WithClassName<Field.Control.Props> &
  Pick<ComponentProps<'textarea'>, 'rows'>) {
  return (
    <Field.Control
      render={<textarea />}
      className={cn(inputClassName, 'min-h-40 resize-y py-4', className)}
      {...props}
    />
  )
}
