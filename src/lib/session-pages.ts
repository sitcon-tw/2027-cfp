import content from '@/content.json'
import {
  Coffee,
  PlayingCardsFan,
  Presentation,
  Toolbox,
  UserRoundGroup,
  type LucideIcon,
} from 'lucide-react'

import heroDemoThumb from '@/assets/session-hero-demo-thumb.webp'
import heroDemo from '@/assets/session-hero-demo.webp'
import heroGeneralThumb from '@/assets/session-hero-general-thumb.webp'
import heroGeneral from '@/assets/session-hero-general.webp'
import heroOpenThumb from '@/assets/session-hero-open-thumb.webp'
import heroOpen from '@/assets/session-hero-open.webp'
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
  hero: {
    title: string
    description: string
    image: string
    /** About 32px wide, inlined by Vite; blurred until `image` loads. */
    placeholder: string
  }
  introTitle: string
  intro: IntroCard[]
  /** 議程範例 carousels; empty for Demo 展, which shows its gallery instead. */
  examples: ExamplesSection[]
}

/**
 * Example cover images: every image in `src/assets/session-examples/`,
 * looked up by the file name each item gives as `image` in `content.json`.
 */
const exampleImages = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>(
      '/src/assets/session-examples/*.{jpg,jpeg,png,webp}',
      { eager: true, import: 'default' },
    ),
  ).map(([path, src]) => [path.split('/').pop(), src]),
)

function withImages(section: {
  title: string
  description: string
  items: { title: string; href: string; image: string }[]
}): ExamplesSection {
  return {
    ...section,
    items: section.items.map((item) => ({
      ...item,
      image: exampleImages[item.image],
    })),
  }
}

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
      placeholder: heroGeneralThumb,
    },
    introTitle: text.general.introTitle,
    intro: withIcons(text.general.intro, [Presentation, Coffee]),
    examples: [
      withImages(text.examples.presentation),
      withImages(text.examples.espresso),
    ],
  },
  open: {
    hero: {
      title: text.open.heroTitle,
      description: text.open.heroDescription,
      image: heroOpen,
      placeholder: heroOpenThumb,
    },
    introTitle: text.open.introTitle,
    intro: withIcons(text.open.intro, [Toolbox, Coffee, UserRoundGroup]),
    examples: [withImages(text.examples.open)],
  },
  demo: {
    hero: {
      title: text.demo.heroTitle,
      description: text.demo.heroDescription,
      image: heroDemo,
      placeholder: heroDemoThumb,
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
