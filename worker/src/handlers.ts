import { deadlines, isSubmissionClosed } from '@/lib/deadlines'
import { isSessionTypeId, type SessionTypeId } from '@/lib/session-type-ids'
import {
  fromSheetRow,
  getContactEmail,
  getSheetMetaColumn,
  getSheetStatusLabel,
  normalizeValues,
  toSheetRow,
  validateSubmission,
  type SheetStatus,
  type SubmissionValues,
} from '@/lib/submission'
import {
  verifyTokenHours,
  type ApiError,
  type EditDraft,
  type SubmitPending,
  type SubmitUpdated,
  type VerifyResponse,
} from '@/lib/submission-api'

import { copyEmail, verificationEmail } from './emails'
import type { EmailMessage } from './gmail'
import type { Cell } from './sheets'
import type { RowRef, SubmissionStore } from './store'
import { displayDateTime, sheetTimestamp } from './time'
import {
  createEditToken,
  createVerifyToken,
  newSubmissionId,
  readEditToken,
  readVerifyToken,
  submissionType,
} from './tokens'

/** A failure the client is told about, as `ApiError`. */
export class HttpError extends Error {
  readonly status: number
  readonly body: ApiError

  constructor(status: number, body: ApiError) {
    super(body.error)
    this.status = status
    this.body = body
  }
}

export type MailQuota = 'ok' | 'rate-limited' | 'mail-limit'

/** What the handlers need from the outside, so tests can stand in for it. */
export interface Deps {
  store(type: SessionTypeId): Promise<SubmissionStore>
  send(message: EmailMessage): Promise<void>
  /** Counts a verification email to `address`, if it is within the limits. */
  mailQuota(address: string): Promise<MailQuota>
  /** Whether a Turnstile token from the form is valid (and spends it). */
  isHuman(token: unknown): Promise<boolean>
  secret: string
  /** The CFP site, with a trailing slash. */
  siteUrl: string
  now: number
}

/*
 * Every send appends a row; rows are never rewritten except for 狀態 and
 * 驗證時間. A submission (投稿編號) is the set of its versions (版本), and its
 * current version is the latest 已驗證 one; older verified versions are
 * marked 已取代.
 */

function assertOpen(deps: Deps) {
  if (isSubmissionClosed(deps.now)) {
    throw new HttpError(403, { error: 'closed' })
  }
}

/**
 * Every send that can email a verification link must come from the form:
 * otherwise a script could mail anyone's address from our domain.
 */
async function assertHuman(deps: Deps, token: unknown) {
  if (!(await deps.isHuman(token))) {
    throw new HttpError(403, { error: 'captcha' })
  }
}

function parseValues(type: SessionTypeId, input: unknown): SubmissionValues {
  const values = normalizeValues(type, input)
  const errors = validateSubmission(type, values)
  if (Object.keys(errors).length) {
    throw new HttpError(422, { error: 'invalid', errors })
  }
  return values
}

function rowCells(
  type: SessionTypeId,
  values: SubmissionValues,
  meta: {
    id: string
    version: number
    status: SheetStatus
    submittedAt: string
    verifiedAt?: string
  },
): Record<string, Cell> {
  return {
    ...toSheetRow(type, values).cells,
    [getSheetMetaColumn('id')]: meta.id,
    [getSheetMetaColumn('version')]: meta.version,
    [getSheetMetaColumn('status')]: getSheetStatusLabel(meta.status),
    [getSheetMetaColumn('submittedAt')]: meta.submittedAt,
    [getSheetMetaColumn('verifiedAt')]: meta.verifiedAt ?? '',
  }
}

function latestVerified(rows: RowRef[]) {
  return rows
    .filter((row) => row.status === 'verified')
    .reduce<RowRef | null>(
      (latest, row) => (!latest || row.version > latest.version ? row : latest),
      null,
    )
}

const sameAddress = (a: string, b: string) =>
  a.toLowerCase() === b.toLowerCase()

/** Takes one verification email from `email`'s quota, before anything is saved. */
async function reserveVerification(deps: Deps, email: string) {
  const quota = await deps.mailQuota(email.toLowerCase())
  if (quota !== 'ok') throw new HttpError(429, { error: quota })
}

async function sendVerification(
  deps: Deps,
  { id, version, email }: { id: string; version: number; email: string },
) {
  const token = await createVerifyToken(
    deps.secret,
    id,
    version,
    deps.now + verifyTokenHours * 60 * 60 * 1000,
  )
  const link = new URL('submit/verify', deps.siteUrl)
  link.searchParams.set('token', token)
  await deps.send(verificationEmail(email, link.href))
}

async function sendCopy(
  deps: Deps,
  {
    type,
    id,
    values,
  }: { type: SessionTypeId; id: string; values: SubmissionValues },
) {
  const link = new URL(`submit/${type}`, deps.siteUrl)
  link.searchParams.set('edit', await createEditToken(deps.secret, id))
  await deps.send(
    copyEmail({
      to: getContactEmail(type, values),
      type,
      id,
      values,
      link: link.href,
      deadline: deadlines.submission
        ? displayDateTime(deadlines.submission)
        : '',
    }),
  )
}

/** `POST /submissions`: saves version 1 unverified and emails the link. */
export async function createSubmission(
  body: unknown,
  deps: Deps,
): Promise<SubmitPending> {
  assertOpen(deps)
  const input = (body ?? {}) as {
    type?: unknown
    values?: unknown
    turnstileToken?: unknown
  }
  if (!isSessionTypeId(input.type)) {
    throw new HttpError(400, { error: 'bad-request' })
  }
  const type = input.type
  const values = parseValues(type, input.values)
  await assertHuman(deps, input.turnstileToken)
  const email = getContactEmail(type, values)
  await reserveVerification(deps, email)

  const store = await deps.store(type)
  const id = newSubmissionId(type)
  await store.append(
    rowCells(type, values, {
      id,
      version: 1,
      status: 'unverified',
      submittedAt: sheetTimestamp(new Date(deps.now)),
    }),
  )
  await sendVerification(deps, { id, version: 1, email })
  return { status: 'pending', email }
}

/**
 * `POST /verify`: marks the version verified, supersedes the older ones and
 * emails the copy with its edit link. Verifying again changes nothing.
 * Verification stays possible after the deadline, for submissions sent
 * before it.
 */
export async function verify(
  body: unknown,
  deps: Deps,
): Promise<VerifyResponse> {
  const token = (body as { token?: unknown } | null)?.token
  if (typeof token !== 'string') {
    throw new HttpError(400, { error: 'bad-request' })
  }
  const parsed = await readVerifyToken(deps.secret, token, deps.now)
  if (parsed.status === 'expired')
    throw new HttpError(410, { error: 'expired' })
  const type = parsed.status === 'ok' ? submissionType(parsed.id) : null
  if (parsed.status !== 'ok' || !type) {
    throw new HttpError(400, { error: 'invalid-token' })
  }
  const { id, version } = parsed

  const store = await deps.store(type)
  const rows = (await store.index()).filter((row) => row.id === id)
  const target = rows.find((row) => row.version === version)
  if (!target) throw new HttpError(404, { error: 'not-found' })
  const result: VerifyResponse = { status: 'verified', type, id }
  if (target.status !== 'unverified') return result

  const verifiedAt = sheetTimestamp(new Date(deps.now))
  const current = latestVerified(rows)
  if (current && current.version > version) {
    // An older link, opened after a newer version was verified: keep it as
    // history rather than letting it replace the newer one.
    await store.setStatus([
      { row: target.row, status: 'superseded', verifiedAt },
    ])
    return result
  }

  await store.setStatus([
    { row: target.row, status: 'verified', verifiedAt },
    ...rows
      .filter((row) => row.status === 'verified')
      .map((row) => ({ row: row.row, status: 'superseded' as const })),
  ])
  const values = fromSheetRow(type, await store.read(target.row))
  await sendCopy(deps, { type, id, values })
  return result
}

async function openEdit(authorization: string | null, deps: Deps) {
  const token = /^Bearer (\S+)$/.exec(authorization ?? '')?.[1]
  const id = token ? await readEditToken(deps.secret, token) : null
  const type = id && submissionType(id)
  if (!id || !type) throw new HttpError(401, { error: 'invalid-token' })
  assertOpen(deps)

  const store = await deps.store(type)
  const rows = (await store.index()).filter((row) => row.id === id)
  const current = latestVerified(rows)
  if (!current) throw new HttpError(404, { error: 'not-found' })
  const values = fromSheetRow(type, await store.read(current.row))
  return { id, type, store, rows, values }
}

/** `GET /edit`: the current version, to prefill the form. */
export async function loadEdit(
  authorization: string | null,
  deps: Deps,
): Promise<EditDraft> {
  const { id, type, values } = await openEdit(authorization, deps)
  return { id, type, values }
}

/**
 * `PUT /edit`: appends the next version. From the verified address it is
 * verified at once (the edit link already proves the mailbox); a new address
 * has to be verified first, and until then the previous version stays
 * current.
 */
export async function saveEdit(
  authorization: string | null,
  body: unknown,
  deps: Deps,
): Promise<SubmitPending | SubmitUpdated> {
  const edit = await openEdit(authorization, deps)
  const { id, type, store, rows } = edit
  const input = (body ?? {}) as { values?: unknown; turnstileToken?: unknown }
  const values = parseValues(type, input.values)
  await assertHuman(deps, input.turnstileToken)
  const email = getContactEmail(type, values)
  const version = Math.max(...rows.map((row) => row.version)) + 1
  const now = sheetTimestamp(new Date(deps.now))

  if (!sameAddress(email, getContactEmail(type, edit.values))) {
    await reserveVerification(deps, email)
    await store.append(
      rowCells(type, values, {
        id,
        version,
        status: 'unverified',
        submittedAt: now,
      }),
    )
    await sendVerification(deps, { id, version, email })
    return { status: 'pending', email }
  }

  await store.append(
    rowCells(type, values, {
      id,
      version,
      status: 'verified',
      submittedAt: now,
      verifiedAt: now,
    }),
  )
  await store.setStatus(
    rows
      .filter((row) => row.status === 'verified')
      .map((row) => ({ row: row.row, status: 'superseded' as const })),
  )
  await sendCopy(deps, { type, id, values })
  return { status: 'updated', email }
}
