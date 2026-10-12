import { describe, expect, it } from 'vitest'

import { sessionTypeIds } from '@/lib/session-type-ids'
import {
  fromSheetRow,
  getSheetColumns,
  getSubmissionFields,
  isEmailAddress,
  isFieldVisible,
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

  it('rejects text longer than a sheet cell holds', () => {
    const errors = validateSubmission(
      'general',
      validValues('general', { bio: 'x'.repeat(50_001) }),
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
