import content from '@/content.json'

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

/** The first item that is open or still ahead, for teasers. */
export function nextScheduleItem(items: ScheduleItem[], now = Date.now()) {
  return items.find((item) => {
    const status = scheduleStatus(item, now)
    return status === 'open' || status === 'upcoming'
  })
}

const pad = (n: number) => String(n).padStart(2, '0')

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
