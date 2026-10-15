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
  /**
   * Titles and intros of the sibling pages that share this hero (the session
   * types). The text block reserves the height of the tallest one, so
   * switching between them keeps the photo's size and `children` in place.
   */
  reserve?: { title: string; description?: string }[]
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
  reserve = [],
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
          {/* The reserved texts are stacked invisibly in the same cell. */}
          <div className="grid py-2.5">
            <div className="col-start-1 row-start-1 flex flex-col gap-2.5">
              <h1 className={titleClass}>{title}</h1>
              {description && <p className="text-paragraph">{description}</p>}
            </div>
            {reserve.map((text) => (
              <div
                key={text.title}
                aria-hidden
                className="invisible col-start-1 row-start-1 flex flex-col gap-2.5"
              >
                <p className={titleClass}>{text.title}</p>
                {text.description && (
                  <p className="text-paragraph">{text.description}</p>
                )}
              </div>
            ))}
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

const titleClass = 'text-headline font-extrabold text-balance'

function HeroPhoto({ image }: { image: Picture }) {
  const [loaded, setLoaded] = useState(import.meta.env.SSR)
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
