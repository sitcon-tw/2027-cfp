import { useLayoutEffect, useRef } from 'react'

import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'
import { SessionSection } from '@/components/sessions/session-section'

const text = content.session_page.demoPosters

// TODO: past Demo posters, from the organizers.
const POSTER_COUNT = 5

/** The poster centered on load, so both sides show a neighbor (as in Figma). */
const INITIAL_POSTER = 1

/**
 * 歷年海報展示 — full-width row of past Demo posters. Each poster snaps to
 * the center with its neighbors peeking in; the row scrolls by touch,
 * trackpad, scrollbar, or arrow keys once focused.
 */
export function PosterStrip() {
  const row = useRef<HTMLDivElement>(null)
  const initial = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const strip = row.current
    const poster = initial.current
    if (!strip || !poster) return
    strip.scrollLeft =
      poster.offsetLeft - (strip.clientWidth - poster.clientWidth) / 2
  }, [])

  return (
    <SessionSection
      title={text.title}
      bleed={
        <div
          ref={row}
          role="region"
          aria-label={text.label}
          tabIndex={0}
          className="relative flex snap-x snap-mandatory gap-12.5 overflow-x-auto py-2.5 scheme-dark focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue md:gap-52.5"
        >
          {/* Spacers (half the row, minus half a poster and a gap) let the
              first and last posters reach the center. */}
          <div aria-hidden className="-me-56.25 w-1/2 shrink-0 md:-me-96.25" />
          {Array.from({ length: POSTER_COUNT }, (_, i) => (
            <Placeholder
              key={i}
              ref={i === INITIAL_POSTER ? initial : undefined}
              label={text.placeholder}
              className="h-148.5 w-87.5 shrink-0 snap-center rounded-xl"
            />
          ))}
          <div aria-hidden className="-ms-56.25 w-1/2 shrink-0 md:-ms-96.25" />
        </div>
      }
    />
  )
}
