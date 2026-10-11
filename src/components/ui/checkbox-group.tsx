import { CheckboxGroup as BaseCheckboxGroup } from '@base-ui/react/checkbox-group'
import { Toolbar } from '@base-ui/react/toolbar'

import { cn, type WithClassName } from '@/lib/utils'

/**
 * A column of `CheckboxCard`s; `value` is the array of checked values. The
 * arrow keys move focus between cards, as in a `RadioGroup`.
 */
export function CheckboxGroup({
  className,
  disabled,
  children,
  ...props
}: WithClassName<BaseCheckboxGroup.Props>) {
  return (
    <Toolbar.Root
      orientation="vertical"
      disabled={disabled}
      // Keep the checkbox group's semantics; Toolbar only adds roving focus.
      role="group"
      aria-orientation={undefined}
      render={
        <BaseCheckboxGroup
          disabled={disabled}
          className={cn('flex w-full flex-col gap-2.5', className)}
          {...props}
        />
      }
    >
      {children}
    </Toolbar.Root>
  )
}
