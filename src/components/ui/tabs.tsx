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

export function TabsList({
  className,
  ...props
}: WithClassName<BaseTabs.List.Props>) {
  return (
    <BaseTabs.List
      className={cn(
        'flex gap-5 data-[orientation=vertical]:flex-col',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Cream tile. The active state is not in Figma yet — inactive tiles are dimmed
 * as a proposal.
 */
export function TabsTab({
  className,
  ...props
}: WithClassName<BaseTabs.Tab.Props>) {
  return (
    <BaseTabs.Tab
      className={cn(
        'flex w-full cursor-pointer items-center gap-2.5 rounded-sm bg-foreground px-5 py-4 text-left text-background opacity-60 transition select-none hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue data-active:opacity-100 data-disabled:cursor-not-allowed data-disabled:opacity-40',
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
        'flex-1 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
        className,
      )}
      {...props}
    />
  )
}
