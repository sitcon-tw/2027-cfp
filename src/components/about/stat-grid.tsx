import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface Stat {
  label: string
  value: string
  unit: string
}

export interface StatGridProps {
  stats: Stat[]
  className?: string
}

/**
 * Gray stat cards: the label as a title, then the number over its unit.
 * The column count is the caller's (`className`).
 */
export function StatGrid({ stats, className }: StatGridProps) {
  return (
    <dl className={cn('grid gap-5', className)}>
      {stats.map(({ label, value, unit }) => (
        <Card
          key={label}
          tone="gray"
          className="flex flex-col gap-1 rounded-lg p-5"
        >
          <dt className="text-h3 font-bold">{label}</dt>
          <dd className="flex items-baseline gap-1.5 text-paragraph">
            <span className="font-numeric text-h2 font-medium">{value}</span>
            <span>{unit}</span>
          </dd>
        </Card>
      ))}
    </dl>
  )
}
