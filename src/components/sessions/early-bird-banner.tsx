import { Link } from '@tanstack/react-router'

import content from '@/content.json'
import birdPattern from '@/assets/early-bird-pattern.svg'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  deadlines,
  useCountdown,
  useSubmissionClosed,
  useUpcomingDeadline,
  type Countdown,
} from '@/lib/countdown'
import type { SessionTypeId } from '@/lib/session-types'
import { fillPlaceholders, pad } from '@/lib/utils'

const text = content.session_page.earlyBird

// Enough copies to overflow the widest band; the list renders twice so the
// marquee can loop by sliding exactly one copy.
const MARQUEE_REPEAT = 8

/** Early Bird marquee and the early-bird submission countdown. */
export function EarlyBirdBanner({ type }: { type: SessionTypeId }) {
  const submissionClosed = useSubmissionClosed()
  return (
    <section className="px-2.5 py-15">
      <div className="mx-auto max-w-content px-2.5">
        <div className="relative isolate overflow-clip rounded-xl bg-blue text-foreground">
          {/* Anchored to the right edge, overflowing it as in Figma; it sits
              behind the text, faint enough to keep on mobile too. */}
          <img
            src={birdPattern}
            alt=""
            aria-hidden
            className="pointer-events-none absolute top-29.5 -right-17 -z-10 w-111.75 max-w-none rotate-15"
          />
          <Marquee />
          <div className="flex flex-col gap-2.5 px-7.5 pt-10 pb-8.75 md:pr-10 md:pl-12.5">
            <h2 className="text-h3 font-bold">{text.title}</h2>
            <p className="text-h1 font-extrabold break-keep">
              <EarlyBirdCountdown />
            </p>
            <p className="text-paragraph font-bold">{text.deadline}</p>
            <p className="text-paragraph">{text.tagline}</p>
            <div className="flex justify-end">
              {submissionClosed ? (
                <Button variant="cream" disabled>
                  {content.submit_closed.button}
                </Button>
              ) : (
                <Link
                  to="/submit/$type"
                  params={{ type }}
                  className={buttonVariants({ variant: 'cream' })}
                >
                  {text.submit}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Marquee() {
  const words = Array.from({ length: MARQUEE_REPEAT }, () => text.marquee)
  return (
    <div aria-hidden className="overflow-clip bg-yellow py-2.5 text-black">
      <div className="flex w-max motion-safe:animate-early-bird">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 gap-5 pr-5">
            {words.map((word, i) => (
              <span
                key={i}
                className="text-paragraph font-extrabold whitespace-nowrap"
              >
                {word}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

type CountdownPart = Exclude<keyof Countdown, 'expired'>

// Counts down to the end of 早鳥投稿, then to the end of 投稿期間, as the
// homepage does.
const DEADLINES = [
  { format: text.countdownEarly, date: deadlines.earlyBird },
  { format: text.countdownSubmission, date: deadlines.submission },
] as const

/**
 * Time left until the nearest submission deadline, every number `??` until
 * it is set. The numbers are in Inter with tabular figures, so the line
 * keeps its width as the seconds tick.
 */
function EarlyBirdCountdown() {
  const { format, date } = useUpcomingDeadline(DEADLINES)
  const countdown = useCountdown(date)
  return fillPlaceholders(format, (name) => (
    <span key={name} className="font-numeric tabular-nums">
      {countdown
        ? pad(countdown[name as CountdownPart])
        : text.unknownCountdownValue}
    </span>
  ))
}
