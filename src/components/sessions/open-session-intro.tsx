import { Sparkles, type LucideIcon } from 'lucide-react'

import { LinkedText } from '@/components/linked-text'
import { SessionSection } from '@/components/sessions/session-section'
import { Card } from '@/components/ui/card'
import type { IntroCard } from '@/lib/session-pages'
import { cn } from '@/lib/utils'

export interface OpenSessionIntroProps {
  title: string
  /** What 開放式議程 is, under the heading. */
  description?: string
  /** The line after `description` that leads into the formats. */
  lead?: string
  /** Formats, each with example topics. */
  formats: IntroCard[]
  /** Closing invitation to bring a format of one's own. */
  more?: { title: string; description: string[] }
}

/**
 * Corner rule for four cards, a 2×2 grid from `md` up and stacked below:
 * only the outer corners of the whole grid are `xl`.
 */
const GRID_CORNERS = [
  'rounded-t-xl md:rounded-tr-sm',
  'md:rounded-tr-xl',
  'md:rounded-bl-xl',
  'rounded-b-xl md:rounded-bl-sm',
]

/**
 * 什麼是開放式議程？ — the intro text under the heading, then one card per
 * format in the style of the other types' intro cards (faded icon in the
 * corner), its example topics listed under the description. The invitation
 * to bring a format of one's own is the last card.
 */
export function OpenSessionIntro({
  title,
  description,
  lead,
  formats,
  more,
}: OpenSessionIntroProps) {
  const cards: {
    title: string
    description: string | string[]
    examples?: string[]
    icon: LucideIcon
  }[] = [...formats, ...(more ? [{ ...more, icon: Sparkles }] : [])]
  const grid = cards.length === 4
  return (
    <SessionSection
      title={title}
      description={[description, lead].filter((text) => text !== undefined)}
    >
      <ul className={cn('grid gap-2.5', grid && 'md:grid-cols-2')}>
        {cards.map(({ title, description: text, examples, icon: Icon }, i) => (
          <li key={title} className="flex">
            <Card
              className={cn(
                'relative flex-1 p-2.5 pb-25',
                grid
                  ? GRID_CORNERS[i]
                  : [
                      i === 0 && 'rounded-t-xl',
                      i === cards.length - 1 && 'rounded-b-xl',
                    ],
              )}
            >
              <Icon
                aria-hidden
                className="absolute -right-5 -bottom-3.75 size-36 -rotate-33 text-light"
              />
              <div className="relative flex flex-col gap-2.5 p-5">
                <h3 className="text-h3 font-bold">{title}</h3>
                {[text].flat().map((paragraph) => (
                  <p key={paragraph} className="text-paragraph">
                    <LinkedText text={paragraph} />
                  </p>
                ))}
                {examples && (
                  <ul className="list-disc ps-7.5 text-paragraph">
                    {examples.map((example) => (
                      <li key={example}>{example}</li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </SessionSection>
  )
}
