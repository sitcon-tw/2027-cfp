import { Radio } from '@base-ui/react/radio'
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group'
import { Circle } from 'lucide-react'

import { choiceCardClassName, confirmOnEnter } from '@/components/ui/checkbox'
import { cn, type WithClassName } from '@/lib/utils'

/** The light well that holds the answer pills. */
export function RadioGroup({
  className,
  ...props
}: WithClassName<BaseRadioGroup.Props>) {
  return (
    <BaseRadioGroup
      className={cn(
        'flex flex-col gap-2.5 rounded-lg rounded-tl-sm bg-light px-12.5 py-5',
        className,
      )}
      {...props}
    />
  )
}

/**
 * A full-width answer pill. The checked state is not in Figma yet — inverting
 * to ink is a proposal.
 */
export function RadioGroupItem({
  className,
  ...props
}: WithClassName<Radio.Root.Props>) {
  return (
    <Radio.Root
      className={cn(
        'flex w-full cursor-pointer items-center rounded-lg bg-foreground px-8 pt-5.5 pb-5 text-left text-paragraph text-black transition-[filter,background-color,color,opacity] duration-300 ease-smooth select-none hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-checked:bg-background data-checked:text-foreground data-checked:hover:brightness-125 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:brightness-100 motion-reduce:transition-none',
        className,
      )}
      {...props}
    />
  )
}

/** A column of `RadioCard`s, the radio counterpart of `CheckboxGroup`. */
export function RadioCardGroup({
  className,
  ...props
}: WithClassName<BaseRadioGroup.Props>) {
  return (
    <BaseRadioGroup
      className={cn('flex w-full flex-col gap-2.5', className)}
      {...props}
    />
  )
}

/**
 * A full-width option card with its label as children, styled like
 * `CheckboxCard`. The arrow keys move focus without selecting; Enter or Space
 * selects.
 */
export function RadioCard({
  className,
  children,
  ...props
}: WithClassName<Radio.Root.Props>) {
  return (
    <Radio.Root
      // Base UI selects a radio on focus; keep its arrow navigation but
      // require explicit activation.
      onFocus={(event) => event.preventDefault()}
      onKeyDown={confirmOnEnter}
      className={cn(choiceCardClassName, className)}
      {...props}
    >
      <Circle
        aria-hidden
        className="size-6 shrink-0 group-data-checked:fill-current"
      />
      {children}
    </Radio.Root>
  )
}
