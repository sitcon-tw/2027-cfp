import { Button as BaseButton } from '@base-ui/react/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useSyncExternalStore, type ReactNode } from 'react'

import content from '@/content.json'
import { SessionSection } from '@/components/sessions/session-section'
import { Button } from '@/components/ui/button'
import type { ExamplesSection, SessionExample } from '@/lib/session-pages'
import { cn } from '@/lib/utils'

const text = content.session_page.examples

/** Cards per page: a 2×2 grid from `md` up, a single column of 2 below. */
const PAGE_SIZE = { desktop: 4, mobile: 2 }

export type ExamplesCarouselProps = ExamplesSection

/**
 * Paged grid of past sessions: Presentation / Espresso / 投稿範例. The
 * arrows and the dots drive the same page; nothing advances on its own.
 */
export function ExamplesCarousel({
  title,
  description,
  items,
}: ExamplesCarouselProps) {
  const desktop = useMediaQuery('(min-width: 48rem)')
  const pageSize = desktop ? PAGE_SIZE.desktop : PAGE_SIZE.mobile
  const pageCount = Math.ceil(items.length / pageSize)
  const [requestedPage, setPage] = useState(0)
  // Fewer pages after a resize: stay on the last one that still exists.
  const page = Math.min(requestedPage, Math.max(0, pageCount - 1))
  const visible = items.slice(page * pageSize, (page + 1) * pageSize)

  if (items.length === 0) {
    return (
      <SessionSection title={title} description={description}>
        <p className="text-paragraph text-foreground/70">{text.empty}</p>
      </SessionSection>
    )
  }

  return (
    <SessionSection title={title} description={description}>
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-3.75">
          <ArrowButton
            label={text.previous}
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeft />
          </ArrowButton>
          <ul
            aria-live="polite"
            className="grid flex-1 grid-cols-1 gap-2.5 py-2.5 md:grid-cols-2"
          >
            {visible.map((item, i) => (
              <li key={page * pageSize + i}>
                <ExampleCard {...item} />
              </li>
            ))}
          </ul>
          <ArrowButton
            label={text.next}
            disabled={page === pageCount - 1}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight />
          </ArrowButton>
        </div>
        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-2.5 py-0.5">
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
    </SessionSection>
  )
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
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
      className="bg-gray"
    >
      {children}
    </Button>
  )
}

function ExampleCard({ title, href, image }: SessionExample) {
  return (
    <a
      href={href}
      className="relative isolate flex h-70 flex-col justify-end overflow-clip rounded-sm rounded-tl-xl p-5 text-foreground transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
    >
      <img
        src={image}
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
