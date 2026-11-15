import { Button as BaseButton } from '@base-ui/react/button'

import { cn } from '@/lib/utils'

const variants = {
  red: 'bg-red text-background',
  blue: 'bg-blue text-background',
  green: 'bg-green text-background',
  cream: 'bg-foreground text-background',
  muted: 'bg-light text-background',
  dark: 'bg-background text-foreground hover:brightness-125',
  outline: 'border border-background text-background',
}

const sizes = {
  md: 'h-control px-7.5 text-paragraph leading-normal',
  lg: 'h-control-lg px-7.5 text-lead',
  icon: 'size-control-icon [&_svg]:size-6',
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
    'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2.5 rounded-full font-extrabold whitespace-nowrap transition-[filter,background-color,color,opacity] duration-300 ease-smooth select-none hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-disabled:cursor-not-allowed data-disabled:opacity-50 data-disabled:hover:brightness-100 motion-reduce:transition-none',
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
