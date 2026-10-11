import { SessionSection } from '@/components/sessions/session-section'
import { cn } from '@/lib/utils'

export interface Criterion {
  term: string
  description: string
}

export interface CriteriaTableProps {
  title: string
  items: Criterion[]
}

/**
 * Label and description rows: 審稿標準 / 投稿需要什麼？ The tiles read as one
 * shape: only the outer corners of the whole table are `xl`. Below `md`
 * each label sits right above its description.
 */
export function CriteriaTable({ title, items }: CriteriaTableProps) {
  const last = items.length - 1
  return (
    <SessionSection title={title}>
      <dl className="flex flex-col gap-2.5">
        {items.map(({ term, description }, i) => (
          <div key={term} className="grid gap-2.5 md:grid-cols-3">
            <dt
              className={cn(
                'flex items-center justify-center rounded-sm bg-gray p-5 text-center text-h3 font-bold',
                i === 0 && 'rounded-t-xl md:rounded-tr-sm',
                i === last && 'md:rounded-bl-xl',
              )}
            >
              {term}
            </dt>
            <dd
              className={cn(
                'flex items-center rounded-sm bg-gray p-5 text-paragraph md:col-span-2',
                i === 0 && 'md:rounded-tr-xl',
                i === last && 'rounded-b-xl md:rounded-bl-sm',
              )}
            >
              {description}
            </dd>
          </div>
        ))}
      </dl>
    </SessionSection>
  )
}
