// Dependency-free so vite.config.ts and the submission API can import it.
// Each id is also its session page's path (`/normal`) and its form's
// (`/submit/normal`).
export const sessionTypeIds = ['normal', 'undefined', 'demo'] as const

export type SessionTypeId = (typeof sessionTypeIds)[number]

export function isSessionTypeId(value: unknown): value is SessionTypeId {
  return (sessionTypeIds as readonly unknown[]).includes(value)
}

/**
 * The ids before #53, still in links already shared and in the edit links
 * of emails already sent. Their routes redirect to the current id.
 */
export const previousSessionTypeIds = {
  general: 'normal',
  open: 'undefined',
  demo: 'demo',
} as const satisfies Record<string, SessionTypeId>

/** A current or previous id as the current one. */
export function resolveSessionTypeId(value: string): SessionTypeId | undefined {
  if (isSessionTypeId(value)) return value
  return Object.hasOwn(previousSessionTypeIds, value)
    ? previousSessionTypeIds[value as keyof typeof previousSessionTypeIds]
    : undefined
}
