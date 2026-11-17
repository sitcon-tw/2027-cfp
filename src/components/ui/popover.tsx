import { Popover as BasePopover } from '@base-ui/react/popover'

import { cn, type WithClassName } from '@/lib/utils'

export const Popover = BasePopover.Root

/** The dark surface of popovers, also worn by the mobile navbar to match its menu. */
export const darkSurfaceClassName =
  'border border-gray bg-linear-to-br from-gray/95 to-black/95 backdrop-blur-lg'

export const popoverSurfaceClassName = cn(
  'scroll-py-7.5 rounded-xl p-7.5 text-foreground',
  darkSurfaceClassName,
)

export function PopoverTrigger({
  className,
  ...props
}: WithClassName<BasePopover.Trigger.Props>) {
  return (
    <BasePopover.Trigger
      className={cn(
        'flex size-control-lg cursor-pointer items-center justify-center rounded-xs text-foreground transition-opacity duration-300 ease-smooth hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none',
        className,
      )}
      {...props}
    />
  )
}

export function PopoverContent({
  className,
  anchor,
  positionMethod,
  children,
  ...props
}: WithClassName<BasePopover.Popup.Props> & {
  anchor?: BasePopover.Positioner.Props['anchor']
  positionMethod?: BasePopover.Positioner.Props['positionMethod']
}) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner
        anchor={anchor}
        positionMethod={positionMethod}
        align="center"
        collisionAvoidance={{ side: 'none', align: 'shift' }}
        className="z-20 w-(--anchor-width) max-w-(--available-width)"
      >
        <BasePopover.Popup
          className={cn(
            popoverSurfaceClassName,
            'max-h-(--available-height) overflow-y-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
            className,
          )}
          {...props}
        >
          {children}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  )
}
