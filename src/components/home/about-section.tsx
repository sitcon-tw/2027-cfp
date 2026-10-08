import { Link } from '@tanstack/react-router'

import content from '@/content.json'
import sessionPhoto from '@/assets/session-general.jpg'
import { Placeholder } from '@/components/placeholder'
import { buttonVariants } from '@/components/ui/button'
import { links } from '@/lib/links'
import { cn } from '@/lib/utils'

const statColors = ['text-red', 'text-blue', 'text-green', 'text-foreground']

/**
 * 甚麼是 SITCON ? — the first thing people arriving from sitcon.org see, so
 * it sells the conference before the attend and speaker sections. Sized
 * past the type scale on purpose (`text-headline`, `text-stat`), with
 * full-bleed bands and photo; the page's `overflow-x-clip` trims them.
 */
export function AboutSection() {
  const about = content.about_section

  return (
    <section
      id="about-sitcon"
      aria-labelledby="about-sitcon-title"
      className="pt-30 pb-15"
    >
      <div className="px-2.5">
        <div className="mx-auto flex max-w-content flex-col gap-10 p-2.5">
          <h2 id="about-sitcon-title" className="sr-only">
            {about.title}
          </h2>
          {/* Headline, tagline and description read top to bottom as one
              block. */}
          <div className="flex flex-col gap-5">
            <p className="text-headline font-extrabold tracking-tight">
              <span className="block">{about.headline.lead}</span>
              <span className="block text-green">
                {about.headline.emphasis}
              </span>
            </p>
            <p className="text-h1 font-extrabold">{about.tagline}</p>
          </div>
          <p className="text-paragraph text-foreground/80">
            {about.description}
          </p>
        </div>
      </div>

      <TopicBands topics={about.topics} />

      <div className="px-2.5">
        <div className="mx-auto flex max-w-content flex-col gap-10 p-2.5">
          <h3 className="text-h1 font-extrabold">{about.statsTitle}</h3>
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

      <figure className="relative isolate mt-25 flex aspect-4/3 items-end md:aspect-21/9">
        {/* The mask fades photo and tint into the page at both edges; the
            tint darkens the photo under the quote. */}
        <div className="absolute inset-0 -z-10 mask-fade-y">
          <img
            src={sessionPhoto}
            alt={about.photoAlt}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-background/30 via-background/40 to-background/80" />
        </div>
        <figcaption className="w-full px-2.5 pb-10">
          <p className="mx-auto max-w-content p-2.5 text-display font-extrabold text-balance">
            {about.photoQuote}
          </p>
        </figcaption>
      </figure>

      <div className="px-2.5">
        <div className="mx-auto flex max-w-content flex-col gap-7.5 p-2.5">
          <Placeholder
            label={about.speakersPlaceholder}
            className="rounded-xl"
          />
          <div className="flex flex-wrap justify-end gap-5">
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
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Two crossing full-bleed bands, like the sponsor section's torn edge: a
 * green ticker of topics over a faint blue one scrolling the other way.
 * Decorative; the topics are also listed for screen readers once.
 */
function TopicBands({ topics }: { topics: string[] }) {
  return (
    <div className="relative my-25 py-5">
      <p className="sr-only">
        {topics.join(content.about_section.topicsSeparator)}
      </p>
      <Band
        topics={topics}
        reverse
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 -rotate-3 bg-blue/40 text-foreground/60"
      />
      <Band
        topics={topics}
        className="relative rotate-2 bg-green text-background shadow-2xl"
      />
    </div>
  )
}

function Band({
  topics,
  reverse = false,
  className,
}: {
  topics: string[]
  reverse?: boolean
  className: string
}) {
  return (
    // -mx keeps the rotated band's ends past the screen edges.
    <div aria-hidden className={cn('-mx-12.5 overflow-hidden py-4', className)}>
      <div
        className={cn(
          'flex w-max animate-marquee motion-reduce:animate-none',
          reverse && '[animation-direction:reverse]',
        )}
      >
        {/* Doubled so the -50% loop is seamless. */}
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0">
            {topics.map((topic) => (
              <li
                key={topic}
                className="flex items-center gap-7.5 pr-7.5 text-h1 font-extrabold whitespace-nowrap"
              >
                {topic}
                <span className="size-3 rounded-full bg-current" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
