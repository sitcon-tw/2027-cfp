import type { ReactNode } from 'react'

import content from '@/content.json'
import sessionPhoto from '@/assets/session-general.jpg'
import { cn } from '@/lib/utils'

/*
 * Photos from past conferences. Drop files into `src/assets/photo-wall/`;
 * they fill the tiles in filename order, and the large tiles take every
 * module's first photo, so name the most striking crowd shots to sort
 * first (`01-…`, `02-…`). Until the folder has photos, the one session
 * photo stands in at different crops so the layout can be judged.
 */
const wallPhotos = Object.entries(
  import.meta.glob<string>('/src/assets/photo-wall/*.{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, src]) => src)

const fallbackCrops = [
  'object-center',
  'object-left',
  'object-right-top',
  'object-bottom',
  'object-left-bottom',
  'object-top',
  'object-right',
]

/*
 * The strip is a row of bento modules, each a 3-row grid. Large tiles
 * (2 × 2) come by at a steady rhythm between smaller, wide and tall ones,
 * so the wall never reads as a uniform grid; they sit in the upper rows,
 * clear of the quote. `aspect` matches the module's columns to its 3 rows,
 * keeping cells near square. Each module lists its large or wide tile
 * first.
 */
const modules = [
  {
    aspect: 'aspect-square grid-cols-3',
    tiles: [
      'col-span-2 col-start-1 row-span-2 row-start-1',
      'col-start-3 row-start-1',
      'col-start-3 row-start-2',
      'col-span-2 col-start-1 row-start-3',
      'col-start-3 row-start-3',
    ],
  },
  {
    aspect: 'aspect-2/3 grid-cols-2',
    tiles: [
      'col-span-2 col-start-1 row-start-1',
      'col-start-1 row-start-2',
      'col-start-2 row-span-2 row-start-2',
      'col-start-1 row-start-3',
    ],
  },
  {
    aspect: 'aspect-square grid-cols-3',
    tiles: [
      'col-span-2 col-start-2 row-span-2 row-start-1',
      'col-start-1 row-start-1',
      'col-start-1 row-span-2 row-start-2',
      'col-span-2 col-start-2 row-start-3',
    ],
  },
]

/** How many times the module sequence repeats in one copy of the strip,
 *  so a copy outruns even a very wide screen. */
const cycles = 2

/**
 * 每年三月 — a full-bleed wall of photos from past conferences drifting
 * sideways like the topic bands, slow enough that visitors can spot people
 * they know. Hovering pauses it. The quote and `children` (the section's
 * links) sit on the darkened bottom edge.
 */
export function PhotoWall({ children }: { children?: ReactNode }) {
  const about = content.about_section
  let photoIndex = 0

  const strip = Array.from({ length: cycles }, () => modules).flat()
  const layout = strip.map(({ aspect, tiles }) => ({
    aspect,
    tiles: tiles.map((placement) => {
      const index = photoIndex++
      return wallPhotos.length > 0
        ? { placement, src: wallPhotos[index % wallPhotos.length], crop: '' }
        : {
            placement,
            src: sessionPhoto,
            crop: fallbackCrops[index % fallbackCrops.length],
          }
    }),
  }))

  return (
    <div className="group relative mt-25">
      <div
        role="img"
        aria-label={about.photoWallLabel}
        className="relative h-180 overflow-hidden md:h-225"
      >
        <div className="flex h-full w-max animate-photo-wall group-hover:[animation-play-state:paused] motion-reduce:animate-none">
          {/* Doubled so the -50% loop is seamless. */}
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden className="flex h-full gap-2.5 pr-2.5">
              {layout.map(({ aspect, tiles }, moduleIndex) => (
                <div
                  key={moduleIndex}
                  className={cn('grid h-full grid-rows-3 gap-2.5', aspect)}
                >
                  {tiles.map(({ placement, src, crop }, tileIndex) => (
                    <img
                      key={tileIndex}
                      src={src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        'size-full rounded-sm object-cover',
                        placement,
                        crop,
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Darkens the photos under the quote and links. */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent from-25% via-background/50 via-60% to-background/85" />
      </div>
      {/* Click-through except on the links, so hovering anywhere over the
          wall still pauses it. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 px-2.5">
        <div className="mx-auto flex max-w-content flex-col gap-5 p-2.5 pb-7.5 md:flex-row md:items-end md:justify-between">
          <p className="text-display font-extrabold text-balance">
            {about.photoQuote}
          </p>
          <div className="pointer-events-auto flex shrink-0 flex-wrap gap-2.5 md:gap-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
