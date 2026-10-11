import { SessionSection } from '@/components/sessions/session-section'
import { Card } from '@/components/ui/card'
import { links } from '@/lib/links'

/** A key of `links.policies`, referenced from `content.json`. */
type PolicyLink = keyof typeof links.policies

/**
 * Text with inline links, kept as data instead of HTML: plain strings, and
 * `{ text, link }` pieces that link to a policy page.
 */
export type RichText = (string | { text: string; link: string })[]

export interface InfoCard {
  title: string
  body: RichText
}

export interface InfoCardStackProps {
  title: string
  items: InfoCard[]
}

/** Stacked dark cards: 投稿前需確認 / 投稿後會做什麼？ */
export function InfoCardStack({ title, items }: InfoCardStackProps) {
  return (
    <SessionSection title={title}>
      <div className="flex flex-col gap-5">
        {items.map((item) => (
          <Card
            key={item.title}
            tone="gray"
            className="flex flex-col gap-5 rounded-xl p-7.5 md:p-10"
          >
            <h3 className="text-h3 font-bold">{item.title}</h3>
            <p className="text-paragraph">
              <RichTextContent value={item.body} />
            </p>
          </Card>
        ))}
      </div>
    </SessionSection>
  )
}

function RichTextContent({ value }: { value: RichText }) {
  return value.map((piece, i) =>
    typeof piece === 'string' ? (
      piece
    ) : (
      <a
        key={i}
        href={links.policies[piece.link as PolicyLink]}
        className="rounded-xs font-bold underline underline-offset-4 hover:text-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
      >
        {piece.text}
      </a>
    ),
  )
}
