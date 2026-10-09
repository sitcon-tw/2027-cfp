import { Accordion as BaseAccordion } from '@base-ui/react/accordion'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

type WithClassName<P> = Omit<P, 'className'> & { className?: string }

export function Accordion({
  className,
  ...props
}: WithClassName<BaseAccordion.Root.Props>) {
  return (
    <BaseAccordion.Root
      className={cn('flex flex-col gap-5', className)}
      {...props}
    />
  )
}

/**
 * One question. Open, the trigger and panel are two cream tiles that read as
 * one shape (corner rule); closed, the trigger is a gray pill.
 */
export function AccordionItem({
  className,
  ...props
}: WithClassName<BaseAccordion.Item.Props>) {
  return (
    <BaseAccordion.Item
      className={cn('group/item flex flex-col', className)}
      {...props}
    />
  )
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: WithClassName<BaseAccordion.Trigger.Props>) {
  return (
    <BaseAccordion.Header className="flex">
      <BaseAccordion.Trigger
        className={cn(
          'flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl bg-gray px-7.5 py-5 text-left text-h3 font-bold text-foreground transition select-none hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue md:px-12.5',
          'data-panel-open:rounded-b-sm data-panel-open:bg-foreground data-panel-open:text-background data-panel-open:hover:brightness-95',
          className,
        )}
        {...props}
      >
        <span className="flex-1">{children}</span>
        <ChevronDown
          aria-hidden
          className="size-8.75 shrink-0 transition-transform group-data-open/item:rotate-180"
        />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  )
}

export function AccordionPanel({
  className,
  children,
  ...props
}: WithClassName<BaseAccordion.Panel.Props>) {
  return (
    <BaseAccordion.Panel
      className={cn(
        'h-(--accordion-panel-height) overflow-hidden transition-[height] data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none',
        className,
      )}
      {...props}
    >
      <div className="pt-2.5">
        <div className="rounded-sm rounded-b-xl bg-foreground px-7.5 py-5 text-paragraph text-background md:px-12.5">
          {children}
        </div>
      </div>
    </BaseAccordion.Panel>
  )
}
