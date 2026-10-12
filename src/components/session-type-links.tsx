import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { SessionTypePhoto } from '@/components/session-type-photo'
import type { SessionType } from '@/lib/session-types'
import { cn } from '@/lib/utils'

/**
 * One card per session type, linking to its session page: icon, title and
 * summary over the type's dimmed photo, with an arrow that nudges on hover.
 * The tiles are joined into one shape by the corner rule: stacked by
 * default (the homepage's 想要成為舞臺上的講者？), or side by side from `md`
 * up with `row` (參考更多稿件).
 */
export function SessionTypeLinks({
  types,
  row = false,
}: {
  types: SessionType[]
  row?: boolean
}) {
  return (
    <ul className={cn('flex flex-col gap-5', row && 'md:flex-row')}>
      {types.map(({ id, title, summary, icon: Icon, intro }, i) => (
        <li key={id} className="flex flex-1">
          <Link
            to="/sessions/$type"
            params={{ type: id }}
            className={cn(
              'group relative isolate flex-1 overflow-clip rounded-sm bg-background px-5 py-4 text-foreground',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
              i === 0 && 'rounded-t-xl',
              i === types.length - 1 && 'rounded-b-xl',
              row && i === 0 && 'md:rounded-l-xl md:rounded-tr-sm',
              row &&
                i === types.length - 1 &&
                'md:rounded-r-xl md:rounded-bl-sm',
            )}
          >
            <SessionTypePhoto
              image={intro.image}
              className="group-hover:scale-105 motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-smooth"
            />
            <div className="flex items-center gap-2.5">
              <Icon aria-hidden className="mx-2.5 size-10 shrink-0" />
              <div className="flex grow flex-col p-2.5">
                <h3 className="text-h3 font-bold">{title}</h3>
                <p className="text-paragraph">{summary}</p>
              </div>
              <ArrowRight
                aria-hidden
                className="mx-2.5 size-10 shrink-0 group-hover:translate-x-1.25 motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-smooth"
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
