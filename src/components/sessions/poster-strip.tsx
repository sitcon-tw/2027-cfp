import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import type { Picture } from 'vite-imagetools'

import content from '@/content.json'
import { ResponsiveImage } from '@/components/responsive-image'
import { SessionSection } from '@/components/sessions/session-section'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

const text = content.session_page.demoPosters

/** Every image in `src/assets/demo-posters/`, newest year first. */
const posters = Object.entries(
  import.meta.glob<Picture>('/src/assets/demo-posters/*.{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default',
    query: '?responsive',
  }),
)
  .sort(([a], [b]) => b.localeCompare(a, undefined, { numeric: true }))
  .map(([path, image]) => {
    // `2026-1.webp` is SITCON 2026's first poster.
    const [, year = '', number = ''] = /(\d{4})-(\d+)\.\w+$/.exec(path) ?? []
    return {
      image,
      alt: text.poster.replace('{year}', year).replace('{number}', number),
    }
  })

/** How many times the posters repeat in one copy of the strip, so a copy
 *  outruns even a very wide screen. */
const cycles = 2

/** Seconds to drift past one copy: the homepage photo wall's pace
 *  (`--animate-photo-wall` in `src/index.css`). */
const loopSeconds = 140

/** How long the drift waits after someone scrolls by hand. */
const resumeDelay = 2000

/**
 * Drifts `el` sideways and wraps it around one copy of its doubled
 * content, so it loops forever in both directions. Hand scrolling moves the
 * same position, and the drift waits while the strip is hovered, focused,
 * touched, or was just scrolled. Reduced motion keeps it still. Returns
 * the cleanup.
 */
function drift(el: HTMLDivElement) {
  const copy = el.querySelector<HTMLElement>('[data-copy]')
  if (!copy) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let pos = 0
  let hovered = false
  let touching = false
  let lastManual = -Infinity
  let last = performance.now()
  let frame = 0

  // Keep `pos` within (0, copy], where both neighbours are on screen.
  const wrap = () => {
    const width = copy.offsetWidth
    if (pos > width) pos -= width
    else if (pos < 1) pos += width
    el.scrollLeft = pos
    // Clamped while the posters are still loading: follow the real position.
    if (Math.abs(el.scrollLeft - pos) > 1) pos = el.scrollLeft
  }

  const tick = (now: number) => {
    const dt = Math.min(now - last, 100)
    last = now
    const paused =
      reduceMotion.matches ||
      hovered ||
      touching ||
      el.contains(document.activeElement) ||
      now - lastManual < resumeDelay
    if (!paused) {
      pos += (copy.offsetWidth / loopSeconds) * (dt / 1000)
      wrap()
    }
    frame = requestAnimationFrame(tick)
  }

  const onScroll = () => {
    if (Math.abs(el.scrollLeft - pos) <= 1) return
    pos = el.scrollLeft
    lastManual = performance.now()
    wrap()
  }
  const onEnter = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') hovered = true
  }
  const onLeave = () => (hovered = false)
  const onTouchStart = () => (touching = true)
  const onTouchEnd = () => {
    touching = false
    lastManual = performance.now()
  }

  wrap()
  frame = requestAnimationFrame(tick)
  el.addEventListener('scroll', onScroll, { passive: true })
  el.addEventListener('pointerenter', onEnter)
  el.addEventListener('pointerleave', onLeave)
  el.addEventListener('touchstart', onTouchStart, { passive: true })
  el.addEventListener('touchend', onTouchEnd)
  el.addEventListener('touchcancel', onTouchEnd)
  return () => {
    cancelAnimationFrame(frame)
    el.removeEventListener('scroll', onScroll)
    el.removeEventListener('pointerenter', onEnter)
    el.removeEventListener('pointerleave', onLeave)
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchend', onTouchEnd)
    el.removeEventListener('touchcancel', onTouchEnd)
  }
}

/**
 * 歷年海報展示 — a full-width row of past Demo posters drifting sideways,
 * at the homepage photo wall's pace. It can be scrolled by hand too, and
 * loops either way. Clicking a poster opens it large, where the arrows
 * (buttons or keys) step through the others.
 */
export function PosterStrip() {
  const viewport = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  // Kept while closing, so the preview doesn't empty during its exit.
  const [current, setCurrent] = useState(0)
  useEffect(() => (viewport.current ? drift(viewport.current) : undefined), [])
  const strip = Array.from({ length: cycles }, () => posters).flat()
  return (
    <SessionSection
      title={text.title}
      description={text.description}
      bleed={
        <Dialog open={open} onOpenChange={setOpen}>
          <ScrollArea
            viewportRef={viewport}
            aria-label={text.label}
            role="region"
            viewportClassName="py-2.5"
            scrollbar={false}
          >
            <div className="flex w-max">
              {/* Doubled so wrapping around one copy is seamless. Only the
                  first run of posters is announced and tabbable; the
                  repeats still open on click. */}
              {[0, 1].map((copy) => (
                <div key={copy} data-copy className="flex gap-12.5 pr-12.5">
                  {strip.map((poster, i) => {
                    const repeat = copy > 0 || i >= posters.length
                    return (
                      <DialogTrigger
                        key={i}
                        aria-hidden={repeat || undefined}
                        tabIndex={repeat ? -1 : undefined}
                        aria-label={text.enlarge.replace(
                          '{poster}',
                          poster.alt,
                        )}
                        onClick={() => setCurrent(i % posters.length)}
                        className="shrink-0 cursor-zoom-in rounded-sm transition hover:brightness-110 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue"
                      >
                        <ResponsiveImage
                          image={poster.image}
                          // `h-148.5` tall, in A-series proportions.
                          sizes="20rem"
                          alt=""
                          draggable={false}
                          className="h-148.5 w-auto rounded-sm"
                        />
                      </DialogTrigger>
                    )
                  })}
                </div>
              ))}
            </div>
          </ScrollArea>
          <PosterPreview
            current={current}
            onChange={setCurrent}
            onClose={() => setOpen(false)}
          />
        </Dialog>
      }
    />
  )
}

/**
 * The poster at its largest: from `md` up, as tall as the screen allows
 * over the darkened page, which closes it when clicked; a bottom sheet
 * below `md`.
 */
function PosterPreview({
  current,
  onChange,
  onClose,
}: {
  current: number
  onChange: (index: number) => void
  onClose: () => void
}) {
  const poster = posters[current]
  if (!poster) return null
  const step = (by: number) =>
    onChange((current + by + posters.length) % posters.length)
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') step(-1)
    else if (e.key === 'ArrowRight') step(1)
    else return
    e.preventDefault()
  }
  return (
    <DialogContent
      onKeyDown={onKeyDown}
      backdropClassName="bg-black/80"
      className="flex flex-col items-center gap-5 md:h-full md:max-w-none md:rounded-none md:bg-transparent md:p-0 md:text-foreground"
    >
      <div className="flex w-full items-center justify-between gap-5">
        <DialogTitle>{poster.alt}</DialogTitle>
        <DialogClose aria-label={text.close} />
      </div>
      {/* Spans the screen from `md` up, so a click beside the poster lands
          here and closes the preview, as on the backdrop. */}
      <div
        className="flex min-h-0 flex-1 justify-center self-stretch"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <ResponsiveImage
          key={current}
          image={poster.image}
          sizes="(min-width: 48rem) 50rem, 100vw"
          alt={poster.alt}
          loading="eager"
          className="max-h-full w-auto max-w-full rounded-sm object-contain"
        />
      </div>
      {posters.length > 1 && (
        <div className="flex items-center gap-5">
          <Button
            variant="dark"
            size="icon"
            aria-label={text.previous}
            onClick={() => step(-1)}
          >
            <ChevronLeft />
          </Button>
          <span className="font-numeric text-body" aria-live="polite">
            {text.position
              .replace('{index}', String(current + 1))
              .replace('{count}', String(posters.length))}
          </span>
          <Button
            variant="dark"
            size="icon"
            aria-label={text.next}
            onClick={() => step(1)}
          >
            <ChevronRight />
          </Button>
        </div>
      )}
    </DialogContent>
  )
}
