// Dependency-free so vite.config.ts and the submission API can import it.
export const sessionTypeIds = ['general', 'open', 'demo'] as const

export type SessionTypeId = (typeof sessionTypeIds)[number]

export function isSessionTypeId(value: unknown): value is SessionTypeId {
  return (sessionTypeIds as readonly unknown[]).includes(value)
}

/**
 * URL path of each type's session page (`/normal`, …). The ids stay the
 * same everywhere else: `/submit/$type`, the API and the sheet.
 */
export const sessionPageSlugs = {
  general: 'normal',
  open: 'undefined',
  demo: 'demo',
} as const satisfies Record<SessionTypeId, string>

export function sessionTypeFromSlug(slug: string): SessionTypeId | undefined {
  return sessionTypeIds.find((id) => sessionPageSlugs[id] === slug)
}
