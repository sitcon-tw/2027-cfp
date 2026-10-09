import { ChevronDown } from 'lucide-react'

import content from '@/content.json'
import { SessionSection } from '@/components/sessions/session-section'
import type { SessionTypeId } from '@/lib/session-types'
import { cn } from '@/lib/utils'

const text = content.session_page.faq

// The same questions on every page for now; split per type once the
// program team writes type-specific ones.
const faqs: Record<SessionTypeId, typeof text.items> = {
  general: text.items,
  open: text.items,
  demo: text.items,
}

/**
 * Q&A — the session type's questions. Static layout for now: the first
 * question shows its answer as in Figma and the rest are closed bars.
 * TODO: swap in the Accordion primitive once Nathan adds it (#1), so each
 * question toggles and the first starts open.
 */
export function Faq({ type }: { type: SessionTypeId }) {
  const items = faqs[type]
  return (
    <SessionSection title={text.title}>
      <div className="flex flex-col gap-5">
        {items.map(({ question, answer }, i) => {
          const open = i === 0
          return (
            <div key={question} className="flex flex-col gap-2.5">
              <h3
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-7.5 py-5 text-h3 font-bold md:px-12.5',
                  open
                    ? 'rounded-b-sm bg-foreground text-background'
                    : 'bg-gray',
                )}
              >
                <span className="flex-1">{question}</span>
                <ChevronDown
                  aria-hidden
                  className={cn('size-8.75 shrink-0', open && 'rotate-180')}
                />
              </h3>
              {open && (
                <div className="rounded-sm rounded-b-xl bg-foreground px-7.5 py-5 text-paragraph text-background md:px-12.5">
                  {/* TODO: answers other than the first, from the program team. */}
                  {answer || text.pendingAnswer}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </SessionSection>
  )
}
