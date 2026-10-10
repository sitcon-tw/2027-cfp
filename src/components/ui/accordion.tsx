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

export function AccordionItem({
  className,
  ...props
}: WithClassName<BaseAccordion.Item.Props>) {
  return (
    <BaseAccordion.Item className={cn('flex flex-col', className)} {...props} />
  )
}

/**
 * The question bar, wrapped in its heading (`h3` by default; pass
 * `headingLevel` to change it). Closed it is a gray pill; open it turns cream
 * and its bottom corners become the inner `sm` corners joining the panel (the
 * corner rule in AGENTS.md). Hover is not in Figma yet.
 */
export function AccordionTrigger({
  className,
  children,
  headingLevel: Heading = 'h3',
  ...props
}: WithClassName<BaseAccordion.Trigger.Props> & {
  headingLevel?: 'h2' | 'h3' | 'h4'
}) {
  return (
    <BaseAccordion.Header render={<Heading />}>
      <BaseAccordion.Trigger
        className={cn(
          'group flex w-full cursor-pointer items-center gap-2.5 rounded-xl bg-gray px-7.5 py-5 text-left text-h3 font-bold text-foreground transition select-none hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-disabled:cursor-not-allowed data-disabled:opacity-50 data-panel-open:rounded-b-sm data-panel-open:bg-foreground data-panel-open:text-background data-panel-open:hover:brightness-95 md:px-12.5',
          className,
        )}
        {...props}
      >
        <span className="flex-1">{children}</span>
        <ChevronDown
          aria-hidden
          className="size-8.75 shrink-0 transition-transform duration-300 ease-smooth group-data-panel-open:rotate-180 motion-reduce:transition-none"
        />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  )
}

/**
 * The answer: a cream card under the bar, with inner `sm` top corners and
 * outer `xl` bottom corners. The height animation and the gap above the card
 * live on the outer element, so the gap opens and closes with the panel.
 * `className` styles the card. Closed panels stay in the DOM as
 * `hidden="until-found"`, so the browser's find-in-page can open them.
 */
export function AccordionPanel({
  className,
  children,
  hiddenUntilFound = true,
  ...props
}: WithClassName<BaseAccordion.Panel.Props>) {
  return (
    <BaseAccordion.Panel
      hiddenUntilFound={hiddenUntilFound}
      className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-300 ease-smooth data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none"
      {...props}
    >
      <div className="pt-2.5">
        <div
          className={cn(
            'rounded-sm rounded-b-xl bg-foreground px-7.5 py-5 text-paragraph text-background md:px-12.5',
            className,
          )}
        >
          {children}
        </div>
      </div>
    </BaseAccordion.Panel>
  )
}
