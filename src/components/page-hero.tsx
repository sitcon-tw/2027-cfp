import { useState, type ReactNode } from 'react'
import type { Picture } from 'vite-imagetools'

import { ResponsiveImage } from '@/components/responsive-image'
import { cn } from '@/lib/utils'

/** The hero photo spans the screen. */
export const heroSizes = '100vw'

export interface PageHeroProps {
  /** Page title, rendered as the page's `<h1>`. */
  title: string
  /** One-line intro under the title. */
  description?: string
  /** Decorative background photo; it fades into the page background. */
  image?: Picture
  /**
   * Tiny version of `image` (`?placeholder`), shown blurred until the photo loads, so a new
   * page never shows the previous photo or a blank band.
   */
  placeholder?: string
  /** Rendered under the photo, e.g. the session-page tabs. */
  children?: ReactNode
}

/**
 * Photo header of the session and submission pages: title and intro over a
 * photo that fades into the page. Pads its top with `pt-header` for the
 * overlaid site header.
 */
export function PageHero({
  title,
  description,
  image,
  placeholder,
  children,
}: PageHeroProps) {
  return (
    <>
      <section className="relative isolate px-2.5 pt-header">
        {image && (
          <div aria-hidden className="absolute inset-0 -z-10 overflow-clip">
            {placeholder && (
              <img
                src={placeholder}
                alt=""
                className="absolute inset-0 size-full scale-110 object-cover blur-xl"
              />
            )}
            {/* Keyed by photo: switching pages mounts a fresh image, which
                fades in once loaded instead of swapping in late. */}
            <HeroPhoto key={image.img.src} image={image} />
            <div className="absolute inset-0 bg-linear-to-b from-black/0 to-background" />
          </div>
        )}
        <div className="mx-auto max-w-content p-2.5 pt-25 md:pt-62.5">
          <div className="flex flex-col gap-2.5 py-2.5">
            <h1 className="text-headline font-extrabold text-balance">
              {title}
            </h1>
            {description && <p className="text-paragraph">{description}</p>}
          </div>
        </div>
      </section>
      {children && (
        <div className="px-2.5">
          <div className="mx-auto max-w-content p-2.5">{children}</div>
        </div>
      )}
    </>
  )
}

function HeroPhoto({ image }: { image: Picture }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <ResponsiveImage
      image={image}
      sizes={heroSizes}
      alt=""
      loading="eager"
      fetchPriority="high"
      // A cached photo is complete before `load` can be listened for.
      ref={(img) => {
        if (img?.complete) setLoaded(true)
      }}
      onLoad={() => setLoaded(true)}
      className={cn(
        'absolute inset-0 size-full object-cover transition-opacity duration-500 ease-smooth motion-reduce:transition-none',
        !loaded && 'opacity-0',
      )}
    />
  )
}
