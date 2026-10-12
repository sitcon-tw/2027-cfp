import { describe, expect, it } from 'vitest'

import { mailQuota } from './abuse'

/** A KV namespace in memory that honours `expiration`. */
function memoryKv(clock: { now: number }) {
  const data = new Map<string, { value: string; expiration?: number }>()
  return {
    data,
    kv: {
      async get(key: string) {
        const entry = data.get(key)
        if (
          !entry ||
          (entry.expiration && entry.expiration * 1000 <= clock.now)
        )
          return null
        return JSON.parse(entry.value)
      },
      async put(key: string, value: string, options?: { expiration?: number }) {
        data.set(key, { value, expiration: options?.expiration })
      },
    } as unknown as KVNamespace,
  }
}

const unlimited = {
  limit: async () => ({ success: true }),
} as unknown as RateLimit

describe('mailQuota', () => {
  it('allows a few emails a day per address, then resets', async () => {
    const clock = { now: Date.parse('2026-11-01T00:00:00Z') }
    const { kv, data } = memoryKv(clock)
    const deps = { minute: unlimited, counts: kv }
    const quota = () => mailQuota(deps, 'a@example.com', 3, clock.now)

    expect([await quota(), await quota(), await quota()]).toEqual([
      'ok',
      'ok',
      'ok',
    ])
    clock.now += 23 * 60 * 60 * 1000
    expect(await quota()).toBe('mail-limit')
    expect(await mailQuota(deps, 'b@example.com', 3, clock.now)).toBe('ok')

    clock.now += 60 * 60 * 1000 + 1
    expect(await quota()).toBe('ok')
    // Keys are hashes: KV holds no addresses.
    expect([...data.keys()].join()).not.toContain('example.com')
  })

  it('applies the per-minute limit first', async () => {
    const { kv } = memoryKv({ now: 0 })
    const blocked = {
      limit: async () => ({ success: false }),
    } as unknown as RateLimit
    expect(
      await mailQuota({ minute: blocked, counts: kv }, 'a@example.com', 3, 0),
    ).toBe('rate-limited')
  })
})
