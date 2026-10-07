import content from '@/content.json'
import { Mic, TvMinimalPlay, Users, type LucideIcon } from 'lucide-react'

import generalPhoto from '@/assets/session-general.jpg'

export type SessionTypeId = 'general' | 'open' | 'demo'

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
