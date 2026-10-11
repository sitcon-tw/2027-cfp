import { useEffect, useRef } from 'react'
import type { PointerEvent, ReactNode } from 'react'

import content from '@/content.json'
import sessionPhoto from '@/assets/session-general.jpg'
import { cn } from '@/lib/utils'

/*
 * Photos from past conferences. Organizers only drop image files into
 * `src/assets/photo-wall/`; every file there is put on the wall
 * automatically, in filename order. To make some of them show large, list
 * their file names in `about_section.photoWallLarge` in `content.json`
 * (they take the large tiles in that order and repeat if there are more
 * tiles than names). Until the folder has photos, the one session photo
 * stands in at different crops so the layout can be judged.
 */
const wallPhotos = Object.entries(
  import.meta.glob<string>('/src/assets/photo-wall/*.{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src]) => ({ name: path.split('/').pop(), src }))

const largePhotos = content.about_section.photoWallLarge.flatMap((name) =>
  wallPhotos.filter((photo) => photo.name === name),
)
const smallPhotos = wallPhotos.filter((photo) => !largePhotos.includes(photo))

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
 * keeping cells near square. `large` tiles take the photos listed in
 * `photoWallLarge`; the others take the rest in filename order.
 */
const modules = [
  {
    aspect: 'aspect-square grid-cols-3',
    tiles: [
      {
        large: true,
        placement: 'col-span-2 col-start-1 row-span-2 row-start-1',
      },
      { placement: 'col-start-3 row-start-1' },
      { placement: 'col-start-3 row-start-2' },
      { placement: 'col-span-2 col-start-1 row-start-3' },
      { placement: 'col-start-3 row-start-3' },
    ],
  },
  {
    aspect: 'aspect-2/3 grid-cols-2',
    tiles: [
      { placement: 'col-span-2 col-start-1 row-start-1' },
      { placement: 'col-start-1 row-start-2' },
      { placement: 'col-start-2 row-span-2 row-start-2' },
      { placement: 'col-start-1 row-start-3' },
    ],
  },
  {
    aspect: 'aspect-square grid-cols-3',
    tiles: [
      {
        large: true,
        placement: 'col-span-2 col-start-2 row-span-2 row-start-1',
      },
      { placement: 'col-start-1 row-start-1' },
      { placement: 'col-start-1 row-span-2 row-start-2' },
      { placement: 'col-span-2 col-start-2 row-start-3' },
    ],
  },
]

/** How many times the module sequence repeats in one copy of the strip,
 *  so a copy outruns even a very wide screen. */
const cycles = 2

/** Time constant of the spotlight gliding between photos, in ms: it covers
 *  ~63% of the way in this time and eases in, at any frame rate. */
const spotlightLag = 120

/**
 * Spotlight for the photo wall: the hovered photo glows. A shade
 * (`spotlight-shade`) leaves the photo clear and darkens the wall along a
 * blur past its edges, so light spills out, and a blurred cream bloom
 * over the photo fades across its edges without a seam. Both read
 * the photo's box from `--spotlight-*`. Moving to another photo glides and reshapes that box on
 * an exponential ease, written straight to the style so the wall never
 * re-renders. Mouse only; reduced motion jumps instead of gliding.
 */
function useSpotlight() {
  const ref = useRef<HTMLDivElement>(null)
  const motion = useRef({
    current: [0, 0, 0, 0],
    target: [0, 0, 0, 0],
    time: 0,
    frame: 0,
  })

  useEffect(() => () => cancelAnimationFrame(motion.current.frame), [])

  function paint() {
    const [left, top, width, height] = motion.current.current
    const style = ref.current?.style
    style?.setProperty('--spotlight-left', `${left}px`)
    style?.setProperty('--spotlight-top', `${top}px`)
    style?.setProperty('--spotlight-width', `${width}px`)
    style?.setProperty('--spotlight-height', `${height}px`)
  }

  function step(time: number) {
    const m = motion.current
    const ease = 1 - Math.exp(-(time - m.time) / spotlightLag)
    m.time = time
    m.current = m.current.map(
      (value, i) => value + (m.target[i] - value) * ease,
    )
    paint()
    const settled = m.current.every(
      (value, i) => Math.abs(m.target[i] - value) < 0.5,
    )
    m.frame = settled ? 0 : requestAnimationFrame(step)
  }

  function onPointerOver(event: PointerEvent<HTMLElement>) {
    const layer = ref.current
    const photo = event.target
    if (event.pointerType !== 'mouse' || !layer) return
    if (!(photo instanceof HTMLImageElement)) return
    const wall = layer.getBoundingClientRect()
    const rect = photo.getBoundingClientRect()
    const m = motion.current
    m.target = [
      rect.left - wall.left,
      rect.top - wall.top,
      rect.width,
      rect.height,
    ]
    // The first photo is lit in place while the layer fades in; after
    // that the spotlight glides from photo to photo.
    const jump =
      !('active' in layer.dataset) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    if (jump) {
      cancelAnimationFrame(m.frame)
      m.frame = 0
      m.current = [...m.target]
      paint()
    } else if (!m.frame) {
      m.time = performance.now()
      m.frame = requestAnimationFrame(step)
    }
    layer.dataset.active = ''
  }

  function onPointerLeave() {
    delete ref.current?.dataset.active
  }

  return { ref, handlers: { onPointerOver, onPointerLeave } }
}

/**
 * 每年三月 — a full-bleed wall of photos from past conferences drifting
 * sideways, slow enough that visitors can spot people
 * they know. Hovering pauses it and puts a spotlight on the photo under
 * the mouse. The quote and `children` (the section's links)
 * sit on the darkened bottom edge.
 */
export function PhotoWall({ children }: { children?: ReactNode }) {
  const about = content.about_section
  const { ref: spotlightRef, handlers: spotlightHandlers } = useSpotlight()
  let photoIndex = 0
  let largeIndex = 0
  let smallIndex = 0

  // Large tiles prefer the listed photos and small ones the rest, each
  // falling back to the whole set when its own pool is empty.
  const pick = (pool: typeof wallPhotos, index: number) =>
    (pool.length > 0 ? pool : wallPhotos)[
      index % (pool.length > 0 ? pool.length : wallPhotos.length)
    ].src

  const strip = Array.from({ length: cycles }, () => modules).flat()
  const layout = strip.map(({ aspect, tiles }) => ({
    aspect,
    tiles: tiles.map(({ placement, ...tile }) => {
      const index = photoIndex++
      if (wallPhotos.length === 0) {
        return {
          placement,
          src: sessionPhoto,
          crop: fallbackCrops[index % fallbackCrops.length],
        }
      }
      const src =
        'large' in tile
          ? pick(largePhotos, largeIndex++)
          : pick(smallPhotos, smallIndex++)
      return { placement, src, crop: '' }
    }),
  }))

  return (
    <div className="group relative mt-32.5" {...spotlightHandlers}>
      <div
        role="img"
        aria-label={about.photoWallLabel}
        className="relative h-180 overflow-hidden mask-fade-b md:h-225"
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
        <div
          ref={spotlightRef}
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 ease-smooth data-active:opacity-100"
        >
          <div className="spotlight-shade" />
          <div className="absolute top-(--spotlight-top) left-(--spotlight-left) h-(--spotlight-height) w-(--spotlight-width) bg-foreground/10 blur-2xl" />
        </div>
        {/* Darkens the photos under the quote and links. */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent from-25% via-background/50 via-60% to-background/85" />
      </div>
      {/* Click-through except on the links, so hovering anywhere over the
          wall still pauses it and spotlights the photo underneath. */}
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
