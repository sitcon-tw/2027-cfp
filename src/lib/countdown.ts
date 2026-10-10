import { useEffect, useState } from 'react'

import content from '@/content.json'

const MINUTE = 60_000

/**
 * Parses an ISO timestamp with a time zone, or `null` while it is not
 * announced. Invalid strings count as unannounced.
 */
export function parseDeadline(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** The end of a speaker-schedule item in `content.json`, by id. */
function scheduleEnd(id: string) {
  const item = content.speaker_section.schedule.find((item) => item.id === id)
  return parseDeadline(item?.end as string | null | undefined)
}

/**
 * Deadlines from `content.speaker_section.schedule`: the homepage counts down
 * to the end of 投稿期間, the session pages to the end of 早鳥投稿.
 */
export const deadlines = {
  submission: scheduleEnd('submission'),
  earlyBird: scheduleEnd('early'),
}

export interface Countdown {
  days: number
  hours: number
  minutes: number
  /** The deadline has passed; every part is 0. */
  expired: boolean
}

/**
 * Whole days, hours and minutes left until `deadline`, refreshed every
 * minute. Never negative: once the deadline passes it stays at 0 and stops
 * ticking. Returns `null` when there is no deadline.
 */
export function useCountdown(deadline: Date | null): Countdown | null {
  const [now, setNow] = useState(() => Date.now())
  const target = deadline?.getTime() ?? null

  useEffect(() => {
    if (target === null || Date.now() >= target) return
    let timeout: ReturnType<typeof setTimeout>
    // Tick on the minute boundary relative to the deadline, so the shown
    // minute changes exactly when it should.
    const schedule = () => {
      const left = target - Date.now()
      timeout = setTimeout(
        () => {
          setNow(Date.now())
          if (Date.now() < target) schedule()
        },
        left % MINUTE || MINUTE,
      )
    }
    schedule()
    return () => clearTimeout(timeout)
  }, [target])

  if (target === null) return null

  const minutes = Math.max(0, Math.ceil((target - now) / MINUTE))
  return {
    days: Math.floor(minutes / 1440),
    hours: Math.floor(minutes / 60) % 24,
    minutes: minutes % 60,
    expired: minutes === 0,
  }
}
