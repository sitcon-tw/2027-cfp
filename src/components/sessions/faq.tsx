import content from '@/content.json'
import { SessionSection } from '@/components/sessions/session-section'
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { SessionTypeId } from '@/lib/session-types'

const text = content.session_page.faq

// The same questions on every page for now; split per type once the
// program team writes type-specific ones.
const faqs: Record<SessionTypeId, typeof text.items> = {
  general: text.items,
  open: text.items,
  demo: text.items,
}

/** Q&A — the session type's questions; the first one starts open. */
export function Faq({ type }: { type: SessionTypeId }) {
  const items = faqs[type]
  return (
    <SessionSection title={text.title}>
      {/* Keyed by type so switching pages resets which question is open. */}
      <Accordion key={type} defaultValue={[0]}>
        {items.map(({ question, answer }, i) => (
          <AccordionItem key={question} value={i}>
            <AccordionTrigger>{question}</AccordionTrigger>
            {/* TODO: answers other than the first, from the program team. */}
            <AccordionPanel>{answer || text.pendingAnswer}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </SessionSection>
  )
}
