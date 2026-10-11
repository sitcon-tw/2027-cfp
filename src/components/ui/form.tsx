import { Form as BaseForm } from '@base-ui/react/form'

import { cn, type WithClassName } from '@/lib/utils'

/**
 * A `<form>` that hands `errors` (keyed by each field's `name`) to the
 * matching `FieldError`, and focuses the first invalid field on submit.
 */
export function Form({ className, ...props }: WithClassName<BaseForm.Props>) {
  return <BaseForm className={cn('flex flex-col', className)} {...props} />
}
