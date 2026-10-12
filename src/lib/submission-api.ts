import type { SessionTypeId } from '@/lib/session-type-ids'
import type { SubmissionErrors, SubmissionValues } from '@/lib/submission'

/**
 * The contract between the form and the submission API (`worker/`). Every
 * body is JSON; field errors carry the messages from `content.json`.
 *
 * - `POST /submissions` `{ type, values, turnstileToken }` → `202 SubmitPending`
 * - `POST /verify` `{ token }` → `200 VerifyResponse`
 * - `GET /edit` (edit token as `Authorization: Bearer …`) → `200 EditDraft`
 * - `PUT /edit` `{ values, turnstileToken }` (same header) →
 *   `200 SubmitPending | SubmitUpdated`
 *
 * Failures answer with `ApiError` and a 4xx/5xx status.
 */

export interface SubmitRequest {
  type: SessionTypeId
  values: SubmissionValues
  /** From the Cloudflare Turnstile widget; single use. */
  turnstileToken: string
}

/** Saved, waiting for the address to be verified through the emailed link. */
export interface SubmitPending {
  status: 'pending'
  email: string
}

/** An edit from the verified address: saved and verified straight away. */
export interface SubmitUpdated {
  status: 'updated'
  email: string
}

export interface VerifyRequest {
  token: string
}

export interface VerifyResponse {
  status: 'verified'
  type: SessionTypeId
  id: string
}

/** The latest verified version of a submission, to prefill the edit form. */
export interface EditDraft {
  id: string
  type: SessionTypeId
  values: SubmissionValues
}

export interface EditRequest {
  values: SubmissionValues
  turnstileToken: string
}

export type ApiErrorCode =
  /** Field errors in `errors`, keyed by field key. */
  | 'invalid'
  /** Malformed request or unknown session type. */
  | 'bad-request'
  /** The submission deadline has passed. */
  | 'closed'
  /** The Turnstile check is missing, expired or failed. */
  | 'captcha'
  /** Too many requests from this client, or emails to this address, a minute. */
  | 'rate-limited'
  /** This address has had its verification emails for the day. */
  | 'mail-limit'
  /** The verification or edit link is malformed or tampered with. */
  | 'invalid-token'
  /** The verification link has expired. */
  | 'expired'
  /** No submission for the link. */
  | 'not-found'
  | 'server'

export interface ApiError {
  error: ApiErrorCode
  errors?: SubmissionErrors
}

/** How long a verification link stays valid. */
export const verifyTokenHours = 48
