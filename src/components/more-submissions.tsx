import { useId } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import content from '@/content.json'
import { SessionTypePhoto } from '@/components/session-type-photo'
import { sessionTypes, type SessionTypeId } from '@/lib/session-types'
import { cn } from '@/lib/utils'

const text = content.submit_page

/**
 * 參考更多稿件: one card per other session type, linking to its session
 * page. Ends the submission page, and the session pages after their
 * 想要在舞臺發光發熱？ call to action. Each card is laid out like the homepage's
 * session-type tabs (icon, title and summary) over the type's dimmed photo;
 * side by side from `md` up and stacked below, joined into one shape by the
 * corner rule. The title is a sub-heading (`text-h1`, no rule), like the
 * 想要在舞臺發光發熱？ band it follows, not a full section title.
 */
export function MoreSubmissions({ type }: { type: SessionTypeId }) {
  const others = sessionTypes.filter((other) => other.id !== type)
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="px-2.5 py-15">
      <div className="mx-auto flex max-w-content flex-col gap-5 p-2.5">
        <h2 id={titleId} className="text-h1 font-extrabold text-balance">
          {text.moreSubmissions}
        </h2>
        <ul className="flex gap-5 max-md:flex-col">
          {others.map(({ id, title, summary, icon: Icon, intro }, i) => (
            <li key={id} className="flex flex-1">
              <Link
                to="/sessions/$type"
                params={{ type: id }}
                className={cn(
                  'group relative isolate flex-1 overflow-clip rounded-sm bg-background px-5 py-4 text-foreground',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue',
                  i === 0 && 'rounded-t-xl md:rounded-l-xl md:rounded-tr-sm',
                  i === others.length - 1 &&
                    'rounded-b-xl md:rounded-r-xl md:rounded-bl-sm',
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
      </div>
    </section>
  )
}
