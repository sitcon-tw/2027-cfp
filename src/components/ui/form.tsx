import { Form as BaseForm } from '@base-ui/react/form'

import { cn } from '@/lib/utils'

type WithClassName<P> = Omit<P, 'className'> & { className?: string }

/**
 * A `<form>` that hands `errors` (keyed by each field's `name`) to the
 * matching `FieldError`, and focuses the first invalid field on submit.
 */
export function Form({ className, ...props }: WithClassName<BaseForm.Props>) {
  return <BaseForm className={cn('flex flex-col', className)} {...props} />
}
