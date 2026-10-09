import { Link } from '@tanstack/react-router'

import content from '@/content.json'
import { PhotoWall } from '@/components/home/photo-wall'
import { buttonVariants } from '@/components/ui/button'
import { links } from '@/lib/links'
import { cn } from '@/lib/utils'

const statColors = ['text-red', 'text-blue', 'text-green', 'text-foreground']

/**
 * 甚麼是 SITCON ? — the first thing people arriving from sitcon.org see, so
 * it sells the conference before the attend and speaker sections. Sized
 * past the type scale on purpose (`text-headline`, `text-stat`), with a
 * full-bleed photo wall; the page's `overflow-x-clip` trims it.
 */
export function AboutSection() {
  const about = content.about_section

  return (
    <section
      id="about-sitcon"
      aria-labelledby="about-sitcon-title"
      className="pt-30 pb-17.5"
    >
      <div className="px-2.5">
        <div className="mx-auto flex max-w-content flex-col gap-15 p-2.5">
          <h2 id="about-sitcon-title" className="sr-only">
            {about.title}
          </h2>
          <div className="flex flex-col gap-5">
            <p className="text-headline font-extrabold tracking-tight">
              <span className="block">{about.headline.lead}</span>
              <span className="block text-green">
                {about.headline.emphasis}
              </span>
            </p>
            <p className="text-h1 font-extrabold">{about.tagline}</p>
          </div>
          {/* The numbers back the headline, so they sit right under it
              instead of under a heading of their own. */}
          <dl className="grid gap-x-12.5 gap-y-10 sm:grid-cols-2">
            {about.stats.map(({ value, label }, index) => (
              <div
                key={label}
                className="flex flex-col-reverse justify-end gap-2.5 border-t-2 border-foreground/15 pt-5"
              >
                <dt className="text-lead text-foreground/80">{label}</dt>
                <dd
                  className={cn(
                    'font-numeric text-stat font-bold tracking-tight',
                    statColors[index],
                  )}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <PhotoWall>
        <a
          href={links.social.flickr}
          target="_blank"
          rel="noreferrer"
          className={buttonVariants({ variant: 'muted' })}
        >
          {about.photos}
        </a>
        <Link to={links.about} className={buttonVariants()}>
          {about.about}
        </Link>
      </PhotoWall>
    </section>
  )
}
