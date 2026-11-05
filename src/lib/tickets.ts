import content from '@/content.json'
import { scheduleStatus, type ScheduleItem } from '@/lib/schedule'

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

// A reminder is a short event at the moment the ticket opens.
const REMINDER_MINUTES = 30

function reminder(ticket: Ticket, at: Date) {
  const labels = content.attend_section.ticketDialog
  const url = `${content.metadata.url}?ticket=${ticket.id}`
  return {
    title: labels.reminderTitle.replace('{name}', ticket.name),
    details: labels.reminderDetails
      .replace('{name}', ticket.name)
      .replace('{url}', url),
    start: calendarTime(at),
    end: calendarTime(new Date(at.getTime() + REMINDER_MINUTES * 60_000)),
  }
}

/** A Google Calendar link that prefills the opening as a new event. */
export function googleCalendarUrl(ticket: Ticket, at: Date) {
  const event = reminder(ticket, at)
  return content.links.googleCalendarEvent
    .replace('{title}', encodeURIComponent(event.title))
    .replace('{dates}', `${event.start}/${event.end}`)
    .replace('{details}', encodeURIComponent(event.details))
}

/** Escapes text for an iCalendar property value (RFC 5545 §3.3.11). */
function icsText(text: string) {
  return text.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\n/g, '\\n')
}

/** The same event as a one-off `.ics` file, for Apple Calendar and others. */
export function icsDataUrl(ticket: Ticket, at: Date) {
  const event = reminder(ticket, at)
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SITCON//2027 CFP//ZH',
    'BEGIN:VEVENT',
    `UID:sitcon-2027-ticket-${ticket.id}@sitcon.org`,
    `DTSTAMP:${event.start}`,
    `DTSTART:${event.start}`,
    `DTEND:${event.end}`,
    `SUMMARY:${icsText(event.title)}`,
    `DESCRIPTION:${icsText(event.details)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n')
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
}
