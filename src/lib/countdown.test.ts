import { describe, expect, it } from 'vitest'

import { countdownParts, upcomingDeadline } from './countdown'

const deadline = new Date('2026-11-29T23:59:00+08:00')
const at = (iso: string) => Date.parse(iso)

describe('countdownParts', () => {
  it('splits the time left into days, hours, minutes and seconds', () => {
    expect(countdownParts(deadline, at('2026-08-26T22:48:30+08:00'))).toEqual({
      days: 95,
      hours: 1,
      minutes: 10,
      seconds: 30,
      expired: false,
    })
  })

  it('rounds up to the second, reaching 0 only at the deadline', () => {
    expect(countdownParts(deadline, deadline.getTime() - 1)).toMatchObject({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
      expired: false,
    })
    expect(countdownParts(deadline, deadline.getTime()).expired).toBe(true)
  })

  it('stays at 0 after the deadline', () => {
    expect(countdownParts(deadline, deadline.getTime() + 60_000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      expired: true,
    })
  })
})

describe('upcomingDeadline', () => {
  const early = { id: 'early', date: deadline }
  const submission = {
    id: 'submission',
    date: new Date('2027-01-15T23:59:00+08:00'),
  }
  const items = [early, submission] as const

  it('picks the nearest deadline that has not passed', () => {
    expect(upcomingDeadline(items, at('2026-10-13T00:00:00+08:00'))).toBe(early)
    expect(upcomingDeadline(items, deadline.getTime())).toBe(submission)
  })

  it('stays on the last deadline once all have passed', () => {
    expect(upcomingDeadline(items, at('2027-02-01T00:00:00+08:00'))).toBe(
      submission,
    )
  })

  it('skips unannounced deadlines', () => {
    const unannounced: { id: string; date: Date | null } = {
      id: 'early',
      date: null,
    }
    expect(
      upcomingDeadline(
        [unannounced, submission],
        at('2026-10-13T00:00:00+08:00'),
      ),
    ).toBe(submission)
    const none = { id: 'submission', date: null }
    expect(upcomingDeadline([unannounced, none], 0)).toBe(none)
  })
})
