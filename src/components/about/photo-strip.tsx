import type { Picture } from 'vite-imagetools'

import content from '@/content.json'
import { ResponsiveImage } from '@/components/responsive-image'
import { cn } from '@/lib/utils'

/*
 * Every image in `src/assets/about/photo-strip/`, in filename order, dealt
 * alternately into the two rows: drop files in the folder to change them.
 */
const photos = Object.entries(
  import.meta.glob<Picture>(
    '/src/assets/about/photo-strip/*.{jpg,jpeg,png,webp}',
    { eager: true, import: 'default', query: '?responsive' },
  ),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, image]) => image)

const rows = [0, 1].map((row) => photos.filter((_, i) => i % 2 === row))

/** How many times a row's photos repeat in one copy of the strip, so a
 *  copy outruns even a very wide screen. */
const cycles = 3

/**
 * Two rows of event photos drifting sideways across the full screen width,
 * at the homepage photo wall's pace. The second row starts half a photo
 * further left, so the rows stagger as in Figma. Hovering pauses both;
 * reduced motion keeps them still. The photos are one decorative image to
 * assistive technology, like the photo wall.
 */
export function PhotoStrip() {
  return (
    <div
      id="photos"
      role="img"
      aria-label={content.about_page.photoStrip.label}
      className="group flex flex-col gap-2.5 overflow-hidden py-7.5"
    >
      {rows.map((row, i) => (
        <div key={i} className={cn(i === 1 && '-ml-32.5 md:-ml-50')}>
          <div className="flex w-max animate-photo-wall group-hover:[animation-play-state:paused] motion-reduce:animate-none">
            {/* Doubled so the -50% loop is seamless. */}
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden className="flex gap-2.5 pr-2.5">
                {Array.from({ length: cycles }, () => row)
                  .flat()
                  .map((image, j) => (
                    <ResponsiveImage
                      key={j}
                      image={image}
                      alt=""
                      // Right under the intro, so in view on load; the
                      // repeats reuse the same files.
                      loading="eager"
                      sizes="(min-width: 48rem) 18.3rem, 11.7rem"
                      className="h-40 w-62.5 shrink-0 rounded-sm object-cover md:h-62 md:w-97.5"
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
