import { Button as BaseButton } from '@base-ui/react/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useSyncExternalStore, type ReactNode } from 'react'

import content from '@/content.json'
import { ResponsiveImage } from '@/components/responsive-image'
import { SessionSection } from '@/components/sessions/session-section'
import { Button } from '@/components/ui/button'
import type {
  ExampleGroup,
  ExamplesSection,
  SessionExample,
} from '@/lib/session-pages'
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

/**
 * Paged grid of past sessions. The arrows and the dots drive the same
 * page, which slides in sideways; nothing advances on its own.
 */
function Carousel({ items }: Pick<ExampleGroup, 'items'>) {
  const desktop = useMediaQuery('(min-width: 48rem)')
  const pageSize = desktop ? PAGE_SIZE.desktop : PAGE_SIZE.mobile
  const pageCount = Math.ceil(items.length / pageSize)
  const [requestedPage, setPage] = useState(0)
  // Fewer pages after a resize: stay on the last one that still exists.
  const page = Math.min(requestedPage, Math.max(0, pageCount - 1))
  const pages = Array.from({ length: pageCount }, (_, i) =>
    items.slice(i * pageSize, (i + 1) * pageSize),
  )

  if (items.length === 0) {
    return <p className="text-paragraph text-foreground/70">{text.empty}</p>
  }

  // Arrows flank the cards from `md` up; below it the cards take the full
  // width and the arrows sit under them, either side of the dots.
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3.75 gap-y-2.5">
      <ArrowButton
        label={text.previous}
        disabled={page === 0}
        onClick={() => setPage(page - 1)}
      >
        <ChevronLeft />
      </ArrowButton>
      <div className="order-first min-w-0 basis-full overflow-clip md:order-none md:flex-1 md:basis-0">
        <div
          className="flex transition-transform duration-700 ease-smooth motion-reduce:transition-none"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {pages.map((cards, i) => (
            // Off-screen pages are inert, so Tab and screen readers
            // only reach the cards that are showing.
            <ul
              key={i}
              inert={i !== page}
              aria-hidden={i !== page}
              className="grid w-full shrink-0 grid-cols-1 gap-2.5 p-1.5 md:grid-cols-2"
            >
              {cards.map((item, j) => (
                <li key={j}>
                  <ExampleCard {...item} className={CARD_CORNERS[j]} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <ArrowButton
        label={text.next}
        disabled={page === pageCount - 1}
        onClick={() => setPage(page + 1)}
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
              onClick={() => setPage(i)}
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

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => true,
  )
}
