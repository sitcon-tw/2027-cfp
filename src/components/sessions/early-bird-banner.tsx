import content from '@/content.json'
import birdPattern from '@/assets/early-bird-pattern.svg'
import { buttonVariants } from '@/components/ui/button'
import { deadlines, useCountdown } from '@/lib/countdown'
import { links } from '@/lib/links'
import type { SessionTypeId } from '@/lib/session-types'

const text = content.session_page.earlyBird

// Enough copies to overflow the widest band; the list renders twice so the
// marquee can loop by sliding exactly one copy.
const MARQUEE_REPEAT = 8

/** Early Bird marquee and the early-bird submission countdown. */
export function EarlyBirdBanner({ type }: { type: SessionTypeId }) {
  return (
    <section className="px-2.5 py-15">
      <div className="mx-auto max-w-content px-2.5">
        <div className="relative isolate overflow-clip rounded-xl bg-blue text-foreground">
          <img
            src={birdPattern}
            alt=""
            aria-hidden
            className="pointer-events-none absolute top-29.5 left-142.75 -z-10 w-111.75 max-w-none rotate-15 max-md:hidden"
          />
          <Marquee />
          <div className="flex flex-col gap-2.5 px-7.5 pt-10 pb-8.75 md:pr-10 md:pl-12.5">
            <h2 className="text-h3 font-bold">{text.title}</h2>
            <p className="text-h1 font-extrabold">
              <EarlyBirdCountdown />
            </p>
            <p className="text-paragraph">{text.tagline}</p>
            <div className="flex justify-end">
              <a
                href={links.submit[type]}
                className={buttonVariants({ variant: 'cream' })}
              >
                {text.submit}
              </a>
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

/** Time left until the early-bird deadline; a placeholder until it is set. */
function EarlyBirdCountdown() {
  const countdown = useCountdown(deadlines.earlyBird)
  if (!countdown) return text.unknownCountdown
  return text.countdown
    .replace('{days}', String(countdown.days))
    .replace('{hours}', String(countdown.hours))
    .replace('{minutes}', String(countdown.minutes))
}
