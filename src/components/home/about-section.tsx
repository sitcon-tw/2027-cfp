import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import content from '@/content.json'
import { PhotoWall } from '@/components/home/photo-wall'
import { buttonVariants } from '@/components/ui/button'
import { links } from '@/lib/links'
import { useReducedMotion } from '@/lib/use-media-query'
import { cn } from '@/lib/utils'

const statColors = ['text-red', 'text-blue', 'text-green', 'text-foreground']

/**
 * Splits a stat like `15,000`, `500+` or `1.5萬` into the number to count
 * up and the text around it. Values without a number return `null` and are
 * shown as written.
 */
function parseStat(value: string) {
  const match = /^(\D*?)(\d[\d,]*(?:\.\d+)?)(.*)$/s.exec(value)
  if (!match) return null
  const [, prefix = '', digits = '', suffix = ''] = match
  const target = Number(digits.replaceAll(',', ''))
  if (!Number.isFinite(target)) return null
  return {
    prefix,
    suffix,
    target,
    format: new Intl.NumberFormat('en-US', {
      useGrouping: digits.includes(','),
      minimumFractionDigits: digits.split('.')[1]?.length ?? 0,
      maximumFractionDigits: digits.split('.')[1]?.length ?? 0,
    }),
  }
}

function countUp(value: string, progress: number) {
  const stat = parseStat(value)
  if (!stat) return value
  return `${stat.prefix}${stat.format.format(stat.target * progress)}${stat.suffix}`
}

/**
 * The numbers count up from zero the first time they scroll into view.
 * Prerendered HTML carries the real values, and so does the page when the
 * stats are already on screen (or scrolled past) once it hydrates: they
 * only reset to zero while still below the fold, so nobody sees a number
 * jump back.
 */
function AnimatedStats({
  stats,
}: {
  stats: typeof content.about_section.stats
}) {
  const listRef = useRef<HTMLDListElement>(null)
  const reduceMotion = useReducedMotion()
  const [progress, setProgress] = useState<number | null>(null)

  useEffect(() => {
    const list = listRef.current
    if (reduceMotion || !list || !('IntersectionObserver' in window)) {
      setProgress(null)
      return
    }

    let frame = 0
    let first = true
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (first) {
          first = false
          if (entry.boundingClientRect.top < window.innerHeight) {
            // Already on screen or above it: keep the final values.
            observer.disconnect()
            return
          }
          setProgress(0)
        }
        if (entry.intersectionRatio < 0.25) return
        observer.disconnect()

        const start = performance.now()
        const tick = (now: number) => {
          const elapsed = Math.min((now - start) / 1400, 1)
          setProgress(elapsed < 1 ? 1 - (1 - elapsed) ** 3 : null)
          if (elapsed < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      },
      { threshold: [0, 0.25] },
    )

    observer.observe(list)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      // Interrupted (reduced motion switched on): settle on the real values.
      setProgress(null)
    }
  }, [reduceMotion])

  return (
    <dl ref={listRef} className="grid gap-x-12.5 gap-y-10 sm:grid-cols-2">
      {stats.map(({ value, label }, index) => (
        <div
          key={label}
          className="flex flex-col-reverse justify-end gap-2.5 border-t-2 border-foreground/15 pt-5"
        >
          <dt className="text-lead text-foreground/80">{label}</dt>
          <dd
            className={cn(
              'font-numeric text-stat font-bold tracking-tight',
              statColors[index],
            )}
          >
            <span aria-hidden="true">
              {progress === null ? value : countUp(value, progress)}
            </span>
            <span className="sr-only">{value}</span>
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * 甚麼是 SITCON ? — the first thing people arriving from sitcon.org see, so
 * it sells the conference before the attend and speaker sections. Sized
 * past the type scale on purpose (`text-headline`, `text-stat`), with a
 * full-bleed photo wall; the page's `overflow-x-clip` trims it.
 */
export function AboutSection() {
  const about = content.about_section

  return (
    <section
      id="about-sitcon"
      aria-labelledby="about-sitcon-title"
      className="pt-30 pb-17.5"
    >
      <div className="px-2.5">
        <div className="mx-auto flex max-w-content flex-col gap-15 p-2.5">
          <h2 id="about-sitcon-title" className="sr-only">
            {about.title}
          </h2>
          <div className="flex flex-col gap-5">
            <p className="text-headline font-extrabold tracking-tight">
              <span className="block">{about.headline.lead}</span>
              <span className="block text-blue">{about.headline.emphasis}</span>
            </p>
            <p className="text-h1 font-extrabold">{about.tagline}</p>
          </div>
          {/* The numbers back the headline, so they sit right under it
              instead of under a heading of their own. */}
          <AnimatedStats stats={about.stats} />
        </div>
      </div>

      <PhotoWall>
        <a
          href={links.social.flickr}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: 'muted' })}
        >
          {about.photos}
        </a>
        <Link to={links.about} className={buttonVariants()}>
          {about.about}
        </Link>
      </PhotoWall>
    </section>
  )
}
