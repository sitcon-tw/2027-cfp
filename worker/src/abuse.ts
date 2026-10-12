import { utf8 } from './encoding'
import type { MailQuota } from './handlers'

const day = 24 * 60 * 60 * 1000

async function sha256Hex(text: string) {
  const digest = await crypto.subtle.digest('SHA-256', utf8(text))
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

/**
 * Verification emails to one address: a few a minute (a rate-limit binding,
 * exact within a location) and `dailyLimit` per 24 hours from the first
 * (a KV counter, keyed by a hash so KV holds no addresses). KV is eventually
 * consistent, so a burst can slip a little past the daily count; the minute
 * limit bounds that.
 */
export async function mailQuota(
  { minute, counts }: { minute: RateLimit; counts: KVNamespace },
  address: string,
  dailyLimit: number,
  now: number,
): Promise<MailQuota> {
  if (!(await minute.limit({ key: address })).success) return 'rate-limited'

  const key = `mail:${await sha256Hex(address)}`
  const stored = await counts.get<{ count: number; resetAt: number }>(
    key,
    'json',
  )
  const window =
    stored && stored.resetAt > now ? stored : { count: 0, resetAt: now + day }
  if (window.count >= dailyLimit) return 'mail-limit'

  await counts.put(
    key,
    JSON.stringify({ count: window.count + 1, resetAt: window.resetAt }),
    // KV wants at least 60 seconds.
    { expiration: Math.ceil(Math.max(window.resetAt, now + 61_000) / 1000) },
  )
  return 'ok'
}

const siteverify = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/** Checks (and spends) a Turnstile token with Cloudflare. */
export async function verifyTurnstile(
  secret: string,
  token: unknown,
  ip: string | null,
): Promise<boolean> {
  if (typeof token !== 'string' || !token || token.length > 2048) return false
  const form = new FormData()
  form.append('secret', secret)
  form.append('response', token)
  if (ip) form.append('remoteip', ip)
  const response = await fetch(siteverify, { method: 'POST', body: form })
  if (!response.ok)
    throw new Error(`Turnstile siteverify failed (${response.status})`)
  const result = await response.json<{ success: boolean }>()
  return result.success === true
}
