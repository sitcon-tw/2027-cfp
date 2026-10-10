import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group'

import { cn } from '@/lib/utils'

type WithClassName<P> = Omit<P, 'className'> & { className?: string }

/** A column of `CheckboxCard`s; `value` is the array of checked values. */
export function CheckboxGroup({
  className,
  ...props
}: WithClassName<BaseCheckboxGroup.Props>) {
  return (
    <BaseCheckboxGroup
      className={cn('flex w-full max-w-183.5 flex-col gap-2.5', className)}
      {...props}
    />
  )
}
