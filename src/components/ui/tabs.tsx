import { Tabs as BaseTabs } from '@base-ui/react/tabs'

import { cn } from '@/lib/utils'

type WithClassName<P> = Omit<P, 'className'> & { className?: string }

export function Tabs({
  className,
  ...props
}: WithClassName<BaseTabs.Root.Props>) {
  return (
    <BaseTabs.Root
      className={cn(
        'flex gap-2.5 data-[orientation=horizontal]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

/**
 * A row of tiles that reads as one shape: outer corners `xl`, inner corners
 * `sm` (the corner rule in AGENTS.md).
 */
export function TabsList({
  className,
  ...props
}: WithClassName<BaseTabs.List.Props>) {
  return (
    <BaseTabs.List
      className={cn(
        'flex gap-2.5 data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

/**
 * One tile. The active state is not in Figma yet — active is cream, inactive
 * is gray as a proposal.
 */
export function TabsTab({
  className,
  ...props
}: WithClassName<BaseTabs.Tab.Props>) {
  return (
    <BaseTabs.Tab
      className={cn(
        'flex min-h-control flex-1 cursor-pointer items-center justify-center rounded-sm bg-gray px-5 py-2.5 text-center text-paragraph leading-normal font-bold text-foreground transition select-none hover:brightness-125 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-active:bg-foreground data-active:text-background data-active:hover:brightness-100 data-disabled:cursor-not-allowed data-disabled:opacity-50',
        'data-[orientation=horizontal]:first:rounded-l-xl data-[orientation=horizontal]:last:rounded-r-xl',
        'data-[orientation=vertical]:first:rounded-t-xl data-[orientation=vertical]:last:rounded-b-xl',
        className,
      )}
      {...props}
    />
  )
}

export function TabsPanel({
  className,
  ...props
}: WithClassName<BaseTabs.Panel.Props>) {
  return (
    <BaseTabs.Panel
      className={cn(
        'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
        className,
      )}
      {...props}
    />
  )
}
