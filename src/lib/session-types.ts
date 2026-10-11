import content from '@/content.json'
import { Mic, TvMinimalPlay, Users, type LucideIcon } from 'lucide-react'

import generalPhoto from '@/assets/session-general.jpg'
import { sessionPages } from '@/lib/session-pages'
import { sessionTypeIds } from '@/lib/session-type-ids'

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
  /** Homepage detail panel and mobile card. */
  intro: { description: string; image: string }
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
    intro: {
      description: content.session_page.open.introDescription,
      image: sessionPages.open.hero.image,
    },
  },
  {
    id: 'demo',
    title: content.sessions.demoTitle,
    summary: content.sessions.demoSummary,
    icon: TvMinimalPlay,
    intro: {
      description: content.sessions.demoDescription,
      image: sessionPages.demo.hero.image,
    },
  },
]

export function getSessionType(id: SessionTypeId): SessionType {
  return sessionTypes.find((type) => type.id === id)!
}
