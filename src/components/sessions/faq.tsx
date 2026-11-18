import { useCallback, useRef, useState } from 'react'

import content from '@/content.json'
import { LinkedText } from '@/components/linked-text'
import { SessionSection } from '@/components/sessions/session-section'
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from '@/components/ui/accordion'

const text = content.session_page.faq

export interface FaqItem {
  question: string
  /** Paragraphs; empty until the program team writes the answer. */
  answer: string[]
}

/** Duration must stay in sync with the 300ms panel transition in accordion.tsx. */
const PANEL_DURATION_MS = 300

/**
 * Q&A — the session type's questions. All items start collapsed.
 *
 * When the user opens an item, we wait for the closing animation of any
 * previously open item to finish, then scroll the newly opened trigger into
 * view so the reader isn't disoriented by the page jumping.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  const [openValues, setOpenValues] = useState<string[]>([])
  const prevOpenRef = useRef<string[]>([])
  // Map from question string → trigger element ref
  const triggerRefs = useRef<Map<string, HTMLElement>>(new Map())

  const handleValueChange = useCallback((value: string[]) => {
    const prev = prevOpenRef.current
    prevOpenRef.current = value
    setOpenValues(value)

    // Find the item that was just opened (present in new but not in old)
    const newlyOpened = value.find((v) => !prev.includes(v))
    if (!newlyOpened) return

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    // Wait for the collapsing animation to finish before scrolling so the
    // layout has settled and the trigger won't jump away again.
    const delay = reducedMotion ? 0 : PANEL_DURATION_MS

    setTimeout(() => {
      const el = triggerRefs.current.get(newlyOpened)
      el?.scrollIntoView({
        behavior: reducedMotion ? 'instant' : 'smooth',
        block: 'nearest',
      })
    }, delay)
  }, [])

  return (
    <SessionSection id="faq" title={text.title}>
      <Accordion value={openValues} onValueChange={handleValueChange}>
        {items.map(({ question, answer }) => (
          <AccordionItem key={question} value={question}>
            <AccordionTrigger
              ref={(el) => {
                if (el) {
                  triggerRefs.current.set(question, el)
                } else {
                  triggerRefs.current.delete(question)
                }
              }}
            >
              {question}
            </AccordionTrigger>
            <AccordionPanel>
              {answer.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  {answer.map((paragraph) => (
                    <p key={paragraph}>
                      <LinkedText text={paragraph} />
                    </p>
                  ))}
                </div>
              ) : (
                text.pendingAnswer
              )}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </SessionSection>
  )
}
