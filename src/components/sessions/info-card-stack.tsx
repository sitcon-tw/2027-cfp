import { LinkedText } from '@/components/linked-text'
import { SessionSection } from '@/components/sessions/session-section'
import { Card } from '@/components/ui/card'

export interface InfoCard {
  title: string
  /**
   * Blocks in order: a string is a paragraph, a list of strings a bulleted
   * list. Both may link with `[label](url)`.
   */
  body: (string | string[])[]
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
            {item.body.map((block, i) =>
              typeof block === 'string' ? (
                <p key={i} className="text-paragraph">
                  <LinkedText text={block} />
                </p>
              ) : (
                <ul key={i} className="list-disc ps-7.5 text-paragraph">
                  {block.map((line) => (
                    <li key={line}>
                      <LinkedText text={line} />
                    </li>
                  ))}
                </ul>
              ),
            )}
          </Card>
        ))}
      </div>
    </SessionSection>
  )
}
