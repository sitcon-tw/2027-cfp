import { describe, expect, it } from 'vitest'

import content from '@/content.json'

import {
  googleCalendarUrl,
  icsDataUrl,
  ticketAction,
  ticketDateStates,
  tickets,
  type Ticket,
} from './tickets'

const at = (iso: string) => Date.parse(iso)

describe('ticket content', () => {
  it('links only to https pages', () => {
    for (const { details } of tickets) {
      for (const href of [details.apply, details.info]) {
        if (href) expect(href).toMatch(/^https:\/\//)
      }
    }
  })

  it('has dates that parse, in order', () => {
    for (const { details } of tickets) {
      const times = (details.dates ?? []).map(({ start, end }) => {
        const time = Date.parse((end ?? start)!)
        expect(time).not.toBeNaN()
        return time
      })
      expect(times).toEqual([...times].sort((a, b) => a - b))
    }
  })

  // SITCON has been free since 2012: tickets are claimed, never sold.
  it('never speaks of buying a ticket', () => {
    expect(JSON.stringify(content.attend_section)).not.toMatch(
      /購買|購票|買票|售票|票價/,
    )
  })
})

describe('ticketAction', () => {
  // Before, during and after every ticket's window, and after all of them.
  const moments = [
    '2026-05-01T00:00:00+08:00',
    '2026-11-06T12:00:00+08:00',
    '2027-01-10T12:00:00+08:00',
    '2027-01-31T12:00:00+08:00',
    '2027-03-01T12:00:00+08:00',
    '2027-04-01T12:00:00+08:00',
  ]

  it('always offers a next step', () => {
    for (const ticket of tickets) {
      for (const moment of moments) {
        expect(ticketAction(ticket, at(moment)), ticket.id).not.toBeNull()
      }
    }
  })

  const ticket = (overrides: Partial<Ticket>): Ticket => ({
    id: 'test',
    name: '測試票',
    summary: '',
    description: '',
    start: '2027-01-01T00:00:00+08:00',
    end: '2027-01-31T23:59:00+08:00',
    details: { apply: 'https://example.com/form', info: 'https://example.com' },
    ...overrides,
  })

  it('links to the form while open', () => {
    expect(
      ticketAction(ticket({}), at('2027-01-15T00:00:00+08:00'), []),
    ).toMatchObject({ kind: 'apply', href: 'https://example.com/form' })
  })

  it('offers a reminder before it opens', () => {
    expect(
      ticketAction(ticket({}), at('2026-12-01T00:00:00+08:00'), []),
    ).toEqual({ kind: 'remind', at: new Date('2027-01-01T00:00:00+08:00') })
  })

  it('points to an open ticket once closed, else to the rules', () => {
    const closed = ticket({})
    const open = ticket({ id: 'open', end: '2027-12-31T00:00:00+08:00' })
    const now = at('2027-02-15T00:00:00+08:00')
    expect(ticketAction(closed, now, [closed, open])).toEqual({
      kind: 'switch',
      ticket: open,
    })
    expect(ticketAction(closed, now, [closed])).toMatchObject({
      kind: 'info',
      href: 'https://example.com',
    })
  })

  it('falls back to the rules with no dates or no form yet', () => {
    const now = at('2027-01-15T00:00:00+08:00')
    expect(
      ticketAction(ticket({ start: null, end: null }), now, []),
    ).toMatchObject({ kind: 'info' })
    expect(
      ticketAction(
        ticket({ details: { info: 'https://example.com' } }),
        now,
        [],
      ),
    ).toMatchObject({ kind: 'info' })
  })
})

describe('ticketDateStates', () => {
  const dates = [
    { name: '開放', start: '2027-01-01T00:00:00+08:00' },
    {
      name: '第一波',
      start: '2027-01-10T00:00:00+08:00',
      end: '2027-01-20T00:00:00+08:00',
    },
    { name: '截止', end: '2027-02-01T00:00:00+08:00' },
    { name: '年會', end: '2027-03-13T00:00:00+08:00' },
  ]

  it('marks passed, ongoing, next and later dates', () => {
    expect(ticketDateStates(dates, at('2027-01-15T00:00:00+08:00'))).toEqual([
      'passed',
      'ongoing',
      'next',
      'later',
    ])
    expect(ticketDateStates(dates, at('2027-01-05T00:00:00+08:00'))).toEqual([
      'passed',
      'next',
      'later',
      'later',
    ])
  })
})

describe('reminders', () => {
  const general = tickets.find((ticket) => ticket.id === 'general')!
  const opens = new Date('2027-01-30T00:00:00+08:00')

  it('prefills a Google Calendar event at the opening', () => {
    const url = new URL(googleCalendarUrl(general, opens))
    expect(url.searchParams.get('dates')).toBe(
      '20270129T160000Z/20270129T163000Z',
    )
    expect(url.searchParams.get('text')).toContain(general.name)
  })

  it('builds a one-event .ics file', () => {
    const ics = decodeURIComponent(icsDataUrl(general, opens).split(',')[1])
    expect(ics).toContain('DTSTART:20270129T160000Z')
    expect(ics).toContain('\r\nEND:VCALENDAR')
  })
})
