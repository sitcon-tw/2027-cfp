import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import { Drawer } from '@base-ui/react/drawer'
import { X } from 'lucide-react'
import {
  createContext,
  useContext,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type WithClassName<P> = Omit<P, 'className'> & { className?: string }

// Matches Tailwind's `md` breakpoint and the mobile overrides in index.css.
const desktopQuery = '(min-width: 48rem)'

function subscribe(onChange: () => void) {
  const media = window.matchMedia(desktopQuery)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(desktopQuery).matches,
    () => true,
  )
}

const DesktopContext = createContext(true)

export interface DialogProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children?: ReactNode
}

/**
 * A modal that is a centered dialog from `md` up and a bottom sheet (Base UI
 * Drawer, swipe down to dismiss) below it. Callers use the same parts either
 * way. The open state lives here, so resizing across the breakpoint swaps the
 * surface without closing it.
 */
export function Dialog({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
}: DialogProps) {
  const isDesktop = useIsDesktop()
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = openProp ?? uncontrolledOpen

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  return (
    <DesktopContext value={isDesktop}>
      {isDesktop ? (
        <BaseDialog.Root open={open} onOpenChange={setOpen}>
          {children}
        </BaseDialog.Root>
      ) : (
        <Drawer.Root open={open} onOpenChange={setOpen}>
          {children}
        </Drawer.Root>
      )}
    </DesktopContext>
  )
}

// Drawer's Trigger, Title, Description and Close are Dialog's own parts, so
// these work under either root.

export function DialogTrigger({
  className,
  ...props
}: WithClassName<BaseDialog.Trigger.Props>) {
  return <BaseDialog.Trigger className={className} {...props} />
}

const backdropClassName =
  'fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0'

const popupClassName =
  'w-full overflow-y-auto overscroll-contain bg-foreground text-background outline-none'

export type DialogContentProps = WithClassName<
  Omit<BaseDialog.Popup.Props, 'render' | 'style'>
>

/** The cream surface: a centered card on desktop, a bottom sheet on mobile. */
export function DialogContent({
  className,
  children,
  ...props
}: DialogContentProps) {
  const isDesktop = useContext(DesktopContext)

  if (isDesktop) {
    return (
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={backdropClassName} />
        <BaseDialog.Viewport className="fixed inset-0 z-30 flex items-center justify-center p-5">
          <BaseDialog.Popup
            className={cn(
              popupClassName,
              'max-h-full max-w-content rounded-xl p-7.5 transition duration-300 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
              className,
            )}
            {...props}
          >
            {children}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    )
  }

  return (
    <Drawer.Portal>
      <Drawer.Backdrop className={backdropClassName} />
      <Drawer.Viewport className="fixed inset-0 z-30 flex items-end pt-10">
        <Drawer.Popup
          className={cn(
            popupClassName,
            'max-h-full translate-y-(--drawer-swipe-movement-y) rounded-t-xl px-5 pt-2.5 pb-7.5 transition-transform duration-300 ease-out data-ending-style:translate-y-full data-starting-style:translate-y-full data-swiping:duration-0 data-swiping:select-none',
            className,
          )}
          {...props}
        >
          {/* Grab handle; the sheet is dismissed by swiping down. */}
          <div className="mx-auto mb-2.5 h-1.5 w-12 shrink-0 rounded-full bg-gray/30" />
          {/* `contents` so the caller's layout classes on the popup (flex,
              gap, …) reach the children, the same as on desktop. */}
          <Drawer.Content className="contents">{children}</Drawer.Content>
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  )
}

export function DialogTitle({
  className,
  ...props
}: WithClassName<BaseDialog.Title.Props>) {
  return (
    <BaseDialog.Title
      className={cn('text-h3 font-bold', className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: WithClassName<BaseDialog.Description.Props>) {
  return (
    <BaseDialog.Description
      className={cn('text-paragraph text-gray', className)}
      {...props}
    />
  )
}

/** Icon-only close button. Pass an `aria-label`; children default to an X. */
export function DialogClose({
  className,
  children = <X />,
  ...props
}: WithClassName<BaseDialog.Close.Props>) {
  return (
    <BaseDialog.Close
      className={buttonVariants({ variant: 'muted', size: 'icon', className })}
      {...props}
    >
      {children}
    </BaseDialog.Close>
  )
}
