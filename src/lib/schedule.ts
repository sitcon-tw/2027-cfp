import content from '@/content.json'
import { pad } from '@/lib/utils'

/**
 * One row of a homepage schedule (ticketing or submission), as written in
 * `content.json`. `start` / `end` are ISO timestamps with a timezone, or
 * `null` until announced. Single moments (a deadline) set only one of them.
 */
export interface ScheduleItem {
  id: string
  name: string
  /** One plain-language line: who it is for or what happens. */
  summary?: string
  /** Optional longer explanation, shown in the schedule dialog. */
  description?: string
  start: string | null
  end: string | null
  /**
   * Shown instead of a date for an approximate period (2027 年一月下旬)
   * that has no `start` / `end`; such an item gets no status badge.
   */
  label?: string
}

export type ScheduleStatus = 'unannounced' | 'upcoming' | 'open' | 'closed'

export function scheduleStatus(
  { start, end }: ScheduleItem,
  now = Date.now(),
): ScheduleStatus {
  if (!start && !end) return 'unannounced'
  const from = start ? Date.parse(start) : null
  const to = end ? Date.parse(end) : null
  if (to !== null && now > to) return 'closed'
  if (from !== null && now < from) return 'upcoming'
  // A lone start that has passed is over; a lone end still ahead is open.
  if (to === null) return 'closed'
  return 'open'
}

export function formatDate(date: Date) {
  return `${date.getFullYear()} / ${pad(date.getMonth() + 1)} / ${pad(date.getDate())}`
}

/** Date, plus the time of day unless it is midnight. */
export function formatDateTime(date: Date) {
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0
  return hasTime
    ? `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`
    : formatDate(date)
}

/** "start — end", a single date, or the "to be announced" label. */
export function formatScheduleDate({ start, end }: ScheduleItem) {
  const labels = content.schedule
  if (start && end) {
    return labels.range
      .replace('{start}', formatDateTime(new Date(start)))
      .replace('{end}', formatDateTime(new Date(end)))
  }
  const only = start ?? end
  return only ? formatDateTime(new Date(only)) : labels.unannounced
}

/**
 * One row of a session page's 重要時程, as written in `content.json`. It
 * takes its dates from a homepage speaker-schedule item by id (`from`), so
 * the two never drift; `at` keeps only that item's `start` or `end`.
 * Otherwise it sets its own `start` / `end`, or a `label`.
 */
export interface Milestone {
  name: string
  from?: string
  at?: string
  start?: string | null
  end?: string | null
  label?: string
}

/** Resolves 重要時程 rows into timeline items. */
export function milestoneItems(rows: Milestone[]): ScheduleItem[] {
  return rows.map(({ name, from, at, label, ...dates }, i) => {
    let start = dates.start ?? null
    let end = dates.end ?? null
    if (from) {
      const item = content.speaker_section.schedule.find(
        (item) => item.id === from,
      )
      if (!item) throw new Error(`Unknown speaker schedule id: ${from}`)
      start = at === 'end' ? null : item.start
      end = at === 'start' ? null : item.end
    }
    return { id: String(i), name, start, end, label }
  })
}
