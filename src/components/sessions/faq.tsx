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

/**
 * Q&A — the session type's questions. The first one starts open, as in
 * Figma.
 */
export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <SessionSection title={text.title}>
      <Accordion defaultValue={[items[0]?.question]}>
        {items.map(({ question, answer }) => (
          <AccordionItem key={question} value={question}>
            <AccordionTrigger>{question}</AccordionTrigger>
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
