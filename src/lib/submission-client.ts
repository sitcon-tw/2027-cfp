import content from '@/content.json'
import {
  isSessionTypeId,
  previousSessionTypeIds,
  sessionTypeIds,
  type SessionTypeId,
} from '@/lib/session-type-ids'
import {
  createEmptyValues,
  getSubmissionFields,
  isSharedField,
  validateField,
  validateSubmission,
  type SubmissionErrors,
  type SubmissionValue,
  type SubmissionValues,
} from '@/lib/submission'
import type {
  ApiError,
  EditDraft,
  SubmitPending,
  SubmitUpdated,
  VerifyResponse,
} from '@/lib/submission-api'

/**
 * The submission API's base URL (`worker/`), set at build time. Without it
 * the form runs a labelled mock that sends nothing.
 */
const apiBase = import.meta.env.VITE_SUBMISSION_API?.replace(/\/+$/, '')

export const isMockSubmission = !apiBase

/** The Turnstile site key; the API rejects sends without its check. */
export const turnstileSiteKey = apiBase
  ? import.meta.env.VITE_TURNSTILE_SITE_KEY
  : undefined

const text = content.submit_page

export type SubmissionResult = { message: string } &
  /**
   * `sent`: a new submission awaiting its verification email (`pending`), a
   * new version of a verified one (`updated`), or the mock (`mock`).
   */
  (
    | { status: 'success'; sent: 'pending' | 'updated'; email: string }
    | { status: 'success'; sent: 'mock' }
    | { status: 'field-error'; errors: SubmissionErrors }
    | { status: 'server-error' }
  )

type ApiResponse<T> =
  | { ok: true; body: T }
  | { ok: false; error: ApiError | null; network: boolean }

/**
 * Calls the API. Never logs or stores the request: it holds the submitter's
 * personal data.
 */
async function request<T>(
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  { body, token }: { body?: unknown; token?: string } = {},
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${apiBase}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    return { ok: false, error: null, network: true }
  }
  const json: unknown = await response.json().catch(() => null)
  if (response.ok && json) return { ok: true, body: json as T }
  const error =
    json && typeof json === 'object' && 'error' in json
      ? (json as ApiError)
      : null
  return { ok: false, error, network: false }
}

async function mockSubmit(
  type: SessionTypeId,
  values: SubmissionValues,
): Promise<SubmissionResult> {
  const errors = validateSubmission(type, values)
  const mock = text.mock
  if (Object.keys(errors).length) {
    return { status: 'field-error', errors, message: mock.fieldError }
  }
  await new Promise<void>((resolve) => setTimeout(resolve, 600))
  return { status: 'success', sent: 'mock', message: mock.success }
}

/**
 * Sends a new submission, or a new version of the one behind `editToken`,
 * with the Turnstile token. Validates first, so only drafts the API would
 * accept leave the browser.
 */
export async function sendSubmission(
  type: SessionTypeId,
  values: SubmissionValues,
  {
    editToken,
    turnstileToken,
  }: { editToken?: string; turnstileToken: string | null },
): Promise<SubmissionResult> {
  if (isMockSubmission) return mockSubmit(type, values)

  const results = text.result
  const errors = validateSubmission(type, values)
  if (Object.keys(errors).length) {
    return { status: 'field-error', errors, message: results.fieldError }
  }
  if (turnstileSiteKey && !turnstileToken) {
    return { status: 'server-error', message: results.captchaRequired }
  }

  const response = editToken
    ? await request<SubmitPending | SubmitUpdated>('PUT', '/edit', {
        body: { values, turnstileToken },
        token: editToken,
      })
    : await request<SubmitPending>('POST', '/submissions', {
        body: { type, values, turnstileToken },
      })

  if (response.ok) {
    const { status, email } = response.body
    const message = status === 'updated' ? results.updated : results.pending
    return {
      status: 'success',
      sent: status,
      email,
      message: message.replace('{email}', email),
    }
  }
  if (response.network) {
    return { status: 'server-error', message: results.networkError }
  }
  switch (response.error?.error) {
    case 'invalid':
      return {
        status: 'field-error',
        errors: response.error.errors ?? {},
        message: results.fieldError,
      }
    case 'closed':
      return { status: 'server-error', message: results.closed }
    case 'captcha':
      return { status: 'server-error', message: results.captcha }
    case 'rate-limited':
      return { status: 'server-error', message: results.rateLimited }
    case 'mail-limit':
      return { status: 'server-error', message: results.mailLimit }
    default:
      return { status: 'server-error', message: results.serverError }
  }
}

export type EditLoadResult =
  | { status: 'ok'; draft: EditDraft }
  | { status: 'invalid' | 'closed' | 'error' }

/** The latest verified version behind an edit link. */
export async function loadEditDraft(token: string): Promise<EditLoadResult> {
  if (isMockSubmission) return { status: 'error' }
  const response = await request<EditDraft>('GET', '/edit', { token })
  if (response.ok) {
    return isSessionTypeId(response.body.type)
      ? { status: 'ok', draft: response.body }
      : { status: 'error' }
  }
  switch (response.error?.error) {
    case 'invalid-token':
    case 'not-found':
      return { status: 'invalid' }
    case 'closed':
      return { status: 'closed' }
    default:
      return { status: 'error' }
  }
}

export type VerifyResult =
  | { status: 'verified'; type: SessionTypeId }
  | { status: 'expired' | 'invalid' | 'not-found' | 'error' }

// One request per token and page load: React's development double effects
// (and a remount) must not send the copy email twice.
const verifications = new Map<string, Promise<VerifyResult>>()

/** Confirms the address behind a verification link. */
export function verifySubmission(token: string): Promise<VerifyResult> {
  let pending = verifications.get(token)
  if (!pending) {
    pending = verify(token)
    verifications.set(token, pending)
  }
  return pending
}

async function verify(token: string): Promise<VerifyResult> {
  if (isMockSubmission) return { status: 'error' }
  const response = await request<VerifyResponse>('POST', '/verify', {
    body: { token },
  })
  if (response.ok) return { status: 'verified', type: response.body.type }
  switch (response.error?.error) {
    case 'expired':
      return { status: 'expired' }
    case 'invalid-token':
    case 'bad-request':
      return { status: 'invalid' }
    case 'not-found':
      return { status: 'not-found' }
    default:
      return { status: 'error' }
  }
}

/**
 * Unsent drafts as kept between visits: the shared answers (基本資料) once,
 * and each type's other answers. Sent types keep only the shared answers, so
 * a reload can't send the same submission twice.
 */
export interface StoredDrafts {
  shared: SubmissionValues
  types: Partial<Record<SessionTypeId, SubmissionValues>>
}

export interface DraftStorage {
  load(): StoredDrafts | null
  save(drafts: StoredDrafts): void
  clear(): void
}

const draftKey = 'sitcon-2027-cfp-drafts'
const draftVersion = 1

/**
 * Drafts saved before #53 keep their types under the previous ids
 * (`general`); move them to the current ones.
 */
export function upgradeDrafts(drafts: StoredDrafts): StoredDrafts {
  const types: Record<string, SubmissionValues | undefined> = {
    ...drafts.types,
  }
  for (const [previous, current] of Object.entries(previousSessionTypeIds)) {
    if (previous === current || !(previous in types)) continue
    types[current] ??= types[previous]
    delete types[previous]
  }
  return { ...drafts, types }
}

/**
 * Drafts in this browser's localStorage, so a reload or a closed tab keeps
 * them. Where storage is unavailable (blocked site data, some private
 * windows), drafts last only while the page is open.
 */
export const localDraftStorage: DraftStorage = {
  load() {
    try {
      const raw = localStorage.getItem(draftKey)
      const stored: unknown = raw ? JSON.parse(raw) : null
      if (
        stored &&
        typeof stored === 'object' &&
        'version' in stored &&
        stored.version === draftVersion &&
        'drafts' in stored &&
        stored.drafts &&
        typeof stored.drafts === 'object'
      ) {
        return upgradeDrafts(stored.drafts as StoredDrafts)
      }
    } catch {
      // Unreadable or unavailable: start blank.
    }
    return null
  },
  save(drafts) {
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({ version: draftVersion, drafts }),
      )
    } catch {
      // Full or unavailable: the draft stays in the open page only.
    }
  },
  clear() {
    try {
      localStorage.removeItem(draftKey)
    } catch {
      // Unavailable: nothing was stored.
    }
  },
}

/**
 * A type's draft from stored answers. Answers that no longer fit their
 * question (removed fields, renamed options) are dropped.
 */
function restoreValues(
  type: SessionTypeId,
  stored: StoredDrafts | null,
): SubmissionValues {
  const values = createEmptyValues(type)
  if (!stored) return values
  for (const field of getSubmissionFields(type)) {
    const source = isSharedField(field.key)
      ? stored.shared
      : stored.types?.[type]
    const value: unknown = source?.[field.key]
    if (field.kind === 'checkboxes') {
      if (Array.isArray(value)) {
        values[field.key] = value.filter(
          (choice): choice is string =>
            typeof choice === 'string' && !!field.options?.includes(choice),
        )
      }
    } else if (typeof value === 'string') {
      if (!field.options || field.options.includes(value)) {
        values[field.key] = value
      }
    }
  }
  return values
}

export interface SubmissionState {
  values: SubmissionValues
  errors: SubmissionErrors
  isSubmitting: boolean
  result: SubmissionResult | null
}

/** A sent submission locks its form, so a second click can't send it again. */
export function isSubmitted(state: SubmissionState) {
  return state.result?.status === 'success'
}

function byType<T>(build: (type: SessionTypeId) => T) {
  return Object.fromEntries(
    sessionTypeIds.map((type) => [type, build(type)]),
  ) as Record<SessionTypeId, T>
}

/** Whether a type's draft can still change. */
function isEditable(state: SubmissionState) {
  return !state.isSubmitting && !isSubmitted(state)
}

/**
 * One store per mounted form, holding a draft of each type; responses always
 * update the sending type. Answers to shared questions (基本資料) are kept in
 * step across the drafts. With `storage`, drafts start from and are saved to
 * it. An edit starts its type from the loaded draft and sends new versions of
 * it.
 */
export function createSubmissionStore({
  edit,
  storage,
}: {
  edit?: { token: string; draft: EditDraft }
  storage?: DraftStorage
} = {}) {
  const stored = storage?.load() ?? null
  let state = byType((type): SubmissionState => ({
    values:
      edit?.draft.type === type
        ? { ...createEmptyValues(type), ...edit.draft.values }
        : restoreValues(type, stored),
    errors: {},
    isSubmitting: false,
    result: null,
  }))
  // The latest shared answers, which outlive a sent type's draft.
  let shared: SubmissionValues = {}
  for (const type of sessionTypeIds) {
    for (const [key, value] of Object.entries(state[type].values)) {
      if (isSharedField(key) && !(key in shared)) shared[key] = value
    }
  }
  const listeners = new Set<() => void>()

  function save() {
    if (!storage) return
    const types: StoredDrafts['types'] = {}
    for (const type of sessionTypeIds) {
      if (isSubmitted(state[type])) continue
      types[type] = Object.fromEntries(
        Object.entries(state[type].values).filter(
          ([key]) => !isSharedField(key),
        ),
      )
    }
    storage.save({ shared, types })
  }

  function update(patch: Partial<Record<SessionTypeId, SubmissionState>>) {
    state = { ...state, ...patch }
    save()
    listeners.forEach((listener) => listener())
  }

  function updateType(type: SessionTypeId, patch: Partial<SubmissionState>) {
    update({ [type]: { ...state[type], ...patch } })
  }

  /**
   * Shows every error of the type's draft, and whether it has none. Run on
   * submit before Base UI's `Form`, which stops at fields already showing an
   * error.
   */
  function validate(type: SessionTypeId) {
    const current = state[type]
    if (current.isSubmitting || isSubmitted(current)) return false
    const errors = validateSubmission(type, current.values)
    if (!Object.keys(errors).length) return true
    updateType(type, {
      errors,
      result: {
        status: 'field-error',
        errors,
        message: isMockSubmission
          ? text.mock.fieldError
          : text.result.fieldError,
      },
    })
    return false
  }

  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setValue(type: SessionTypeId, key: string, value: SubmissionValue) {
      if (!isEditable(state[type])) return
      // A shared answer also goes to every other draft that can still change.
      const types = isSharedField(key)
        ? sessionTypeIds.filter(
            (other) => key in state[other].values && isEditable(state[other]),
          )
        : [type]
      if (isSharedField(key)) shared = { ...shared, [key]: value }
      const patch: Partial<Record<SessionTypeId, SubmissionState>> = {}
      for (const target of types) {
        const current = state[target]
        // Keep `errors` unchanged unless this field had one, so Base UI's
        // `Form` does not re-render every field on each keystroke.
        let errors = current.errors
        if (key in errors) {
          errors = { ...errors }
          delete errors[key]
        }
        patch[target] = {
          ...current,
          values: { ...current.values, [key]: value },
          errors,
          result: target === type ? null : current.result,
        }
      }
      update(patch)
    },
    /**
     * Empties every draft that can still change and forgets the saved ones,
     * for a shared computer.
     */
    clearDrafts() {
      shared = {}
      const patch: Partial<Record<SessionTypeId, SubmissionState>> = {}
      for (const type of sessionTypeIds) {
        if (!isEditable(state[type])) continue
        patch[type] = {
          ...state[type],
          values: createEmptyValues(type),
          errors: {},
          result: null,
        }
      }
      storage?.clear()
      state = { ...state, ...patch }
      listeners.forEach((listener) => listener())
    },
    /** Shows or clears one field's error, as when it loses focus. */
    validateField(type: SessionTypeId, key: string) {
      const current = state[type]
      const field = getSubmissionFields(type).find((field) => field.key === key)
      if (!field || current.isSubmitting || isSubmitted(current)) return
      const error = validateField(field, current.values[key])
      if (error === current.errors[key]) return
      const errors = { ...current.errors }
      if (error) errors[key] = error
      else delete errors[key]
      updateType(type, { errors })
    },
    validate,
    /** Sends the type's draft; `turnstileToken` is spent either way. */
    async submit(type: SessionTypeId, turnstileToken: string | null) {
      // Synchronous guard also covers a second send before React rerenders.
      const current = state[type]
      if (current.isSubmitting || isSubmitted(current)) return
      if (!validate(type)) return
      // `errors` keeps its identity until the response replaces it, so Base
      // UI's `Form` sees one change per send and focuses any field errors.
      updateType(type, { isSubmitting: true, result: null })

      let result: SubmissionResult
      try {
        result = await sendSubmission(type, current.values, {
          editToken: edit?.draft.type === type ? edit.token : undefined,
          turnstileToken,
        })
      } catch {
        result = {
          status: 'server-error',
          message: isMockSubmission
            ? text.mock.serverError
            : text.result.serverError,
        }
      }
      updateType(type, {
        isSubmitting: false,
        errors: result.status === 'field-error' ? result.errors : {},
        result,
      })
    },
  }
}
