/** Bindings, vars (`wrangler.jsonc`) and secrets (`wrangler secret put`). */
export interface Env {
  /** Secret: the spreadsheet ID from the Google Sheet's URL. */
  SHEET_ID: string
  /** Secret: the service account's JSON key, with domain-wide delegation. */
  GOOGLE_SERVICE_ACCOUNT_KEY: string
  /** Secret: signs verification and edit links. Rotating it voids them. */
  TOKEN_SECRET: string
  /** Workspace user the service account sends as. */
  MAIL_SENDER: string
  /** Where replies to the emails go. */
  MAIL_REPLY_TO: string
  /** The CFP site, with a trailing slash; email links point here. */
  SITE_URL: string
  /** Comma-separated origins allowed to call the API. */
  ALLOWED_ORIGINS: string
  /** Requests per client IP. */
  REQUEST_LIMITER: RateLimit
  /** Verification emails per recipient. */
  MAIL_LIMITER: RateLimit
}
