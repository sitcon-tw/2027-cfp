import { describe, expect, it } from 'vitest'

import {
  createEditToken,
  createVerifyToken,
  newSubmissionId,
  readEditToken,
  readVerifyToken,
  submissionType,
} from './tokens'

const secret = 'test-secret'
const now = Date.parse('2026-11-01T00:00:00Z')

describe('submission IDs', () => {
  it('carry their session type', () => {
    for (const type of ['general', 'open', 'demo'] as const) {
      const id = newSubmissionId(type)
      expect(id).toMatch(/^[GOD]-[0-9A-HJKMNP-TV-Z]{8}$/)
      expect(submissionType(id)).toBe(type)
    }
    expect(submissionType('X-12345678')).toBeNull()
    expect(submissionType('G-1234567I')).toBeNull()
  })
})

describe('verify tokens', () => {
  it('round-trip until they expire', async () => {
    const token = await createVerifyToken(secret, 'G-7K3M9Q2X', 3, now + 1000)
    expect(await readVerifyToken(secret, token, now)).toEqual({
      status: 'ok',
      id: 'G-7K3M9Q2X',
      version: 3,
    })
    expect(await readVerifyToken(secret, token, now + 1000)).toEqual({
      status: 'expired',
    })
  })

  it('reject tampering and other secrets', async () => {
    const token = await createVerifyToken(secret, 'G-7K3M9Q2X', 1, now + 1000)
    const tampered = token.replace('.1.', '.2.')
    expect(await readVerifyToken(secret, tampered, now)).toEqual({
      status: 'invalid',
    })
    expect(await readVerifyToken('other', token, now)).toEqual({
      status: 'invalid',
    })
    expect(await readVerifyToken(secret, 'garbage', now)).toEqual({
      status: 'invalid',
    })
  })

  it('are not edit tokens, and the other way round', async () => {
    const verify = await createVerifyToken(secret, 'G-7K3M9Q2X', 1, now + 1000)
    const edit = await createEditToken(secret, 'G-7K3M9Q2X')
    expect(await readEditToken(secret, verify)).toBeNull()
    expect(await readVerifyToken(secret, edit, now)).toEqual({
      status: 'invalid',
    })
    expect(await readEditToken(secret, edit)).toBe('G-7K3M9Q2X')
  })
})
