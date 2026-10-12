/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the submission API (`worker/`), e.g.
   * `https://2027-cfp-api.sitcon.workers.dev`. Unset: the form is a mock.
   */
  readonly VITE_SUBMISSION_API?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
