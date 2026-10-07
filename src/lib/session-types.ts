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
    title: '一般議程',
    summary: '40 分鐘 / 10 分鐘深度分享',
    icon: Mic,
    intro: {
      description:
        'SITCON 的一般議程聚集來自學生、開發者與科技社群的分享，從軟體開發、資訊安全、開源、硬體，到社群經營與個人經驗，涵蓋各種與資訊科技相關的主題。每場演講不只是技術教學，也常包含講者實際參與專案、解決問題與探索技術的經驗，讓參與者能從不同角度認識技術與社群。',
      image: generalPhoto,
    },
  },
  {
    id: 'open',
    title: '開放式議程',
    summary: '40 分鐘 / 90 分鐘互動',
    icon: Users,
  },
  {
    id: 'demo',
    title: 'Demo 展',
    summary: '現場展示你的作品',
    icon: TvMinimalPlay,
  },
]
