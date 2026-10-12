import type { SessionTypeId } from '@/lib/session-type-ids'

import { base64url, fromBase64, utf8 } from './encoding'

/**
 * Verification and edit links carry stateless tokens: a payload and its
 * HMAC-SHA256 under `TOKEN_SECRET`, so the sheet stores no secrets.
 *
 * - verify: `v1.<id>.<version>.<expires, unix seconds>.<signature>`
 * - edit: `e1.<id>.<signature>`, valid as long as edits are open
 */

const hmacKeys = new Map<string, Promise<CryptoKey>>()

function hmacKey(secret: string) {
  let key = hmacKeys.get(secret)
  if (!key) {
    key = crypto.subtle.importKey(
      'raw',
      utf8(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify'],
    )
    hmacKeys.set(secret, key)
  }
  return key
}

async function sign(secret: string, payload: string) {
  const signature = await crypto.subtle.sign(
    'HMAC',
    await hmacKey(secret),
    utf8(payload),
  )
  return `${payload}.${base64url(new Uint8Array(signature))}`
}

/** The payload's parts if the signature matches (compared in constant time). */
async function open(secret: string, token: string): Promise<string[] | null> {
  const dot = token.lastIndexOf('.')
  if (dot < 0) return null
  const payload = token.slice(0, dot)
  const signature = fromBase64(token.slice(dot + 1))
  if (!signature) return null
  const valid = await crypto.subtle.verify(
    'HMAC',
    await hmacKey(secret),
    signature,
    utf8(payload),
  )
  return valid ? payload.split('.') : null
}

// Crockford base32: no I, L, O or U, so IDs read back unambiguously.
const idAlphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
// The letters predate the ids (一般 / 開放) and stay, so 投稿編號 and
// tokens already issued keep resolving.
const idPrefixes: Record<SessionTypeId, string> = {
  normal: 'G',
  undefined: 'O',
  demo: 'D',
}
const idPattern = /^([GOD])-[0-9A-HJKMNP-TV-Z]{8}$/

/** 投稿編號: the type's letter and 8 random characters, e.g. `G-7K3M9Q2X`. */
export function newSubmissionId(type: SessionTypeId): string {
  // 256 is a multiple of 32, so `% 32` picks every character equally often.
  const random = crypto.getRandomValues(new Uint8Array(8))
  const suffix = Array.from(random, (byte) => idAlphabet[byte % 32]).join('')
  return `${idPrefixes[type]}-${suffix}`
}

export function submissionType(id: string): SessionTypeId | null {
  const prefix = idPattern.exec(id)?.[1]
  const entry = Object.entries(idPrefixes).find(([, value]) => value === prefix)
  return entry ? (entry[0] as SessionTypeId) : null
}

export function createVerifyToken(
  secret: string,
  id: string,
  version: number,
  expiresAt: number,
) {
  return sign(secret, `v1.${id}.${version}.${Math.floor(expiresAt / 1000)}`)
}

export type VerifyToken =
  | { status: 'ok'; id: string; version: number }
  | { status: 'invalid' | 'expired' }

export async function readVerifyToken(
  secret: string,
  token: string,
  now: number,
): Promise<VerifyToken> {
  const parts = await open(secret, token)
  if (parts?.length !== 4 || parts[0] !== 'v1') return { status: 'invalid' }
  const [, id, version, expires] = parts
  if (!submissionType(id) || !/^\d+$/.test(version) || !/^\d+$/.test(expires))
    return { status: 'invalid' }
  if (now >= Number(expires) * 1000) return { status: 'expired' }
  return { status: 'ok', id, version: Number(version) }
}

export function createEditToken(secret: string, id: string) {
  return sign(secret, `e1.${id}`)
}

/** The submission an edit token opens, or `null`. */
export async function readEditToken(
  secret: string,
  token: string,
): Promise<string | null> {
  const parts = await open(secret, token)
  if (parts?.length !== 2 || parts[0] !== 'e1') return null
  return submissionType(parts[1]) ? parts[1] : null
}
