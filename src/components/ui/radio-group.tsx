import { Radio } from '@base-ui/react/radio'
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group'

import { cn } from '@/lib/utils'

type WithClassName<P> = Omit<P, 'className'> & { className?: string }

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
        'flex w-full cursor-pointer items-center rounded-lg bg-foreground px-8 pt-5.5 pb-5 text-left text-paragraph text-black transition select-none hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-checked:bg-background data-checked:text-foreground data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
