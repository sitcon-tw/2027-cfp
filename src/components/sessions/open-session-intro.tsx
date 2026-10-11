import { ArrowDown, Sparkles, type LucideIcon } from 'lucide-react'

import { SessionSection } from '@/components/sessions/session-section'
import { Card } from '@/components/ui/card'
import type { IntroCard } from '@/lib/session-pages'
import { cn } from '@/lib/utils'

export interface OpenSessionIntroProps {
  title: string
  /** What 開放式議程 is, in a dark tile on top. */
  description?: string
  /** The tile's closing line, leading into the formats. */
  lead?: string
  /** Formats, each with example topics. */
  formats: IntroCard[]
  /** Closing invitation to bring a format of one's own. */
  more?: { title: string; description: string[] }
}

/**
 * 什麼是開放式議程？ — reads top to bottom like the copy: what the session
 * type is, then one wide card per format with its example topics beside
 * it, and last the invitation to bring a format of one's own. Cards look
 * like the other session types' intro cards (faded icon in the corner) and
 * stack as one shape: only the outer corners are `xl`.
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
  return (
    <SessionSection title={title}>
      <div className="flex flex-col gap-2.5">
        {description && (
          <Card tone="gray" className="rounded-t-xl p-2.5">
            <div className="flex flex-col gap-2.5 p-5">
              <p className="text-paragraph">{description}</p>
              {lead && (
                <p className="text-paragraph font-bold">
                  {lead}
                  <ArrowDown
                    aria-hidden
                    className="ms-1 inline size-6 align-middle"
                  />
                </p>
              )}
            </div>
          </Card>
        )}
        {cards.map(({ title, description: text, examples, icon: Icon }, i) => (
          <Card
            key={title}
            className={cn(
              'relative p-2.5 pb-25',
              i === 0 && !description && 'rounded-t-xl',
              i === cards.length - 1 && 'rounded-b-xl',
            )}
          >
            <Icon
              aria-hidden
              className="absolute -right-5 -bottom-3.75 size-36 -rotate-33 text-light"
            />
            <div className="relative flex flex-col gap-2.5 p-5">
              <h3 className="text-h3 font-bold">{title}</h3>
              <div className="grid gap-5 md:grid-cols-5 md:gap-10">
                <div className="flex flex-col gap-2.5 text-paragraph md:col-span-3">
                  {[text].flat().map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {examples && (
                  <ul className="flex flex-col gap-2.5 md:col-span-2">
                    {examples.map((example) => (
                      <li
                        key={example}
                        className="rounded-sm bg-light px-5 py-2.5 text-paragraph"
                      >
                        {example}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </SessionSection>
  )
}
