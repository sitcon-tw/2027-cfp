import { useEffect, useState } from 'react'

import { deadlines } from '@/lib/deadlines'

export { deadlines, parseDeadline } from '@/lib/deadlines'

const SECOND = 1000
// The longest delay `setTimeout` accepts (about 24.8 days); longer waits are
// split into several timeouts.
const MAX_TIMEOUT = 2 ** 31 - 1

export interface Countdown {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** The deadline has passed; every part is 0. */
  expired: boolean
}

/**
 * Whole days, hours, minutes and seconds from `now` until `deadline`, rounded
 * up to the second so it reads 0 only once the deadline has passed. Never
 * negative.
 */
export function countdownParts(deadline: Date, now: number): Countdown {
  const seconds = Math.max(0, Math.ceil((deadline.getTime() - now) / SECOND))
  return {
    days: Math.floor(seconds / 86_400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
    expired: seconds === 0,
  }
}

/**
 * The first of `items` whose `date` is announced and still ahead of `now`,
 * or the last item once none are (it keeps showing as passed). `items` are
 * in date order.
 */
export function upcomingDeadline<T extends { date: Date | null }>(
  items: readonly [T, ...T[]],
  now: number,
): T {
  return (
    items.find((item) => item.date && item.date.getTime() > now) ??
    items[items.length - 1]
  )
}

/**
 * The current time, refreshed when each of `targets` passes and, with
 * `step`, on every `step` boundary before the last of them (counted back
 * from it, so a countdown changes exactly when it should). Stops once every
 * target has passed.
 */
function useClock(targets: readonly (Date | null)[], step?: number): number {
  const [now, setNow] = useState(() => Date.now())
  // A primitive dependency, so callers can pass a fresh array every render.
  const key = targets.map((target) => target?.getTime() ?? '').join()

  useEffect(() => {
    const times = key.split(',').filter(Boolean).map(Number)
    const last = Math.max(...times)
    let timeout: ReturnType<typeof setTimeout>
    const schedule = () => {
      const current = Date.now()
      const next = Math.min(...times.filter((time) => time > current))
      if (next === Infinity) return
      const delay = step ? (last - current) % step || step : next - current
      timeout = setTimeout(
        () => {
          setNow(Date.now())
          schedule()
        },
        Math.min(delay, next - current, MAX_TIMEOUT),
      )
    }
    schedule()
    return () => clearTimeout(timeout)
  }, [key, step])

  return now
}

/**
 * Time left until `deadline`, refreshed every second. Once the deadline
 * passes it stays at 0 and stops ticking. Returns `null` when there is no
 * deadline.
 */
export function useCountdown(deadline: Date | null): Countdown | null {
  const now = useClock([deadline], SECOND)
  return deadline ? countdownParts(deadline, now) : null
}

/**
 * Whether `deadline` has passed. Re-renders only when it passes, not every
 * second. An unannounced deadline never passes.
 */
export function useDeadlinePassed(deadline: Date | null): boolean {
  const now = useClock([deadline])
  return deadline !== null && now >= deadline.getTime()
}

/**
 * `upcomingDeadline()` kept current: switches to the next item when the
 * shown one passes while the page is open.
 */
export function useUpcomingDeadline<T extends { date: Date | null }>(
  items: readonly [T, ...T[]],
): T {
  const now = useClock(items.map((item) => item.date))
  return upcomingDeadline(items, now)
}

/**
 * Whether the submission deadline (the end of 投稿期間) has passed. Flips to
 * `true` on its own when the deadline passes while the page is open. An
 * unannounced deadline keeps submissions open.
 */
export function useSubmissionClosed(): boolean {
  return useDeadlinePassed(deadlines.submission)
}
