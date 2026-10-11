import content from '@/content.json'
import {
  Coffee,
  Gamepad2,
  Presentation,
  Sprout,
  Toolbox,
  UserRoundGroup,
  type LucideIcon,
} from 'lucide-react'

import type { Picture } from 'vite-imagetools'

import heroDemoPlaceholder from '@/assets/session-hero-demo.webp?placeholder'
import heroDemo from '@/assets/session-hero-demo.webp?responsive'
import heroGeneralPlaceholder from '@/assets/session-hero-general.webp?placeholder'
import heroGeneral from '@/assets/session-hero-general.webp?responsive'
import heroOpenPlaceholder from '@/assets/session-hero-open.webp?placeholder'
import heroOpen from '@/assets/session-hero-open.webp?responsive'
import type { CriteriaTableProps } from '@/components/sessions/criteria-table'
import type { FaqItem } from '@/components/sessions/faq'
import type { InfoCardStackProps } from '@/components/sessions/info-card-stack'
import type { SessionTypeId } from '@/lib/session-types'

// Per-page data of /sessions/$type. Copy lives in `content.session_page`;
// this file pairs it with images, icons and links.

const text = content.session_page

export interface IntroCard {
  title: string
  description: string
  /** Example topics listed under the description. */
  examples?: string[]
  /** Faded decoration in the card's bottom-right corner. */
  icon: LucideIcon
}

export interface SessionExample {
  title: string
  href: string
  image: Picture
}

/** A carousel of examples, titled when a section has more than one. */
export interface ExampleGroup {
  title?: string
  items: SessionExample[]
}

export interface ExamplesSection {
  title: string
  /** One paragraph, or a list of them. */
  description: string | string[]
  groups: ExampleGroup[]
}

export interface SessionPage {
  hero: {
    title: string
    description: string
    image: Picture
    /** Blurred until `image` loads. */
    placeholder: string
  }
  introTitle: string
  /** What the session type is, above the formats. */
  introDescription?: string
  /** The line that leads from `introDescription` into the formats. */
  introLead?: string
  intro: IntroCard[]
  /** Closing invitation after the formats; 開放式議程 only. */
  introMore?: { title: string; description: string[] }
  /** 投稿主題範例; not on Demo 展, which shows its gallery instead. */
  examples?: ExamplesSection
  reviewCriteria: CriteriaTableProps
  beforeSubmission: InfoCardStackProps
  /** 投稿格式, the submission format. */
  requirements: CriteriaTableProps
  afterSubmission: InfoCardStackProps
  faq: FaqItem[]
}

/**
 * Example cover images: every image in `src/assets/session-examples/`,
 * looked up by the file name each item gives as `image` in `content.json`.
 */
const exampleImages = Object.fromEntries(
  Object.entries(
    import.meta.glob<Picture>(
      '/src/assets/session-examples/*.{jpg,jpeg,png,webp}',
      { eager: true, import: 'default', query: '?responsive' },
    ),
  ).map(([path, src]) => [path.split('/').pop(), src]),
)

type ExampleItems = { title: string; href: string; image: string }[]

/**
 * Resolves each item's `image` file name. A section lists its `items`
 * directly, or splits them into titled `groups` (Presentation / Espresso).
 */
function withImages({
  title,
  description,
  ...rest
}: {
  title: string
  description: string | string[]
} & (
  { items: ExampleItems } | { groups: { title: string; items: ExampleItems }[] }
)): ExamplesSection {
  const groups: { title?: string; items: ExampleItems }[] =
    'groups' in rest ? rest.groups : [{ items: rest.items }]
  return {
    title,
    description,
    groups: groups.map((group) => ({
      ...group,
      items: group.items.map((item) => ({
        ...item,
        image: exampleImages[item.image],
      })),
    })),
  }
}

function withIcons(
  cards: { title: string; description: string; examples?: string[] }[],
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
      placeholder: heroGeneralPlaceholder,
    },
    introTitle: text.general.introTitle,
    introDescription: text.general.introDescription,
    introLead: text.general.introLead,
    intro: withIcons(text.general.intro, [Presentation, Coffee]),
    examples: withImages(text.examples.general),
    reviewCriteria: text.general.reviewCriteria,
    beforeSubmission: text.general.beforeSubmission,
    requirements: text.general.requirements,
    afterSubmission: text.general.afterSubmission,
    faq: text.general.faq,
  },
  open: {
    hero: {
      title: text.open.heroTitle,
      description: text.open.heroDescription,
      image: heroOpen,
      placeholder: heroOpenPlaceholder,
    },
    introTitle: text.open.introTitle,
    introDescription: text.open.introDescription,
    introLead: text.open.introLead,
    intro: withIcons(text.open.intro, [Toolbox, Coffee, UserRoundGroup]),
    introMore: text.open.introMore,
    examples: withImages(text.examples.open),
    reviewCriteria: text.open.reviewCriteria,
    beforeSubmission: text.open.beforeSubmission,
    requirements: text.open.requirements,
    afterSubmission: text.open.afterSubmission,
    faq: text.open.faq,
  },
  demo: {
    hero: {
      title: text.demo.heroTitle,
      description: text.demo.heroDescription,
      image: heroDemo,
      placeholder: heroDemoPlaceholder,
    },
    introTitle: text.demo.introTitle,
    introDescription: text.demo.introDescription,
    introLead: text.demo.introLead,
    intro: withIcons(text.demo.intro, [Gamepad2, Presentation, Sprout]),
    reviewCriteria: text.demo.reviewCriteria,
    requirements: text.demo.requirements,
    beforeSubmission: text.demo.beforeSubmission,
    afterSubmission: text.demo.afterSubmission,
    faq: text.demo.faq,
  },
}
