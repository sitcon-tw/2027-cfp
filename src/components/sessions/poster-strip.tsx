import { useEffect, useRef } from 'react'
import type { Picture } from 'vite-imagetools'

import content from '@/content.json'
import { ResponsiveImage } from '@/components/responsive-image'
import { SessionSection } from '@/components/sessions/session-section'
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
  .map(([, src]) => src)

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
 * loops either way.
 */
export function PosterStrip() {
  const viewport = useRef<HTMLDivElement>(null)
  useEffect(() => (viewport.current ? drift(viewport.current) : undefined), [])
  const strip = Array.from({ length: cycles }, () => posters).flat()
  return (
    <SessionSection
      title={text.title}
      description={text.description}
      bleed={
        <ScrollArea
          viewportRef={viewport}
          aria-label={text.label}
          role="region"
          viewportClassName="py-2.5"
          scrollbar={false}
        >
          <div className="flex w-max">
            {/* Doubled so wrapping around one copy is seamless. */}
            {[0, 1].map((copy) => (
              <div
                key={copy}
                data-copy
                aria-hidden
                className="flex gap-12.5 pr-12.5"
              >
                {strip.map((poster, i) => (
                  <ResponsiveImage
                    key={i}
                    image={poster}
                    // `h-148.5` tall, in A-series proportions.
                    sizes="20rem"
                    alt=""
                    draggable={false}
                    className="h-148.5 w-auto shrink-0 rounded-sm"
                  />
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      }
    />
  )
}
