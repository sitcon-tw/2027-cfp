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
  /** Photo behind the type's link cards (homepage, 參考更多稿件). */
  intro: { image: Picture }
}

export const sessionTypes: SessionType[] = [
  {
    id: 'normal',
    title: content.sessions.generalTitle,
    summary: content.sessions.generalSummary,
    icon: Mic,
    intro: {
      image: generalPhoto,
    },
  },
  {
    id: 'undefined',
    title: content.sessions.openTitle,
    summary: content.sessions.openSummary,
    icon: Users,
    intro: {
      image: sessionPages.undefined.hero.image,
    },
  },
  {
    id: 'demo',
    title: content.sessions.demoTitle,
    summary: content.sessions.demoSummary,
    icon: TvMinimalPlay,
    intro: {
      image: sessionPages.demo.hero.image,
    },
  },
]

export function getSessionType(id: SessionTypeId): SessionType {
  return sessionTypes.find((type) => type.id === id)!
}
