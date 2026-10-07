import { Button as BaseButton } from '@base-ui/react/button'

import { cn } from '@/lib/utils'

const variants = {
  red: 'bg-red text-background rounded-tl-xs rounded-tr-md rounded-br-xs rounded-bl-md',
  blue: 'bg-blue text-background rounded-tl-xs rounded-tr-md rounded-br-xs rounded-bl-md',
  green:
    'bg-green text-background rounded-tl-xs rounded-tr-md rounded-br-xs rounded-bl-md',
  cream:
    'bg-foreground text-background rounded-tl-xs rounded-tr-md rounded-br-md rounded-bl-md',
  muted:
    'bg-light text-background rounded-tl-xs rounded-tr-md rounded-br-md rounded-bl-md',
  dark: 'bg-background text-foreground rounded-tl-sm rounded-tr-xl rounded-br-xl rounded-bl-md hover:brightness-125',
  outline: 'border border-background text-background',
}

const sizes = {
  md: 'h-[59px] px-7.5 text-paragraph leading-normal',
  lg: 'h-[86px] px-7.5 text-lead',
  icon: 'size-[45px] rounded-full [&_svg]:size-6',
}

export type ButtonVariant = keyof typeof variants
export type ButtonSize = keyof typeof sizes

/**
 * Button classes, for elements that must look like a button but are not one
 * (e.g. `<a className={buttonVariants({ variant: 'cream' })}>`). Base UI
 * forbids rendering links through `Button`.
 */
export function buttonVariants({
  variant = 'cream',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 font-extrabold whitespace-nowrap transition select-none hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-disabled:cursor-not-allowed data-disabled:opacity-50',
    variants[variant],
    sizes[size],
    className,
  )
}

export interface ButtonProps extends Omit<BaseButton.Props, 'className'> {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <BaseButton
      className={buttonVariants({ variant, size, className })}
      {...props}
    />
  )
}
