import content from '@/content.json'
import {
  Coffee,
  PlayingCardsFan,
  Presentation,
  Toolbox,
  UserRoundGroup,
  type LucideIcon,
} from 'lucide-react'

import heroDemo from '@/assets/session-hero-demo.jpg'
import heroGeneral from '@/assets/session-hero-general.jpg'
import heroOpen from '@/assets/session-hero-open.jpg'
import examplePlaceholder from '@/assets/session-example-placeholder.jpg'
import { TODO_HREF } from '@/lib/links'
import type { SessionTypeId } from '@/lib/session-types'

// Per-page data of /sessions/$type. Copy lives in `content.session_page`;
// this file pairs it with images, icons and links.

const text = content.session_page

export interface IntroCard {
  title: string
  description: string
  /** Faded decoration in the card's bottom-right corner. */
  icon: LucideIcon
}

export interface SessionExample {
  title: string
  href: string
  image: string
}

export interface ExamplesSection {
  title: string
  description: string
  items: SessionExample[]
}

export interface SessionPage {
  hero: { title: string; description: string; image: string }
  introTitle: string
  intro: IntroCard[]
  /** 議程範例 carousels; empty for Demo 展, which shows its gallery instead. */
  examples: ExamplesSection[]
}

// TODO: real past sessions and links, from the program team.
const placeholderExamples: SessionExample[] = Array.from({ length: 4 }, () => ({
  title: text.examples.placeholderSession,
  href: TODO_HREF,
  image: examplePlaceholder,
}))

function withIcons(
  cards: { title: string; description: string }[],
  icons: LucideIcon[],
): IntroCard[] {
  return cards.map((card, i) => ({ ...card, icon: icons[i] }))
}

export const sessionPages: Record<SessionTypeId, SessionPage> = {
  general: {
    hero: {
      title: text.general.heroTitle,
      description: text.general.heroDescription,
      image: heroGeneral,
    },
    introTitle: text.general.introTitle,
    intro: withIcons(text.general.intro, [Presentation, Coffee]),
    examples: [
      { ...text.examples.presentation, items: placeholderExamples },
      { ...text.examples.espresso, items: placeholderExamples },
    ],
  },
  open: {
    hero: {
      title: text.open.heroTitle,
      description: text.open.heroDescription,
      image: heroOpen,
    },
    introTitle: text.open.introTitle,
    intro: withIcons(text.open.intro, [Toolbox, Coffee, UserRoundGroup]),
    examples: [{ ...text.examples.open, items: placeholderExamples }],
  },
  demo: {
    hero: {
      title: text.demo.heroTitle,
      description: text.demo.heroDescription,
      image: heroDemo,
    },
    introTitle: text.demo.introTitle,
    intro: withIcons(text.demo.intro, [
      Presentation,
      PlayingCardsFan,
      UserRoundGroup,
    ]),
    examples: [],
  },
}
