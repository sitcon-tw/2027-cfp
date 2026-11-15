import { createLink } from '@tanstack/react-router'
import { ChevronUp, TableOfContents } from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  sessionSectionLinks,
  type SessionSectionLink,
} from '@/lib/session-navigation'
import type { SessionTypeId } from '@/lib/session-types'
import { cn } from '@/lib/utils'

const text = content.session_page.navigation
const readingLinkClassName =
  'flex h-full min-h-control items-center rounded-sm px-5 py-2.5 text-body transition-colors duration-300 ease-smooth hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none'
// Figma's side menu: centered, bold items on the navbar's glass.
const menuLinkClassName = 'justify-center p-2.5 text-center font-bold'
const glassClassName = 'bg-black/35 text-foreground backdrop-blur-lg'
const variantLinkClassName = {
  rail: menuLinkClassName,
  overview: '',
  sheet: menuLinkClassName,
}

/** One reading map: a side rail when it fits, a bottom bar and sheet otherwise. */
export function SessionReadingLayout({
  type,
  children,
}: {
  type: SessionTypeId
  children: ReactNode
}) {
  const sections = useMemo(() => sessionSectionLinks(type), [type])
  const body = useRef<HTMLDivElement>(null)
  const overview = useRef<HTMLDivElement>(null)
  const destination = useRef<HTMLElement | null>(null)
  const [current, setCurrent] = useState<string>()
  const [open, setOpen] = useState(false)
  const [barShown, setBarShown] = useState(false)

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
      const reading = lastSection.getBoundingClientRect().bottom > line
      // Between the overview and the end of the map, so the bar stays off
      // the overview it repeats and the CTAs and footer after it.
      setBarShown(
        overview.current!.getBoundingClientRect().bottom <= line && reading,
      )
      const native = nativeScrollspy
        ? document.querySelector<HTMLAnchorElement>(
            '.session-navigation-links a:target-current',
          )
        : null
      setCurrent(
        reached.length && reading
          ? (native?.hash.slice(1) ?? reached.at(-1)?.id)
          : undefined,
      )
    }
    let observer: IntersectionObserver
    const observe = () => {
      observer?.disconnect()
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
    window.addEventListener('resize', observe)
    document.addEventListener('scrollend', sync)
    observe()
    return () => {
      observer.disconnect()
      resize.disconnect()
      window.removeEventListener('resize', observe)
      document.removeEventListener('scrollend', sync)
    }
  }, [sections])

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
          <div
            className={cn(
              'session-navigation-panel pointer-events-auto relative left-5 ml-auto w-75 translate-x-full scroll-py-10 overflow-y-auto overscroll-contain rounded-xl p-10',
              glassClassName,
            )}
          >
            <SectionLinks {...links} variant="rail" />
          </div>
        </div>
      </div>
      <div ref={body} className="col-start-1 row-start-1 min-w-0">
        <div ref={overview} className="session-navigation-compact px-2.5">
          <div className="mx-auto max-w-content p-2.5">
            <p className="flex min-h-control items-center px-5 py-2.5 text-body font-bold">
              {text.label}
            </p>
            <SectionLinks {...links} variant="overview" />
          </div>
        </div>
        <Dialog
          open={open}
          onOpenChange={(value) => {
            destination.current = null
            setOpen(value)
          }}
        >
          <div
            inert={!barShown}
            className={cn(
              'session-navigation-compact session-navigation-bar inset-x-0 z-20 px-2.5 transition duration-300 ease-smooth motion-reduce:transition-none',
              !barShown &&
                'translate-y-full opacity-0 motion-reduce:translate-y-0',
            )}
          >
            <div className="mx-auto max-w-content px-2.5">
              <DialogTrigger
                aria-label={text.trigger.replace(
                  '{title}',
                  currentTitle ?? sectionCount,
                )}
                className={cn(
                  glassClassName,
                  'flex min-h-control w-full cursor-pointer items-center gap-5 rounded-full px-7.5 py-2.5 text-body transition-colors duration-300 ease-smooth hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none',
                )}
              >
                <TableOfContents aria-hidden className="size-6 shrink-0" />
                {/* One line, so the bar's height never changes while reading. */}
                <span className="min-w-0 flex-1 truncate text-left font-bold">
                  {currentTitle ?? text.label}
                </span>
                <ChevronUp aria-hidden className="size-6 shrink-0" />
              </DialogTrigger>
            </div>
          </div>
          <DialogContent
            className="flex flex-col gap-5"
            popupClassName={glassClassName}
            finalFocus={() => {
              const target = destination.current
              if (!target) return true
              // The sheet locks page scrolling, so move to the section once
              // it has closed instead of relying on the link's own scroll.
              target.scrollIntoView({
                behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? 'instant'
                  : 'smooth',
              })
              target.focus({ preventScroll: true })
              return false
            }}
          >
            <DialogTitle className="text-center">{text.label}</DialogTitle>
            <SectionLinks {...links} variant="sheet" />
          </DialogContent>
        </Dialog>
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
  variant,
}: {
  type: SessionTypeId
  sections: SessionSectionLink[]
  current?: string
  onSelect: (id: string) => void
  variant: keyof typeof variantLinkClassName
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
          'session-navigation-links grid items-stretch',
          variant === 'overview' ? 'gap-0' : 'gap-2.5',
          variant === 'overview' && 'grid-cols-2 md:grid-cols-4',
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
              className={cn(
                readingLinkClassName,
                variantLinkClassName[variant],
              )}
            >
              {title}
            </ReadingLink>
          </li>
        ))}
      </ol>
      {variant === 'sheet' && (
        <div className="pt-5">
          <ReadingLink
            to="/$type"
            params={{ type }}
            hash="page-top"
            onClick={(event) => select(event, 'page-top')}
            className={cn(readingLinkClassName, variantLinkClassName.sheet)}
          >
            {text.backToTop}
          </ReadingLink>
        </div>
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
