import type { Picture } from 'vite-imagetools'

import { ResponsiveImage } from '@/components/responsive-image'
import { cn } from '@/lib/utils'

/**
 * A session type's photo, dimmed behind a card's text: the homepage
 * session-type cards and 參考更多稿件. Place it in a `relative isolate` parent.
 */
export function SessionTypePhoto({
  image,
  className,
}: {
  image: Picture
  /** Extra classes for the photo, e.g. a hover zoom. */
  className?: string
}) {
  return (
    <>
      <ResponsiveImage
        image={image}
        // At most the content column wide.
        sizes="(min-width: 60.625rem) 60.625rem, 100vw"
        alt=""
        className={cn(
          'absolute inset-0 -z-10 size-full object-cover',
          className,
        )}
      />
      <div className="absolute inset-0 -z-10 bg-black/70 bg-linear-136 from-black/40 from-18% to-foreground/5 to-91%" />
    </>
  )
}
