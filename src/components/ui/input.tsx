import { Input as BaseInput } from '@base-ui/react/input'

import { cn } from '@/lib/utils'

type WithClassName<P> = Omit<P, 'className'> & { className?: string }

/**
 * Shared by `Input` and `Textarea`. Focus lightens the border, as Figma's
 * "active" state, instead of the blue outline ring. Invalid and disabled are
 * not in Figma yet — proposals.
 */
export const inputClassName =
  'w-full max-w-183.5 rounded-sm border-2 border-gray bg-transparent px-5 text-paragraph text-foreground transition-colors outline-none placeholder:text-light focus:border-light data-disabled:cursor-not-allowed data-disabled:opacity-50 data-invalid:border-red'

export function Input({ className, ...props }: WithClassName<BaseInput.Props>) {
  return (
    <BaseInput className={cn(inputClassName, 'h-20', className)} {...props} />
  )
}
