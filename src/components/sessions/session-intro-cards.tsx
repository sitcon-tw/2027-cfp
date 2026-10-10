import { SessionSection } from '@/components/sessions/session-section'
import { Card } from '@/components/ui/card'
import type { IntroCard } from '@/lib/session-pages'
import { cn } from '@/lib/utils'

export interface SessionIntroCardsProps {
  title: string
  cards: IntroCard[]
}

/**
 * 議程種類 / 議程介紹 — one cream card per format of the session type. The
 * cards read as one shape: only the outer corners are `xl`, side by side
 * from `md` up and stacked below.
 */
export function SessionIntroCards({ title, cards }: SessionIntroCardsProps) {
  return (
    <SessionSection title={title}>
      <ul className="flex gap-2.5 max-md:flex-col">
        {cards.map(({ title, description, icon: Icon }, i) => (
          <li key={title} className="flex flex-1">
            <Card
              className={cn(
                'relative flex-1 p-2.5 pb-25',
                i === 0 && 'rounded-t-xl md:rounded-l-xl md:rounded-tr-sm',
                i === cards.length - 1 &&
                  'rounded-b-xl md:rounded-r-xl md:rounded-bl-sm',
              )}
            >
              <Icon
                aria-hidden
                className="absolute -right-5 -bottom-3.75 size-36 -rotate-33 text-light"
              />
              <div className="relative flex flex-col gap-2.5 p-5">
                <h3 className="text-h3 font-bold">{title}</h3>
                <p className="text-paragraph">{description}</p>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </SessionSection>
  )
}
