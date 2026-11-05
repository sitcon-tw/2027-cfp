import content from '@/content.json'
import {
  formatScheduleDate,
  scheduleStatus,
  type ScheduleItem,
} from '@/lib/schedule'

/** The dialog sections, in the order they are shown. */
export const ticketSections = [
  'eligibility',
  'benefits',
  'tiers',
  'steps',
  'dates',
  'documents',
  'notes',
  'faq',
] as const

export type TicketSection = (typeof ticketSections)[number]

/** One row of 重要日期: a single moment (`start` or `end`) or a range. */
export interface TicketDate {
  name: string
  start?: string | null
  end?: string | null
}

/** A labelled variant (遠道而來票's regions); unlabelled when there is one. */
interface TicketGroup<T> {
  label?: string
  items: T[]
}

/**
 * Everything a ticket's dialog shows, from `content.attend_section.tickets`.
 * Every section is optional; the dialog shows the ones a ticket has.
 */
export interface TicketDetails {
  /** The application or donation form, linked while the ticket is open. */
  apply?: string
  applyLabel?: string
  /** The full rules (HackMD), or another page to learn more. */
  info?: string
  /** Replaces the default 完整辦法 label for `info`. */
  infoLabel?: string
  /** Per-ticket section titles, e.g. 怎麼贊助 instead of 申請流程. */
  titles?: Partial<Record<TicketSection, string>>
  eligibility?: {
    lead?: string
    groups: TicketGroup<{ title: string; text: string }>[]
  }
  benefits?: { icon: string; title: string; text: string }[]
  tiers?: { amount: string; rewards: string; ticket?: string }[]
  tiersNote?: string
  steps?: { title: string; text: string }[]
  dates?: TicketDate[]
  documents?: { groups: TicketGroup<string>[] }
  notes?: string[]
  faq?: { question: string; answer: string }[]
}

export interface Ticket extends ScheduleItem {
  summary: string
  description: string
  details: TicketDetails
}

export const tickets: Ticket[] = content.attend_section.tickets

export function findTicket(id: string): Ticket | undefined {
  return tickets.find((ticket) => ticket.id === id)
}

/**
 * The dialog's main call to action. Every ticket always has one, so a click
 * never ends at a disabled button:
 *
 * - `apply`: open, with a form to go to.
 * - `remind`: not open yet; add its opening to a calendar.
 * - `switch`: closed; look at a ticket that is still open instead.
 * - `info`: anything else (no dates yet, no form yet, every ticket closed);
 *   the full rules or the page that will have them, else the form.
 */
export type TicketAction =
  | { kind: 'apply'; href: string; label: string }
  | { kind: 'remind'; at: Date }
  | { kind: 'switch'; ticket: Ticket }
  | { kind: 'info'; href: string; label: string }

export function ticketAction(
  ticket: Ticket,
  now = Date.now(),
  all: Ticket[] = tickets,
): TicketAction | null {
  const status = scheduleStatus(ticket, now)
  const { apply, applyLabel, info } = ticket.details
  if (status === 'open' && apply) {
    return {
      kind: 'apply',
      href: apply,
      label: applyLabel ?? content.attend_section.ticketDialog.apply,
    }
  }
  if (status === 'upcoming' && ticket.start) {
    return { kind: 'remind', at: new Date(ticket.start) }
  }
  if (status === 'closed') {
    const open = all.find(
      (other) =>
        other.id !== ticket.id && scheduleStatus(other, now) === 'open',
    )
    if (open) return { kind: 'switch', ticket: open }
  }
  if (info) return { kind: 'info', href: info, label: infoLabel(ticket) }
  // No rules page: the form itself, which still works (a donation page
  // takes donations after its rewards close).
  if (apply) {
    return {
      kind: 'info',
      href: apply,
      label: applyLabel ?? content.attend_section.ticketDialog.apply,
    }
  }
  return null
}

export function infoLabel(ticket: Ticket) {
  return ticket.details.infoLabel ?? content.attend_section.ticketDialog.info
}

/**
 * Where each 重要日期 row stands: `passed`, `ongoing` (a range that has
 * started), `next` (the first one still ahead) or `later`.
 */
export type TicketDateState = 'passed' | 'ongoing' | 'next' | 'later'

export function ticketDateStates(
  dates: TicketDate[],
  now = Date.now(),
): TicketDateState[] {
  const time = (iso?: string | null) => (iso ? Date.parse(iso) : null)
  let next = true
  return dates.map(({ start, end }) => {
    const from = time(start)
    const to = time(end) ?? from
    if (to !== null && to < now) return 'passed'
    if (from !== null && from <= now) return 'ongoing'
    if (next) {
      next = false
      return 'next'
    }
    return 'later'
  })
}

/** `20270130T120000Z`, the UTC form calendars take. */
function calendarTime(date: Date) {
  return date.toISOString().replace(/[-:]|\.\d{3}/g, '')
}

/** `20270130`: the day a moment falls on in Taiwan, for all-day events. */
function calendarDay(iso: string) {
  return new Date(iso)
    .toLocaleDateString('sv', { timeZone: 'Asia/Taipei' })
    .replaceAll('-', '')
}

function nextDay(day: string) {
  const date = new Date(
    Date.UTC(+day.slice(0, 4), +day.slice(4, 6) - 1, +day.slice(6) + 1),
  )
  return date.toISOString().slice(0, 10).replaceAll('-', '')
}

/** Escapes text for an iCalendar property value (RFC 5545 §3.3.11). */
function icsText(text: string) {
  return text.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\n/g, '\\n')
}

interface CalendarEvent {
  /** The tickets that list it; none for a date every ticket shares. */
  tickets: Ticket[]
  name: string
  at: string
  /** The row it comes from, for the exact date or range in the details. */
  date: TicketDate
}

/**
 * Every ticket's dates as one-day events: its opening (unless a 重要日期
 * row already starts then), then each 重要日期 row, a range as its start
 * and its end. A row that several tickets list on the same date is one
 * event naming them all, or none when every ticket lists it (SITCON 2027
 * 年會).
 */
function calendarEvents(all: Ticket[]): CalendarEvent[] {
  const labels = content.attend_section.calendar
  const events = new Map<string, CalendarEvent>()
  const add = (ticket: Ticket, name: string, at: string, date: TicketDate) => {
    const key = `${name}|${Date.parse(at)}`
    const event = events.get(key)
    if (event) event.tickets.push(ticket)
    else events.set(key, { tickets: [ticket], name, at, date })
  }
  const dated = all.filter((ticket) => {
    const dates = ticket.details.dates ?? []
    if (ticket.start && !dates.some((date) => date.start === ticket.start)) {
      add(ticket, labels.opens, ticket.start, {
        name: labels.opens,
        start: ticket.start,
      })
    }
    for (const date of dates) {
      if (date.start && date.end) {
        const name = (template: string) => template.replace('{name}', date.name)
        add(ticket, name(labels.rangeStart), date.start, date)
        add(ticket, name(labels.rangeEnd), date.end, date)
      } else {
        const at = date.start ?? date.end
        if (at) add(ticket, date.name, at, date)
      }
    }
    return ticket.start || dates.length > 0
  })
  return [...events.values()]
    .map((event) =>
      event.tickets.length === dated.length && dated.length > 1
        ? { ...event, tickets: [] }
        : event,
    )
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
}

/**
 * 索票重要時程: every ticket's dates in one `.ics` calendar, published next
 * to the site (`content.links.ticketCalendarFile`) by the build. Every
 * 加入行事曆 for attendees subscribes to it, so it stays in step with
 * `content.attend_section.tickets`.
 */
export function ticketCalendar(now = new Date(), all: Ticket[] = tickets) {
  const labels = content.attend_section.calendar
  const stamp = calendarTime(now)
  const days = new Map<string, number>()
  const events = calendarEvents(all).flatMap((event) => {
    const day = calendarDay(event.at)
    const [ticket] = event.tickets
    const id = `${ticket?.id ?? 'sitcon'}-${day}`
    const index = days.get(id) ?? 0
    days.set(id, index + 1)
    const title = ticket
      ? labels.title.replace(
          '{name}',
          labels.ticketEvent
            .replace(
              '{ticket}',
              event.tickets.map(({ name }) => name).join(labels.separator),
            )
            .replace('{name}', event.name),
        )
      : event.name
    const url = ticket
      ? `${content.metadata.url}?ticket=${ticket.id}`
      : content.metadata.url
    const details = labels.details
      .replace(
        '{date}',
        formatScheduleDate({
          id: event.date.name,
          name: event.date.name,
          start: event.date.start ?? null,
          end: event.date.end ?? null,
        }),
      )
      .replace('{url}', url)
    return [
      'BEGIN:VEVENT',
      `UID:sitcon-2027-ticket-${id}-${index}@sitcon.org`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day}`,
      `DTEND;VALUE=DATE:${nextDay(day)}`,
      `SUMMARY:${icsText(title)}`,
      `DESCRIPTION:${icsText(details)}`,
      `URL:${url}`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${icsText(title)}`,
      'TRIGGER:-P1D',
      'END:VALARM',
      'END:VEVENT',
    ]
  })
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SITCON//2027 CFP//ZH',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${icsText(labels.name)}`,
    `NAME:${icsText(labels.name)}`,
    'X-WR-TIMEZONE:Asia/Taipei',
    ...events,
    'END:VCALENDAR',
    '',
  ].join('\r\n')
}
