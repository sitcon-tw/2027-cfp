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
  summary: string
  /** Optional longer explanation, shown in the schedule dialog. */
  description?: string
  start: string | null
  end: string | null
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

/** Long date as in the CFP copy, e.g. 2026 年 11 月 29 日（日）23:59. */
export function formatLongDate(date: Date) {
  const labels = content.schedule
  const day = labels.date
    .replace('{year}', String(date.getFullYear()))
    .replace('{month}', String(date.getMonth() + 1))
    .replace('{day}', String(date.getDate()))
    .replace('{weekday}', labels.weekdays[date.getDay()])
  const hasTime = date.getHours() !== 0 || date.getMinutes() !== 0
  return hasTime
    ? labels.dateTime
        .replace('{date}', day)
        .replace('{time}', `${pad(date.getHours())}:${pad(date.getMinutes())}`)
    : day
}

/**
 * One row of a session page's 重要時程, as written in `content.json`. Its
 * date is the `at` end (`start` / `end`) of a homepage speaker-schedule item
 * picked by id with `from`, so the two never drift; or its own ISO `date`;
 * or, for an approximate period (2027 年一月下旬), a display `label`.
 */
export interface Milestone {
  event: string
  from?: string
  at?: string
  date?: string
  label?: string
}

/** The date column of a 重要時程 row. */
export function formatMilestoneDate({ from, at, date, label }: Milestone) {
  if (label) return label
  let value = date
  if (from) {
    const item = content.speaker_section.schedule.find(
      (item) => item.id === from,
    )
    if (!item || (at !== 'start' && at !== 'end')) {
      throw new Error(`Unknown speaker schedule date: ${from} ${at}`)
    }
    value = item[at] ?? undefined
  }
  return value ? formatLongDate(new Date(value)) : content.schedule.unannounced
}
