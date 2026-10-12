/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the submission API (`worker/`), e.g.
   * `https://2027-cfp-api.sitcon.workers.dev`. Unset: the form is a mock.
   */
  readonly VITE_SUBMISSION_API?: string
  /**
   * Site key of the Cloudflare Turnstile widget the API checks. Locally,
   * `1x00000000000000000000AA` always passes.
   */
  readonly VITE_TURNSTILE_SITE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
