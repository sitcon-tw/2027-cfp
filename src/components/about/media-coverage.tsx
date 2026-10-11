import type { Picture } from 'vite-imagetools'

import content from '@/content.json'
import { PageSection } from '@/components/about/page-section'
import { ResponsiveImage } from '@/components/responsive-image'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const media = content.about_page.media

/*
 * Every image in `src/assets/about/media/`, by file name: screenshots of
 * the articles, taken the way the 2027 sponsorship prospectus takes them
 * (sitcon-tw/2027-cfs `scripts/capture-news.cjs`): the real article with
 * the rest of the page hidden.
 */
const images = Object.fromEntries(
  Object.entries(
    import.meta.glob<Picture>('/src/assets/about/media/*.{jpg,jpeg,png,webp}', {
      eager: true,
      import: 'default',
      query: '?responsive',
    }),
  ).map(([path, src]) => [path.split('/').pop(), src]),
)

/**
 * 媒體報導 — a card per article: a screenshot of it, its title and outlet,
 * and a link out. The screenshot repeats the title, so it is decorative.
 */
export function MediaCoverage() {
  return (
    <PageSection id="media" title={media.title}>
      <ul className="grid gap-10 md:grid-cols-2">
        {media.items.map(({ title, source, href, image }) => (
          <li key={href} className="flex">
            <Card tone="gray" className="flex flex-1 flex-col rounded-xl">
              <ResponsiveImage
                image={images[image]}
                alt=""
                sizes="(min-width: 48rem) 29rem, 100vw"
                className="aspect-video w-full object-cover object-top"
              />
              <div className="flex flex-1 flex-col gap-5 p-7.5 md:p-10">
                <h3 className="text-h3 font-bold">{title}</h3>
                <p className="text-paragraph">{source}</p>
                {/* Pinned to the bottom, so a long title pushes the card
                    taller instead of crowding the button. */}
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={media.actionLabel
                    .replace('{title}', title)
                    .replace('{source}', source)}
                  className={buttonVariants({
                    className: 'mt-auto self-end rounded-br-xs',
                  })}
                >
                  {media.action}
                </a>
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </PageSection>
  )
}
