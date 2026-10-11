import type { Picture } from 'vite-imagetools'

import content from '@/content.json'
import { PageSection } from '@/components/about/page-section'
import { ResponsiveImage } from '@/components/responsive-image'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const activities = content.about_page.activities

/** Every image in `src/assets/about/activities/`, by file name. */
const photos = Object.fromEntries(
  Object.entries(
    import.meta.glob<Picture>(
      '/src/assets/about/activities/*.{jpg,jpeg,png,webp}',
      { eager: true, import: 'default', query: '?responsive' },
    ),
  ).map(([path, src]) => [path.split('/').pop(), src]),
)

/**
 * 我們舉辦的活動 — a photo and a text card per activity, the photo on
 * alternating sides from `md` up and always on top below it. The pair
 * reads as one shape (outer corners `xl`, inner `sm`).
 */
export function Activities() {
  return (
    <PageSection id="activities" title={activities.title}>
      <ul className="flex flex-col gap-10">
        {activities.items.map(({ title, body, image, alt }, i) => {
          const photoCorners = cn(
            'rounded-t-xl rounded-b-sm',
            i % 2 === 0
              ? 'md:rounded-l-xl md:rounded-r-sm'
              : 'md:rounded-l-sm md:rounded-r-xl',
          )
          return (
            <li
              key={title}
              className={cn(
                'flex flex-col gap-2.5',
                i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse',
              )}
            >
              <div className="relative aspect-video shrink-0 md:aspect-square md:w-2/5">
                <ResponsiveImage
                  image={photos[image]}
                  alt={alt}
                  sizes="(min-width: 48rem) 24rem, 100vw"
                  className={cn(
                    'absolute inset-0 size-full object-cover',
                    photoCorners,
                  )}
                />
              </div>
              <Card
                tone="gray"
                className={cn(
                  'flex flex-1 flex-col gap-5 rounded-t-sm rounded-b-xl p-7.5 md:p-10',
                  i % 2 === 0
                    ? 'md:rounded-l-sm md:rounded-r-xl'
                    : 'md:rounded-l-xl md:rounded-r-sm',
                )}
              >
                <h3 className="text-h3 font-bold">{title}</h3>
                <p className="text-paragraph">{body}</p>
              </Card>
            </li>
          )
        })}
      </ul>
    </PageSection>
  )
}
