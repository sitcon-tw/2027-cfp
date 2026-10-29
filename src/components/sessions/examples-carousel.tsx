import { Button as BaseButton } from '@base-ui/react/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'

import content from '@/content.json'
import { ResponsiveImage } from '@/components/responsive-image'
import { SessionSection } from '@/components/sessions/session-section'
import { Button } from '@/components/ui/button'
import type {
  ExampleGroup,
  ExamplesSection,
  SessionExample,
} from '@/lib/session-pages'
import { useMediaQuery, useReducedMotion } from '@/lib/use-media-query'
import { cn } from '@/lib/utils'

const text = content.session_page.examples

/** Cards per page: a 2×2 grid from `md` up, a single column of 2 below. */
const PAGE_SIZE = { desktop: 4, mobile: 2 }

/**
 * Corner rule: a page's cards read as one shape, so each card rounds only
 * its corners on the outside of the page with `xl`. Indexed by position in
 * the page: one column of two below `md`, the 2×2 grid from `md` up.
 */
const CARD_CORNERS = [
  'rounded-t-xl md:rounded-tr-sm',
  'rounded-b-xl md:rounded-b-sm md:rounded-tr-xl',
  'md:rounded-bl-xl',
  'md:rounded-br-xl',
]

export type ExamplesCarouselProps = ExamplesSection

/**
 * 投稿主題範例: the intro text, then one carousel per group of past
 * sessions, each under its own title when it has one (Presentation,
 * Espresso).
 */
export function ExamplesCarousel({
  title,
  description,
  groups,
}: ExamplesCarouselProps) {
  return (
    <SessionSection title={title} description={description}>
      <div className="flex flex-col gap-10">
        {groups.map((group, i) => (
          <div key={group.title ?? i} className="flex flex-col gap-2.5">
            {group.title && (
              <h3 className="text-h3 font-bold">{group.title}</h3>
            )}
            <Carousel items={group.items} />
          </div>
        ))}
      </div>
    </SessionSection>
  )
}

/** How long a page shows before autoplay turns to the next. */
const AUTOPLAY_MS = 6000

/**
 * Paged grid of past sessions in a scroll-snap row: wheel, trackpad and
 * touch scroll it natively a page at a time, and the arrows and dots
 * scroll the same row and follow where it is. It turns the page on its
 * own (see `useAutoplay`) until someone takes over.
 */
function Carousel({ items }: Pick<ExampleGroup, 'items'>) {
  const desktop = useMediaQuery('(min-width: 48rem)')
  const reduceMotion = useReducedMotion()
  const pageSize = desktop ? PAGE_SIZE.desktop : PAGE_SIZE.mobile
  const pageCount = Math.ceil(items.length / pageSize)
  const root = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const [scrolledPage, setScrolledPage] = useState(0)
  // Fewer pages after a resize: stay on the last one that still exists.
  const page = Math.min(scrolledPage, Math.max(0, pageCount - 1))
  const pages = Array.from({ length: pageCount }, (_, i) =>
    items.slice(i * pageSize, (i + 1) * pageSize),
  )

  const scrollTo = (target: number) => {
    const el = scroller.current
    if (!el) return
    el.scrollTo({
      left: target * el.clientWidth,
      behavior: reduceMotion ? 'instant' : 'smooth',
    })
  }

  const stopAutoplay = useAutoplay({
    root,
    scroller,
    enabled: pageCount > 1 && !reduceMotion,
    advance: () => scrollTo((page + 1) % pageCount),
  })

  // Pages regroup across the breakpoint: land on the page that holds the
  // first card that was showing.
  const firstCard = useRef(0)
  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const target = Math.floor(firstCard.current / pageSize)
    el.scrollLeft = target * el.clientWidth
    setScrolledPage(target)
  }, [pageSize])

  const onScroll = () => {
    const el = scroller.current
    if (!el || el.clientWidth === 0) return
    const next = Math.round(el.scrollLeft / el.clientWidth)
    firstCard.current = next * pageSize
    setScrolledPage(next)
  }

  const goTo = (target: number) => {
    stopAutoplay()
    scrollTo(target)
  }

  if (items.length === 0) {
    return <p className="text-paragraph text-foreground/70">{text.empty}</p>
  }

  // Arrows flank the cards from `md` up; below it the cards take the full
  // width and the arrows sit under them, either side of the dots.
  return (
    <div
      ref={root}
      className="flex flex-wrap items-center justify-between gap-x-3.75 gap-y-2.5"
    >
      <ArrowButton
        label={text.previous}
        disabled={page === 0}
        onClick={() => goTo(page - 1)}
      >
        <ChevronLeft />
      </ArrowButton>
      <div
        ref={scroller}
        role="region"
        aria-label={text.pages}
        onScroll={onScroll}
        className="order-first scrollbar-none flex min-w-0 basis-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain md:order-none md:flex-1 md:basis-0"
      >
        {pages.map((cards, i) => (
          // Off-screen pages are inert, so Tab and screen readers only
          // reach the cards that are showing.
          <ul
            key={i}
            inert={i !== page}
            aria-hidden={i !== page}
            className="grid w-full shrink-0 snap-start snap-always grid-cols-1 content-start gap-2.5 p-1.5 md:grid-cols-2"
          >
            {cards.map((item, j) => (
              <li key={j}>
                <ExampleCard {...item} className={CARD_CORNERS[j]} />
              </li>
            ))}
          </ul>
        ))}
      </div>
      <ArrowButton
        label={text.next}
        disabled={page === pageCount - 1}
        onClick={() => goTo(page + 1)}
        className="max-md:order-last"
      >
        <ChevronRight />
      </ArrowButton>
      {pageCount > 1 && (
        <div className="flex items-center justify-center gap-2.5 py-0.5 md:basis-full">
          {Array.from({ length: pageCount }, (_, i) => (
            <BaseButton
              key={i}
              aria-label={text.page.replace('{page}', String(i + 1))}
              aria-current={i === page ? 'page' : undefined}
              onClick={() => goTo(i)}
              className={cn(
                'h-2.5 cursor-pointer rounded-full bg-light/50 transition-all hover:bg-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
                i === page ? 'w-6.25 bg-light' : 'w-2.5',
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Calls `advance` every `AUTOPLAY_MS` while `enabled`. It waits while the
 * carousel is hovered, focused, off screen or in a background tab, and
 * stops for good once someone scrolls, swipes or clicks it, so it never
 * pulls a page away from a reader. Returns a function that stops it.
 */
function useAutoplay({
  root,
  scroller,
  enabled,
  advance,
}: {
  root: RefObject<HTMLDivElement | null>
  scroller: RefObject<HTMLDivElement | null>
  enabled: boolean
  advance: () => void
}) {
  const stopped = useRef(false)
  const latestAdvance = useRef(advance)
  useEffect(() => {
    latestAdvance.current = advance
  })

  useEffect(() => {
    const el = root.current
    const scroll = scroller.current
    if (!enabled || !el || !scroll) return
    let hovered = false
    let visible = false
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
    })
    observer.observe(el)
    const timer = window.setInterval(() => {
      const paused =
        stopped.current ||
        hovered ||
        !visible ||
        document.hidden ||
        el.contains(document.activeElement)
      if (!paused) latestAdvance.current()
    }, AUTOPLAY_MS)

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') hovered = true
    }
    const onLeave = () => (hovered = false)
    // Any hand on the row itself: a wheel or trackpad scroll, a touch, a
    // press on a card or the scrollbar.
    const stop = () => (stopped.current = true)
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    scroll.addEventListener('wheel', stop, { passive: true })
    scroll.addEventListener('touchstart', stop, { passive: true })
    scroll.addEventListener('pointerdown', stop)
    scroll.addEventListener('keydown', stop)
    return () => {
      window.clearInterval(timer)
      observer.disconnect()
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      scroll.removeEventListener('wheel', stop)
      scroll.removeEventListener('touchstart', stop)
      scroll.removeEventListener('pointerdown', stop)
      scroll.removeEventListener('keydown', stop)
    }
  }, [root, scroller, enabled])

  return () => {
    stopped.current = true
  }
}

function ArrowButton({
  label,
  disabled,
  onClick,
  className,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  className?: string
  children: ReactNode
}) {
  return (
    <Button
      variant="dark"
      size="icon"
      aria-label={label}
      disabled={disabled}
      // Keep focus on the arrow when it hits the first or last page.
      focusableWhenDisabled
      onClick={onClick}
      className={cn('bg-gray', className)}
    >
      {children}
    </Button>
  )
}

function ExampleCard({
  title,
  href,
  image,
  className,
}: SessionExample & { className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        'relative isolate flex h-70 flex-col justify-end overflow-clip rounded-sm p-5 text-foreground transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
        className,
      )}
    >
      <ResponsiveImage
        image={image}
        // Two to a page from `md` up, in the content column.
        sizes="(min-width: 48rem) 30rem, 100vw"
        alt=""
        className="absolute inset-0 -z-10 size-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/0 to-background/75 to-85%" />
      <span className="text-paragraph">{title}</span>
    </a>
  )
}
