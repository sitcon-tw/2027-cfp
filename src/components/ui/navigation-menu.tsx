import { NavigationMenu as BaseNavigationMenu } from '@base-ui/react/navigation-menu'
import { ChevronDown } from 'lucide-react'
import type { ReactNode, RefObject } from 'react'

import { cn, type WithClassName } from '@/lib/utils'

/**
 * Root that also renders the shared popup, a glass panel of its own. A caller
 * that draws the surface itself (the site header's navbar glass) clears it
 * with `popupClassName` and reads the popup's box through the refs.
 */
export function NavigationMenu({
  className,
  children,
  positionMethod,
  sideOffset = 12,
  positionerRef,
  popupRef,
  popupClassName,
  viewportClassName,
  ...props
}: WithClassName<BaseNavigationMenu.Root.Props> & {
  children?: ReactNode
  positionMethod?: BaseNavigationMenu.Positioner.Props['positionMethod']
  sideOffset?: BaseNavigationMenu.Positioner.Props['sideOffset']
  positionerRef?: RefObject<HTMLDivElement | null>
  popupRef?: RefObject<HTMLDivElement | null>
  popupClassName?: string
  viewportClassName?: string
}) {
  return (
    <BaseNavigationMenu.Root className={cn('relative', className)} {...props}>
      {children}
      <BaseNavigationMenu.Portal>
        <BaseNavigationMenu.Positioner
          ref={positionerRef}
          positionMethod={positionMethod}
          sideOffset={sideOffset}
          collisionPadding={20}
          className="z-20 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-300 ease-out data-instant:transition-none motion-reduce:transition-none"
        >
          <BaseNavigationMenu.Popup
            ref={popupRef}
            className={cn(
              'relative h-(--popup-height) w-(--popup-width) origin-top overflow-clip rounded-sm bg-black/35 text-foreground backdrop-blur-lg transition-[opacity,scale,width,height] duration-500 ease-smooth data-ending-style:scale-x-75 data-ending-style:scale-y-0 data-ending-style:opacity-0 data-starting-style:scale-x-75 data-starting-style:scale-y-0 data-starting-style:opacity-0 motion-reduce:transition-none',
              popupClassName,
            )}
          >
            <BaseNavigationMenu.Viewport
              className={cn(
                'relative size-full overflow-hidden',
                viewportClassName,
              )}
            />
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
  'flex cursor-pointer items-center gap-0.5 rounded-xl px-2.5 py-2.5 text-body font-bold text-foreground transition-[opacity,background-color] duration-300 ease-smooth select-none hover:bg-foreground/10 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none'

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
      <BaseNavigationMenu.Icon className="transition-transform duration-200 data-popup-open:rotate-180 motion-reduce:transition-none">
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
        'flex w-max min-w-48 flex-row gap-2.5 p-2.5 transition-opacity duration-500 ease-smooth data-ending-style:opacity-0 data-starting-style:opacity-0 motion-reduce:transition-none',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Renders an `<a>`. By default it is a link inside `NavigationMenuContent`;
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
          : 'flex min-h-control items-center justify-center rounded-xl px-5 py-2 text-body font-bold whitespace-nowrap text-foreground transition-colors duration-300 ease-smooth hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none',
        className,
      )}
      closeOnClick={closeOnClick}
      {...props}
    />
  )
}
