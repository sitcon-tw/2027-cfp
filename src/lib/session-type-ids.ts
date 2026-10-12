// Dependency-free so vite.config.ts and the submission API can import it.
export const sessionTypeIds = ['general', 'open', 'demo'] as const

export type SessionTypeId = (typeof sessionTypeIds)[number]

export function isSessionTypeId(value: unknown): value is SessionTypeId {
  return (sessionTypeIds as readonly unknown[]).includes(value)
}
