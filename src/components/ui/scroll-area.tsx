import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import type { Ref } from 'react'

import { cn, type WithClassName } from '@/lib/utils'

export interface ScrollAreaProps extends WithClassName<BaseScrollArea.Root.Props> {
  /** The scrolling element, for code that drives or reads its position. */
  viewportRef?: Ref<HTMLDivElement>
  viewportClassName?: string
  /** Show the overlay scrollbar (default). Without it, the area still
   *  scrolls by wheel, touch and keyboard. */
  scrollbar?: boolean
}

/**
 * A horizontal scroller: native scrolling (wheel, touch, keyboard once
 * focused) with a thin overlay scrollbar that shows while hovering or
 * scrolling (unless `scrollbar` is off).
 */
export function ScrollArea({
  className,
  viewportRef,
  viewportClassName,
  scrollbar = true,
  children,
  ...props
}: ScrollAreaProps) {
  return (
    <BaseScrollArea.Root className={cn('relative', className)} {...props}>
      <BaseScrollArea.Viewport
        ref={viewportRef}
        className={cn(
          'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue',
          viewportClassName,
        )}
      >
        <BaseScrollArea.Content>{children}</BaseScrollArea.Content>
      </BaseScrollArea.Viewport>
      {scrollbar && (
        <BaseScrollArea.Scrollbar
          orientation="horizontal"
          className="pointer-events-none mx-5 mb-0.5 flex h-1.5 rounded-full bg-foreground/10 opacity-0 transition-opacity data-hovering:pointer-events-auto data-hovering:opacity-100 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0"
        >
          <BaseScrollArea.Thumb className="rounded-full bg-foreground/40" />
        </BaseScrollArea.Scrollbar>
      )}
    </BaseScrollArea.Root>
  )
}
