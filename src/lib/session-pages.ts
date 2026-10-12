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
import { milestoneItems, type ScheduleItem } from '@/lib/schedule'
import type { SessionTypeId } from '@/lib/session-types'

// Per-page data of the session pages (/$type). Copy lives in
// `content.session_page`; this file pairs it with images, icons and links.

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
  /** 更多重要時程: what the dialog lists, and its timeline. */
  schedule: { description: string; items: ScheduleItem[] }
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
  normal: {
    hero: {
      title: text.normal.heroTitle,
      description: text.normal.heroDescription,
      image: heroGeneral,
      placeholder: heroGeneralPlaceholder,
    },
    introTitle: text.normal.introTitle,
    introDescription: text.normal.introDescription,
    introLead: text.normal.introLead,
    intro: withIcons(text.normal.intro, [Presentation, Coffee]),
    schedule: {
      description: text.normal.schedule.description,
      items: milestoneItems(text.normal.schedule.items),
    },
    examples: withImages(text.examples.normal),
    reviewCriteria: text.normal.reviewCriteria,
    beforeSubmission: text.normal.beforeSubmission,
    requirements: text.normal.requirements,
    afterSubmission: text.normal.afterSubmission,
    faq: text.normal.faq,
  },
  undefined: {
    hero: {
      title: text.undefined.heroTitle,
      description: text.undefined.heroDescription,
      image: heroOpen,
      placeholder: heroOpenPlaceholder,
    },
    introTitle: text.undefined.introTitle,
    introDescription: text.undefined.introDescription,
    introLead: text.undefined.introLead,
    intro: withIcons(text.undefined.intro, [Toolbox, Coffee, UserRoundGroup]),
    schedule: {
      description: text.undefined.schedule.description,
      items: milestoneItems(text.undefined.schedule.items),
    },
    introMore: text.undefined.introMore,
    examples: withImages(text.examples.undefined),
    reviewCriteria: text.undefined.reviewCriteria,
    beforeSubmission: text.undefined.beforeSubmission,
    requirements: text.undefined.requirements,
    afterSubmission: text.undefined.afterSubmission,
    faq: text.undefined.faq,
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
    schedule: {
      description: text.demo.schedule.description,
      items: milestoneItems(text.demo.schedule.items),
    },
    reviewCriteria: text.demo.reviewCriteria,
    requirements: text.demo.requirements,
    beforeSubmission: text.demo.beforeSubmission,
    afterSubmission: text.demo.afterSubmission,
    faq: text.demo.faq,
  },
}
