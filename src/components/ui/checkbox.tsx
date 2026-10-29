import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { Toolbar } from '@base-ui/react/toolbar'
import { Check, Square } from 'lucide-react'
import type { KeyboardEvent } from 'react'

import { cn, type WithClassName } from '@/lib/utils'

/**
 * Shared by `Checkbox`, `CheckboxCard` and `RadioCard`: a full-width option card that
 * turns cream when checked. Hover, invalid and disabled are our own; Figma
 * has none.
 */
export const choiceCardClassName =
  'group flex min-h-20 w-full cursor-pointer items-center gap-2.5 rounded-sm border-2 border-gray px-5 py-2.5 text-left text-paragraph text-foreground transition-[filter,background-color,color,border-color,opacity] duration-300 ease-smooth select-none hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-checked:bg-foreground data-checked:text-background data-checked:hover:brightness-90 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:brightness-100 data-invalid:border-red motion-reduce:transition-none'

/** Enter selects a choice, like Space, instead of submitting the form. */
export function confirmOnEnter(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Enter') return
  // Activate through Base UI's click handling.
  event.preventDefault()
  if (!event.repeat) event.currentTarget.click()
}

/** Fills when checked, like `RadioCard`'s circle, with a cut-out tick. */
function CheckboxIcon() {
  return (
    <span aria-hidden className="relative size-6 shrink-0">
      <Square className="size-full group-data-checked:fill-current" />
      <Check
        strokeWidth={3.5}
        className="absolute inset-0 m-auto hidden size-3.5 text-foreground group-data-checked:block"
      />
    </span>
  )
}

/**
 * A standalone checkbox card with its label as children, e.g. the consent
 * line. Looks like `CheckboxCard` and `RadioCard`, without a group.
 */
export function Checkbox({
  className,
  children,
  ...props
}: WithClassName<BaseCheckbox.Root.Props>) {
  return (
    <BaseCheckbox.Root
      onKeyDown={confirmOnEnter}
      className={cn(choiceCardClassName, className)}
      {...props}
    >
      <CheckboxIcon />
      {children}
    </BaseCheckbox.Root>
  )
}

/**
 * A full-width option card with its label as children. Must sit in a
 * `CheckboxGroup`, which moves focus between cards with the arrow keys.
 */
export function CheckboxCard({
  className,
  children,
  ...props
}: WithClassName<BaseCheckbox.Root.Props>) {
  return (
    <Toolbar.Button
      nativeButton={false}
      role="checkbox"
      focusableWhenDisabled={false}
      render={
        <BaseCheckbox.Root
          onKeyDown={confirmOnEnter}
          className={cn(choiceCardClassName, className)}
          {...props}
        />
      }
    >
      <CheckboxIcon />
      {children}
    </Toolbar.Button>
  )
}
