import { useEffect, useState } from 'react'

import { deadlines } from '@/lib/deadlines'

export { deadlines, parseDeadline } from '@/lib/deadlines'

const MINUTE = 60_000

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

/**
 * Whether the submission deadline (the end of 投稿期間) has passed. Flips to
 * `true` on its own when the deadline passes while the page is open. An
 * unannounced deadline keeps submissions open.
 */
export function useSubmissionClosed(): boolean {
  return useCountdown(deadlines.submission)?.expired ?? false
}
