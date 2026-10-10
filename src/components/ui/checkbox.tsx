import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { Square, SquareCheck } from 'lucide-react'

import { cn } from '@/lib/utils'

type WithClassName<P> = Omit<P, 'className'> & { className?: string }

function CheckboxIcon() {
  return (
    <>
      <Square
        aria-hidden
        className="size-6 shrink-0 group-data-checked:hidden"
      />
      <SquareCheck
        aria-hidden
        className="hidden size-6 shrink-0 group-data-checked:block"
      />
    </>
  )
}

/**
 * An inline checkbox with its label as children, e.g. the consent line. The
 * whole row toggles. Hover is not in Figma yet.
 */
export function Checkbox({
  className,
  children,
  ...props
}: WithClassName<BaseCheckbox.Root.Props>) {
  return (
    <BaseCheckbox.Root
      className={cn(
        'group inline-flex cursor-pointer items-center gap-2.5 rounded-xs text-paragraph text-foreground transition select-none hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-disabled:cursor-not-allowed data-disabled:opacity-50 data-invalid:text-red',
        className,
      )}
      {...props}
    >
      <CheckboxIcon />
      {children}
    </BaseCheckbox.Root>
  )
}

/**
 * A full-width option card for a `CheckboxGroup`, with its label as
 * children. Checked turns cream. Hover, invalid and disabled are not in
 * Figma yet — proposals.
 */
export function CheckboxCard({
  className,
  children,
  ...props
}: WithClassName<BaseCheckbox.Root.Props>) {
  return (
    <BaseCheckbox.Root
      className={cn(
        'group flex min-h-20 w-full cursor-pointer items-center gap-2.5 rounded-sm border-2 border-gray px-5 py-2.5 text-left text-paragraph text-foreground transition select-none hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-checked:bg-foreground data-checked:text-background data-checked:hover:brightness-95 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-invalid:border-red',
        className,
      )}
      {...props}
    >
      <CheckboxIcon />
      {children}
    </BaseCheckbox.Root>
  )
}
