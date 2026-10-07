import content from '@/content.json'
import { Mic, TvMinimalPlay, Users, type LucideIcon } from 'lucide-react'

import generalPhoto from '@/assets/session-general.jpg'

export const sessionTypeIds = ['general', 'open', 'demo'] as const

export type SessionTypeId = (typeof sessionTypeIds)[number]

export function isSessionTypeId(value: string): value is SessionTypeId {
  return (sessionTypeIds as readonly string[]).includes(value)
}

export interface SessionType {
  id: SessionTypeId
  title: string
  /** Format and length, shown under the title. */
  summary: string
  icon: LucideIcon
  /** Homepage detail panel. Missing until Figma has the copy and photo. */
  intro?: { description: string; image: string }
}

export const sessionTypes: SessionType[] = [
  {
    id: 'general',
    title: content.sessions.generalTitle,
    summary: content.sessions.generalSummary,
    icon: Mic,
    intro: {
      description: content.sessions.generalDescription,
      image: generalPhoto,
    },
  },
  {
    id: 'open',
    title: content.sessions.openTitle,
    summary: content.sessions.openSummary,
    icon: Users,
  },
  {
    id: 'demo',
    title: content.sessions.demoTitle,
    summary: content.sessions.demoSummary,
    icon: TvMinimalPlay,
  },
]

export function getSessionType(id: SessionTypeId): SessionType {
  return sessionTypes.find((type) => type.id === id)!
}
