import type { Picture } from 'vite-imagetools'

import content from '@/content.json'
import { ResponsiveImage } from '@/components/responsive-image'
import { SessionSection } from '@/components/sessions/session-section'
import { cn } from '@/lib/utils'

const text = content.session_page.demoVenue
const alts: Record<string, string> = text.photos

/** Every image in `src/assets/demo-venue/`, in filename order. */
const photos = Object.entries(
  import.meta.glob<Picture>('/src/assets/demo-venue/*.{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default',
    query: '?responsive',
  }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([path, image]) => ({
    image,
    alt: alts[path.split('/').pop() ?? ''] ?? '',
  }))

/**
 * Layout of photo `i` of `count`. The first photo spans the top; the rest
 * follow in pairs, and an odd one out spans its row. By the corner rule the
 * tiles read as one shape, so only its outer corners are `xl`.
 */
function tile(i: number, count: number) {
  const rest = count - 1
  const j = i - 1
  const lastRow = rest - (rest % 2 === 1 ? 1 : 2)
  const wide = i === 0 || (rest % 2 === 1 && j === rest - 1)
  return {
    wide,
    corners: cn(
      'rounded-sm',
      i === 0 && 'rounded-t-xl',
      i === count - 1 && wide && 'rounded-b-xl',
      !wide && j === lastRow && 'rounded-bl-xl',
      !wide && j === lastRow + 1 && 'rounded-br-xl',
    ),
  }
}

/**
 * 歷年展區照片 — past Demo exhibits: one wide photo over a pair, uncropped
 * at the photos' own 3:2.
 */
export function VenuePhotos() {
  return (
    <SessionSection title={text.title}>
      <div className="grid grid-cols-2 gap-5">
        {photos.map(({ image, alt }, i) => {
          const { wide, corners } = tile(i, photos.length)
          // A cell of its own: the `<picture>` is `display: contents`, so
          // its `<source>`s would take grid cells too.
          return (
            <div key={i} className={cn(wide && 'col-span-2')}>
              <ResponsiveImage
                image={image}
                alt={alt}
                sizes={
                  wide
                    ? '(min-width: 61rem) 58rem, 100vw'
                    : '(min-width: 61rem) 29rem, 50vw'
                }
                className={cn('aspect-3/2 w-full object-cover', corners)}
              />
            </div>
          )
        })}
      </div>
    </SessionSection>
  )
}
