import { base64url, fromBase64, utf8 } from './encoding'

export const sheetsScope = 'https://www.googleapis.com/auth/spreadsheets'
export const gmailSendScope = 'https://www.googleapis.com/auth/gmail.send'

export interface ServiceAccountKey {
  client_email: string
  private_key: string
  token_uri?: string
}

export class GoogleApiError extends Error {
  constructor(action: string, status: number, detail: string) {
    // Google's error bodies describe the request, not the submission, but
    // keep them short anyway.
    super(`Google ${action} failed (${status}): ${detail.slice(0, 300)}`)
  }
}

export function parseServiceAccountKey(json: string): ServiceAccountKey {
  let key: Partial<ServiceAccountKey>
  try {
    key = JSON.parse(json) as Partial<ServiceAccountKey>
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON')
  }
  if (!key.client_email || !key.private_key) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY is not a service account key')
  }
  return key as ServiceAccountKey
}

const signingKeys = new Map<string, Promise<CryptoKey>>()

function signingKey(pem: string) {
  let key = signingKeys.get(pem)
  if (!key) {
    const der = fromBase64(
      pem.replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '').replace(/\s+/g, ''),
    )
    if (!der) throw new Error('The service account private key is not PEM')
    key = crypto.subtle.importKey(
      'pkcs8',
      der,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    signingKeys.set(pem, key)
  }
  return key
}

/** An RS256 JWT signed with the service account's private key. */
export async function signJwt(
  key: ServiceAccountKey,
  claims: Record<string, unknown>,
): Promise<string> {
  const input = `${base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64url(JSON.stringify(claims))}`
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    await signingKey(key.private_key),
    utf8(input),
  )
  return `${input}.${base64url(new Uint8Array(signature))}`
}

const accessTokens = new Map<string, { token: string; expiresAt: number }>()

/**
 * An OAuth access token for `scope`, from the JWT bearer grant. With
 * `subject`, the service account acts as that Workspace user, which needs
 * domain-wide delegation of exactly this scope in the Admin console. Cached
 * per isolate until a minute before it expires.
 */
export async function getAccessToken(
  key: ServiceAccountKey,
  scope: string,
  subject?: string,
): Promise<string> {
  const cacheKey = `${key.client_email} ${scope} ${subject ?? ''}`
  const cached = accessTokens.get(cacheKey)
  if (cached && cached.expiresAt - 60_000 > Date.now()) return cached.token

  const audience = key.token_uri ?? 'https://oauth2.googleapis.com/token'
  const now = Math.floor(Date.now() / 1000)
  const assertion = await signJwt(key, {
    iss: key.client_email,
    scope,
    aud: audience,
    iat: now,
    exp: now + 3600,
    ...(subject ? { sub: subject } : {}),
  })
  const response = await fetch(audience, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  })
  if (!response.ok) {
    throw new GoogleApiError(
      `token for ${scope}${subject ? ` as ${subject}` : ''}`,
      response.status,
      await response.text(),
    )
  }
  const { access_token, expires_in } = await response.json<{
    access_token: string
    expires_in: number
  }>()
  accessTokens.set(cacheKey, {
    token: access_token,
    expiresAt: Date.now() + expires_in * 1000,
  })
  return access_token
}
