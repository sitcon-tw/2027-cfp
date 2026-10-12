import content from '@/content.json'
import { Mic, TvMinimalPlay, Users, type LucideIcon } from 'lucide-react'
import type { Picture } from 'vite-imagetools'

import generalPhoto from '@/assets/session-general.jpg?responsive'
import { sessionPages } from '@/lib/session-pages'
import type { SessionTypeId } from '@/lib/session-type-ids'

export { isSessionTypeId, type SessionTypeId } from '@/lib/session-type-ids'

export interface SessionType {
  id: SessionTypeId
  title: string
  /** Format and length, shown under the title. */
  summary: string
  icon: LucideIcon
  /** Label of the homepage link to the type's session page. */
  link: string
  /** Homepage detail panel and mobile card. */
  intro: { image: Picture }
}

export const sessionTypes: SessionType[] = [
  {
    id: 'general',
    title: content.sessions.generalTitle,
    summary: content.sessions.generalSummary,
    link: content.sessions.generalLink,
    icon: Mic,
    intro: {
      image: generalPhoto,
    },
  },
  {
    id: 'open',
    title: content.sessions.openTitle,
    summary: content.sessions.openSummary,
    link: content.sessions.openLink,
    icon: Users,
    intro: {
      image: sessionPages.open.hero.image,
    },
  },
  {
    id: 'demo',
    title: content.sessions.demoTitle,
    summary: content.sessions.demoSummary,
    link: content.sessions.demoLink,
    icon: TvMinimalPlay,
    intro: {
      image: sessionPages.demo.hero.image,
    },
  },
]

export function getSessionType(id: SessionTypeId): SessionType {
  return sessionTypes.find((type) => type.id === id)!
}
