import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'
import { SessionSection } from '@/components/sessions/session-section'

const text = content.session_page.demoPosters

// TODO: past Demo posters, from the organizers.
const POSTER_COUNT = 5

/** How many times the posters repeat in one copy of the strip, so a copy
 *  outruns even a very wide screen. */
const cycles = 2

/**
 * 歷年海報展示 — a full-width row of past Demo posters drifting sideways,
 * at the homepage photo wall's pace. Hovering pauses it; reduced motion keeps
 * it still.
 */
export function PosterStrip() {
  const posters = Array.from({ length: POSTER_COUNT * cycles }, (_, i) => i)
  return (
    <SessionSection
      title={text.title}
      bleed={
        <div
          role="img"
          aria-label={text.label}
          className="group overflow-hidden py-2.5"
        >
          <div className="flex w-max animate-photo-wall group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {/* Doubled so the -50% loop is seamless. */}
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden
                className="flex gap-12.5 pr-12.5 md:gap-52.5 md:pr-52.5"
              >
                {posters.map((i) => (
                  <Placeholder
                    key={i}
                    label={text.placeholder}
                    className="h-148.5 w-87.5 shrink-0 rounded-xl"
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      }
    />
  )
}
