import content from '@/content.json'
import type { ApiError } from '@/lib/submission-api'

import { mailQuota, verifyTurnstile } from './abuse'
import type { Env } from './env'
import { buildMime, sendGmail } from './gmail'
import {
  getAccessToken,
  gmailSendScope,
  parseServiceAccountKey,
  sheetsScope,
} from './google-auth'
import {
  createSubmission,
  HttpError,
  loadEdit,
  saveEdit,
  verify,
  type Deps,
} from './handlers'
import { Sheets } from './sheets'
import { SheetSubmissionStore } from './store'

/** Comfortably above the largest form, far below anything abusive. */
const maxBodyBytes = 512 * 1024

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin')
  const allowed = env.ALLOWED_ORIGINS.split(',').map((value) => value.trim())
  return {
    Vary: 'Origin',
    ...(origin && allowed.includes(origin)
      ? {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        }
      : {}),
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

async function readJson(request: Request): Promise<unknown> {
  const text = await request.text()
  if (text.length > maxBodyBytes) {
    throw new HttpError(413, { error: 'bad-request' })
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new HttpError(400, { error: 'bad-request' })
  }
}

function createDeps(env: Env, ip: string | null): Deps {
  for (const name of [
    'SHEET_ID',
    'GOOGLE_SERVICE_ACCOUNT_KEY',
    'TOKEN_SECRET',
    'TURNSTILE_SECRET',
  ] as const) {
    if (!env[name]) throw new Error(`${name} is not set`)
  }
  const key = parseServiceAccountKey(env.GOOGLE_SERVICE_ACCOUNT_KEY)
  return {
    async store(type) {
      // Sheets access is the service account's own: the sheet is shared
      // with its address, no delegation involved.
      const token = await getAccessToken(key, sheetsScope)
      const store = new SheetSubmissionStore(
        new Sheets(token, env.SHEET_ID),
        type,
      )
      await store.prepare()
      return store
    },
    async send(message) {
      // Mail is sent as MAIL_SENDER through domain-wide delegation, which
      // must grant exactly the gmail.send scope.
      const token = await getAccessToken(key, gmailSendScope, env.MAIL_SENDER)
      const mime = buildMime(
        {
          from: {
            name: content.submission_email.senderName,
            address: env.MAIL_SENDER,
          },
          replyTo: env.MAIL_REPLY_TO,
        },
        message,
      )
      await sendGmail(token, mime)
    },
    mailQuota: (address) =>
      mailQuota(
        { minute: env.MAIL_LIMITER, counts: env.MAIL_COUNTS },
        address,
        Number(env.MAIL_DAILY_LIMIT) || 3,
        Date.now(),
      ),
    isHuman: (token) => verifyTurnstile(env.TURNSTILE_SECRET, token, ip),
    secret: env.TOKEN_SECRET,
    siteUrl: env.SITE_URL,
    now: Date.now(),
  }
}

async function route(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url)
  const endpoint = `${request.method} ${pathname}`
  const known = ['POST /submissions', 'POST /verify', 'GET /edit', 'PUT /edit']
  if (!known.includes(endpoint)) {
    throw new HttpError(404, { error: 'not-found' })
  }

  const ip = request.headers.get('CF-Connecting-IP')
  const limiters = [env.REQUEST_LIMITER]
  // Only these can send a verification email.
  if (endpoint === 'POST /submissions' || endpoint === 'PUT /edit') {
    limiters.push(env.SUBMIT_LIMITER)
  }
  for (const limiter of limiters) {
    if (!(await limiter.limit({ key: ip ?? 'unknown' })).success) {
      throw new HttpError(429, { error: 'rate-limited' })
    }
  }

  const deps = createDeps(env, ip)
  const authorization = request.headers.get('Authorization')
  switch (endpoint) {
    case 'POST /submissions':
      return json(await createSubmission(await readJson(request), deps), 202)
    case 'POST /verify':
      return json(await verify(await readJson(request), deps))
    case 'GET /edit':
      return json(await loadEdit(authorization, deps))
    default:
      return json(await saveEdit(authorization, await readJson(request), deps))
  }
}

/**
 * The SITCON 2027 CFP submission API. The site (GitHub Pages) calls it
 * cross-origin; submissions go to a Google Sheet and mail goes out through
 * Gmail. See `src/lib/submission-api.ts` for the contract.
 */
export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env)
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    let response: Response
    try {
      response = await route(request, env)
    } catch (error) {
      if (error instanceof HttpError) {
        response = json(error.body, error.status)
      } else {
        // Only the message: never the request, which holds personal data.
        console.error(error instanceof Error ? error.message : 'Unknown error')
        response = json({ error: 'server' } satisfies ApiError, 500)
      }
    }
    for (const [name, value] of Object.entries(cors)) {
      response.headers.set(name, value)
    }
    return response
  },
} satisfies ExportedHandler<Env>
