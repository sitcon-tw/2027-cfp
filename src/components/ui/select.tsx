import { Select as BaseSelect } from '@base-ui/react/select'
import { Check, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

import { inputClassName } from '@/components/ui/input'
import { cn, type WithClassName } from '@/lib/utils'

export interface SelectOption<Value> {
  label: ReactNode
  value: Value
}

export interface SelectProps<Value> extends Omit<
  BaseSelect.Root.Props<Value>,
  'children' | 'multiple' | 'items'
> {
  options: readonly SelectOption<Value>[]
  /** Shown in the trigger while nothing is chosen. */
  placeholder?: string
  className?: string
  /** Labels the trigger, e.g. a `FieldLabel` rendered as a `<span>`. */
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-required'?: boolean
}

/**
 * A single-choice dropdown whose trigger looks like `Input`. Pass the options
 * as `options`; the trigger shows the chosen option's label. Not in Figma yet: the trigger reuses the
 * input box and the popup reuses `PopoverContent`'s glass — proposals.
 */
export function Select<Value>({
  placeholder,
  className,
  options,
  'aria-labelledby': labelledBy,
  'aria-describedby': describedBy,
  'aria-required': required,
  ...props
}: SelectProps<Value>) {
  return (
    <BaseSelect.Root items={options} {...props}>
      <BaseSelect.Trigger
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        aria-required={required}
        className={cn(
          inputClassName,
          'flex h-20 cursor-pointer items-center justify-between gap-2.5 text-left select-none hover:border-light focus-visible:border-light data-disabled:hover:border-gray data-popup-open:border-light',
          className,
        )}
      >
        <BaseSelect.Value
          placeholder={placeholder}
          className="truncate data-placeholder:text-light"
        />
        <BaseSelect.Icon className="shrink-0 transition-transform duration-200 in-data-popup-open:rotate-180">
          <ChevronDown aria-hidden className="size-6" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner
          alignItemWithTrigger={false}
          sideOffset={6}
          collisionPadding={20}
          className="z-20 outline-none select-none"
        >
          <BaseSelect.Popup className="max-h-(--available-height) min-w-(--anchor-width) origin-(--transform-origin) overflow-y-auto rounded-sm border border-gray bg-linear-to-br from-gray/95 to-black/95 p-2.5 text-foreground backdrop-blur-lg transition-[opacity,scale] duration-150 ease-out outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <BaseSelect.List>
              {options.map((option) => (
                <SelectItem key={String(option.value)} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  )
}

function SelectItem({
  className,
  children,
  ...props
}: WithClassName<BaseSelect.Item.Props>) {
  return (
    <BaseSelect.Item
      className={cn(
        'flex cursor-pointer items-center justify-between gap-5 rounded-xs px-5 py-2 text-paragraph transition-colors duration-300 ease-smooth outline-none data-disabled:cursor-not-allowed data-disabled:opacity-50 data-highlighted:bg-foreground/10 motion-reduce:transition-none',
        className,
      )}
      {...props}
    >
      <BaseSelect.ItemText>{children}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator>
        <Check aria-hidden className="size-6" />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  )
}
