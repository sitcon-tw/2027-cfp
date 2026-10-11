import content from '@/content.json'
import { cn } from '@/lib/utils'

export interface Share {
  label: string
  count: number
  /** Share of all registrations, 0–100. */
  percent: number
}

/*
 * Slice colors, one entry per slice in data order. Categorical groups take
 * the brand hues in a fixed order, arranged so the slices that touch stay
 * apart under color blindness (checked with the dataviz palette
 * validator); the neutral `light` is last, for 其他. An ordinal scale
 * (none → advanced) is one hue, faint to full.
 */
const palettes = {
  categorical: [
    'fill-blue bg-blue',
    'fill-yellow bg-yellow',
    'fill-red bg-red',
    'fill-green bg-green',
    'fill-light bg-light',
  ],
  ordinal: [
    'fill-blue/30 bg-blue/30',
    'fill-blue/45 bg-blue/45',
    'fill-blue/60 bg-blue/60',
    'fill-blue/75 bg-blue/75',
    'fill-blue/90 bg-blue/90',
    'fill-blue bg-blue',
  ],
}

export type PieScale = keyof typeof palettes

export interface PieChartProps {
  title: string
  items: Share[]
  scale: PieScale
}

/** A point on the unit circle, `turn` turns clockwise from 12 o'clock. */
function point(turn: number) {
  const angle = turn * 2 * Math.PI
  return `${Math.sin(angle)} ${-Math.cos(angle)}`
}

/**
 * Part-to-whole as a pie, with a legend that prints every group's share
 * and head count, so it doubles as the table view and color is never the
 * only cue. Slices are parted by a thin line of the card's color.
 */
export function PieChart({ title, items, scale }: PieChartProps) {
  const total = items.reduce((sum, { percent }) => sum + percent, 0)
  const colors = palettes[scale]
  // Where each slice ends, in turns: the running total of the shares.
  const ends = items.map(
    (_, i) =>
      items.slice(0, i + 1).reduce((sum, { percent }) => sum + percent, 0) /
      total,
  )
  const slices = items.map(({ label }, i) => {
    const start = i === 0 ? 0 : ends[i - 1]
    const end = ends[i]
    const large = end - start > 0.5 ? 1 : 0
    const d = `M 0 0 L ${point(start)} A 1 1 0 ${large} 1 ${point(end)} Z`
    return { label, d, color: colors[i % colors.length] }
  })

  return (
    <div className="flex flex-col items-center gap-7.5 sm:flex-row">
      <svg
        viewBox="-1.02 -1.02 2.04 2.04"
        role="img"
        aria-label={content.about_page.review.chartLabel.replace(
          '{title}',
          title,
        )}
        className="size-60 shrink-0"
      >
        {slices.map(({ label, d, color }) => (
          <path
            key={label}
            d={d}
            className={cn('stroke-gray', color)}
            strokeWidth={2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      <ul className="flex w-full flex-col gap-2.5 text-body">
        {items.map(({ label, count, percent }, i) => (
          <li key={label} className="flex items-baseline gap-2.5">
            <span
              aria-hidden
              className={cn(
                'size-3 shrink-0 translate-y-0.5 rounded-xs',
                colors[i % colors.length],
              )}
            />
            <span className="flex-1">{label}</span>
            <span className="shrink-0 text-light">
              <span className="font-numeric font-medium text-foreground">
                {percent.toFixed(1)}%
              </span>{' '}
              {content.about_page.review.count.replace(
                '{count}',
                count.toLocaleString('en-US'),
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
