import { describe, expect, it } from 'vitest'

import { sessionTypeIds } from '@/lib/session-type-ids'
import {
  fromSheetRow,
  getSheetColumns,
  getSubmissionFields,
  isEmailAddress,
  isFieldVisible,
  isLink,
  isPhoneNumber,
  normalizeValues,
  toSheetRow,
  validateSubmission,
} from '@/lib/submission'

import { columnLetter } from './sheets'
import { sameHeader } from './store'
import { validValues } from './test-utils'

describe('sheet rows', () => {
  it.each(sessionTypeIds)('round-trip every %s answer', (type) => {
    const values = validValues(type)
    const back = fromSheetRow(type, toSheetRow(type, values).cells)
    for (const field of getSubmissionFields(type)) {
      if (isFieldVisible(field, values)) {
        expect(back[field.key]).toEqual(values[field.key])
      }
    }
  })

  it.each(sessionTypeIds)('give %s unique column headers', (type) => {
    const columns = getSheetColumns(type)
    expect(new Set(columns).size).toBe(columns.length)
  })

  it('compare headers exactly, ignoring stray spaces', () => {
    expect(sameHeader([' a', 'b '], ['a', 'b'])).toBe(true)
    expect(sameHeader(['a'], ['a', 'b'])).toBe(false)
    expect(sameHeader(['b', 'a'], ['a', 'b'])).toBe(false)
  })

  it('name columns like Sheets does', () => {
    expect([0, 25, 26, 51, 52].map(columnLetter)).toEqual([
      'A',
      'Z',
      'AA',
      'AZ',
      'BA',
    ])
  })
})

describe('validation', () => {
  it.each(sessionTypeIds)('accepts a complete %s draft', (type) => {
    expect(validateSubmission(type, validValues(type))).toEqual({})
  })

  it('rejects addresses that would break an email header', () => {
    expect(isEmailAddress('speaker@example.com')).toBe(true)
    expect(isEmailAddress('a@example.com,b@example.com')).toBe(false)
    expect(isEmailAddress('<a@example.com>')).toBe(false)
    expect(isEmailAddress('a@localhost')).toBe(false)
  })

  it('accepts phone numbers with the usual separators', () => {
    for (const number of [
      '0912345678',
      '0912-345-678',
      '+886 912 345 678',
      '(02) 2345-6789 #123',
    ]) {
      expect(isPhoneNumber(number)).toBe(true)
    }
    for (const number of ['12345', 'not a number', '0912-345-678 or email']) {
      expect(isPhoneNumber(number)).toBe(false)
    }
  })

  it('accepts only absolute web links', () => {
    expect(isLink('https://drive.google.com/file/d/abc/view')).toBe(true)
    expect(isLink('http://example.com')).toBe(true)
    expect(isLink('drive.google.com/file/d/abc')).toBe(false)
    expect(isLink('javascript:alert(1)')).toBe(false)
    expect(isLink('https://localhost')).toBe(false)
    expect(isLink('https://example.com/a b')).toBe(false)
  })

  it('reports format errors of email, tel and url fields', () => {
    const errors = validateSubmission(
      'normal',
      validValues('normal', {
        contactEmail: 'speaker@',
        phone: 'call me',
        photo: 'my photo',
      }),
    )
    expect(Object.keys(errors).sort()).toEqual(
      ['contactEmail', 'phone', 'photo'].sort(),
    )
  })

  it('rejects text longer than a sheet cell holds', () => {
    const errors = validateSubmission(
      'normal',
      validValues('normal', { bio: 'x'.repeat(50_001) }),
    )
    expect(Object.keys(errors)).toEqual(['bio'])
  })

  it('normalizes request bodies to the form fields', () => {
    const values = normalizeValues('demo', {
      title: 'Demo',
      unknown: 'dropped',
      abstract: 42,
    })
    expect(values.title).toBe('Demo')
    expect(values.abstract).toBe('')
    expect('unknown' in values).toBe(false)
  })
})
