import { Menu as BaseMenu } from '@base-ui/react/menu'

import { cn, type WithClassName } from '@/lib/utils'

export const Menu = BaseMenu.Root
export const MenuTrigger = BaseMenu.Trigger

/**
 * The dropdown of a `Menu`. Not in Figma yet: it reuses `Select`'s glass
 * popup.
 */
export function MenuContent({
  className,
  children,
  ...props
}: WithClassName<BaseMenu.Popup.Props>) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner
        sideOffset={6}
        collisionPadding={20}
        className="z-20 outline-none"
      >
        <BaseMenu.Popup
          className={cn(
            'min-w-(--anchor-width) origin-(--transform-origin) rounded-sm border border-gray bg-linear-to-br from-gray/95 to-black/95 p-2.5 text-foreground backdrop-blur-lg transition-[opacity,scale] duration-150 ease-out outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
            className,
          )}
          {...props}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  )
}

export function MenuLinkItem({
  className,
  ...props
}: WithClassName<BaseMenu.LinkItem.Props>) {
  return (
    <BaseMenu.LinkItem
      closeOnClick
      className={cn(
        'flex cursor-pointer items-center gap-2.5 rounded-xs px-5 py-2 text-paragraph outline-none select-none data-highlighted:bg-foreground/10',
        className,
      )}
      {...props}
    />
  )
}
