import { createLink } from '@tanstack/react-router'
import { ChevronDown } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactNode,
} from 'react'

import content from '@/content.json'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  sessionSectionLinks,
  type SessionSectionLink,
} from '@/lib/session-navigation'
import type { SessionTypeId } from '@/lib/session-types'
import { cn } from '@/lib/utils'

const text = content.session_page.navigation

/** One reading map: a side rail when it fits, a compact disclosure otherwise. */
export function SessionReadingLayout({
  type,
  children,
}: {
  type: SessionTypeId
  children: ReactNode
}) {
  const sections = useMemo(() => sessionSectionLinks(type), [type])
  const body = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const overview = useRef<HTMLDivElement>(null)
  const destination = useRef<HTMLElement | null>(null)
  const [current, setCurrent] = useState<string>()
  const [open, setOpen] = useState(false)
  const [overviewPassed, setOverviewPassed] = useState(false)

  useEffect(() => {
    const root = body.current!
    const targets = sections.map(({ id }) => document.getElementById(id)!)
    const lastSection = targets.at(-1)!.closest('section')!
    const nativeScrollspy = CSS.supports('scroll-target-group: auto')
    const sync = () => {
      const line =
        parseFloat(
          getComputedStyle(document.documentElement).scrollPaddingTop,
        ) + 1
      const reached = targets.filter(
        (target) => target.getBoundingClientRect().top <= line,
      )
      const passed = overview.current!.getBoundingClientRect().bottom <= line
      setOverviewPassed(passed)
      if (!passed) setOpen(false)
      const native = nativeScrollspy
        ? document.querySelector<HTMLAnchorElement>(
            '.session-navigation-links a:target-current',
          )
        : null
      setCurrent(
        reached.length && lastSection.getBoundingClientRect().bottom > line
          ? (native?.hash.slice(1) ?? reached.at(-1)?.id)
          : undefined,
      )
    }
    let observer: IntersectionObserver
    const observe = () => {
      observer?.disconnect()
      document.documentElement.style.setProperty(
        '--reading-bar-height',
        `${bar.current!.getBoundingClientRect().height}px`,
      )
      const line = parseFloat(
        getComputedStyle(document.documentElement).scrollPaddingTop,
      )
      observer = new IntersectionObserver(sync, {
        rootMargin: `-${line}px 0px 0px 0px`,
        threshold: [0, 1],
      })
      root
        .querySelectorAll('[data-reading-section]')
        .forEach((section) => observer.observe(section))
      targets.forEach((target) => observer.observe(target))
      observer.observe(overview.current!)
      sync()
    }
    // Track heading crossings as well as jumps past entire sections.
    const resize = new ResizeObserver(observe)
    resize.observe(root)
    resize.observe(bar.current!)
    window.addEventListener('resize', observe)
    document.addEventListener('scrollend', sync)
    observe()
    return () => {
      observer.disconnect()
      resize.disconnect()
      window.removeEventListener('resize', observe)
      document.removeEventListener('scrollend', sync)
      document.documentElement.style.removeProperty('--reading-bar-height')
    }
  }, [sections])

  useEffect(() => {
    const close = () => setOpen(false)
    const closeOffscreen = () => {
      const rect = trigger.current?.getBoundingClientRect()
      if (rect && (rect.bottom <= 0 || rect.top >= innerHeight)) close()
    }
    window.addEventListener('resize', close)
    if (open)
      window.addEventListener('scroll', closeOffscreen, { passive: true })
    return () => {
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', closeOffscreen)
    }
  }, [open])

  const select = (id: string) => {
    const target = document.getElementById(id)
    if (open) {
      destination.current = target
      setOpen(false)
    } else {
      target?.focus({ preventScroll: true })
    }
  }
  const links = { type, sections, current, onSelect: select }
  const currentTitle = sections.find(({ id }) => id === current)?.title
  const sectionCount = text.sectionCount.replace(
    '{count}',
    String(sections.length),
  )

  return (
    <div className="grid">
      <div className="session-navigation-rail pointer-events-none z-10 col-start-1 row-start-1 px-2.5">
        <div className="sticky top-header mx-auto max-w-content">
          <div className="session-navigation-panel pointer-events-auto relative left-5 ml-auto w-75 translate-x-full overflow-y-auto overscroll-contain rounded-xl bg-gray/90 p-5 backdrop-blur-lg">
            <p className="px-5 py-2.5 text-body font-bold">{text.label}</p>
            <SectionLinks {...links} />
          </div>
        </div>
      </div>
      <div ref={body} className="col-start-1 row-start-1 min-w-0">
        <div
          ref={bar}
          className="session-navigation-compact session-navigation-bar z-10 px-2.5"
        >
          <div className="mx-auto max-w-content px-2.5">
            <Popover
              open={open}
              onOpenChange={(value) => {
                destination.current = null
                setOpen(value)
              }}
            >
              <PopoverTrigger
                ref={trigger}
                aria-label={text.trigger.replace(
                  '{title}',
                  currentTitle ?? sectionCount,
                )}
                className={cn(
                  'h-auto min-h-control w-full justify-between gap-5 rounded-sm bg-gray/95 px-5 py-2.5 text-body hover:opacity-100',
                  !overviewPassed && 'hidden',
                )}
              >
                {/* Keep the reading line stable when the current title changes. */}
                <span className="min-w-0 flex-1 truncate text-left font-bold">
                  {currentTitle ?? text.label}
                </span>
                <ChevronDown
                  aria-hidden
                  className={cn('size-6 shrink-0', open && 'rotate-180')}
                />
              </PopoverTrigger>
              {!overviewPassed && (
                <p className="flex min-h-control items-center px-5 py-2.5 text-body font-bold">
                  {text.label}
                </p>
              )}
              <PopoverContent
                positionMethod="fixed"
                aria-label={text.label}
                className="rounded-sm p-2.5"
                finalFocus={() => {
                  if (!destination.current)
                    return !!trigger.current?.getClientRects().length
                  destination.current.focus({ preventScroll: true })
                  return false
                }}
              >
                <SectionLinks {...links} backToTop />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div ref={overview} className="session-navigation-compact px-2.5">
          <div className="mx-auto max-w-content p-2.5">
            <SectionLinks {...links} overview />
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

function SectionLinks({
  type,
  sections,
  current,
  onSelect,
  overview = false,
  backToTop = false,
}: {
  type: SessionTypeId
  sections: SessionSectionLink[]
  current?: string
  onSelect: (id: string) => void
  overview?: boolean
  backToTop?: boolean
}) {
  const select = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    )
      onSelect(id)
  }

  return (
    <nav aria-label={text.label}>
      <ol
        data-reading={current ? '' : undefined}
        className={cn(
          'session-navigation-links grid items-stretch gap-0',
          overview && 'grid-cols-2 md:grid-cols-4',
        )}
      >
        {sections.map(({ id, title }) => (
          <li key={id}>
            <ReadingLink
              to="/$type"
              params={{ type }}
              hash={id}
              current={current === id}
              onClick={(event) => select(event, id)}
              className="flex min-h-control items-center rounded-sm px-5 py-2.5 text-body hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            >
              {title}
            </ReadingLink>
          </li>
        ))}
      </ol>
      {backToTop && (
        <ReadingLink
          to="/$type"
          params={{ type }}
          hash="page-top"
          onClick={(event) => select(event, 'page-top')}
          className="flex min-h-control items-center rounded-sm px-5 py-2.5 text-body underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
        >
          {text.backToTop}
        </ReadingLink>
      )}
    </nav>
  )
}

// Router pathname activity is not the reader's current section.
const ReadingLink = createLink(function ReadingAnchor({
  current,
  ...props
}: ComponentPropsWithRef<'a'> & { current?: boolean }) {
  return <a {...props} aria-current={current ? 'location' : undefined} />
})
