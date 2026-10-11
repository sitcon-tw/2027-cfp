import { Input as BaseInput } from '@base-ui/react/input'

import { cn, type WithClassName } from '@/lib/utils'

/**
 * Shared by `Input` and `Textarea`. Focus lightens the border, as Figma's
 * "active" state, instead of the blue outline ring. Invalid and disabled are
 * our own; Figma has none.
 */
export const inputClassName =
  'w-full rounded-sm border-2 border-gray bg-transparent px-5 text-paragraph text-foreground transition-colors outline-none placeholder:text-light focus:border-light data-disabled:cursor-not-allowed data-disabled:opacity-50 data-invalid:border-red'

export function Input({ className, ...props }: WithClassName<BaseInput.Props>) {
  return (
    <BaseInput className={cn(inputClassName, 'h-20', className)} {...props} />
  )
}
