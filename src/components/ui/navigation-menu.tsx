import { NavigationMenu as BaseNavigationMenu } from '@base-ui/react/navigation-menu'
import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn, type WithClassName } from '@/lib/utils'

/**
 * Root that also renders the shared popup. The popup is not in Figma; it
 * reuses the navbar glass.
 */
export function NavigationMenu({
  className,
  children,
  positionMethod,
  ...props
}: WithClassName<BaseNavigationMenu.Root.Props> & {
  children?: ReactNode
  positionMethod?: BaseNavigationMenu.Positioner.Props['positionMethod']
}) {
  return (
    <BaseNavigationMenu.Root className={cn('relative', className)} {...props}>
      {children}
      <BaseNavigationMenu.Portal>
        <BaseNavigationMenu.Positioner
          positionMethod={positionMethod}
          sideOffset={12}
          collisionPadding={20}
          className="z-20 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-300 ease-out data-instant:transition-none"
        >
          <BaseNavigationMenu.Popup className="relative h-(--popup-height) w-(--popup-width) origin-(--transform-origin) overflow-clip rounded-sm bg-black/35 text-foreground backdrop-blur-lg transition-[opacity,scale,width,height] duration-300 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            <BaseNavigationMenu.Viewport className="relative size-full overflow-hidden" />
          </BaseNavigationMenu.Popup>
        </BaseNavigationMenu.Positioner>
      </BaseNavigationMenu.Portal>
    </BaseNavigationMenu.Root>
  )
}

export function NavigationMenuList({
  className,
  ...props
}: WithClassName<BaseNavigationMenu.List.Props>) {
  return (
    <BaseNavigationMenu.List
      className={cn('flex items-center gap-5', className)}
      {...props}
    />
  )
}

export function NavigationMenuItem(props: BaseNavigationMenu.Item.Props) {
  return <BaseNavigationMenu.Item {...props} />
}

const itemClassName =
  'flex cursor-pointer items-center gap-0.5 text-body font-bold text-foreground select-none hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function NavigationMenuTrigger({
  className,
  children,
  ...props
}: WithClassName<BaseNavigationMenu.Trigger.Props> & { children?: ReactNode }) {
  return (
    <BaseNavigationMenu.Trigger
      className={cn(itemClassName, className)}
      {...props}
    >
      {children}
      <BaseNavigationMenu.Icon className="transition-transform duration-200 data-popup-open:rotate-180">
        <ChevronDown className="size-6" />
      </BaseNavigationMenu.Icon>
    </BaseNavigationMenu.Trigger>
  )
}

export function NavigationMenuContent({
  className,
  ...props
}: WithClassName<BaseNavigationMenu.Content.Props>) {
  return (
    <BaseNavigationMenu.Content
      className={cn(
        'flex w-max min-w-48 flex-col p-2.5 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Renders an `<a>`. By default it is a row inside `NavigationMenuContent`;
 * set `topLevel` for links in the bar itself (e.g. 支持 SITCON). Links close
 * the menu when clicked, since client-side navigation keeps the header
 * mounted and the popup would otherwise stay over the new page.
 */
export function NavigationMenuLink({
  className,
  topLevel = false,
  closeOnClick = true,
  ...props
}: WithClassName<BaseNavigationMenu.Link.Props> & { topLevel?: boolean }) {
  return (
    <BaseNavigationMenu.Link
      className={cn(
        topLevel
          ? itemClassName
          : 'block rounded-xs px-2.5 py-2 text-body font-bold text-foreground hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
        className,
      )}
      closeOnClick={closeOnClick}
      {...props}
    />
  )
}
