import type { ComponentProps } from 'react'
import type { Picture } from 'vite-imagetools'

export type ResponsiveImageProps = Omit<
  ComponentProps<'img'>,
  'src' | 'srcSet' | 'sizes' | 'width' | 'height' | 'className'
> & {
  /** An image imported with `?responsive`. */
  image: Picture
  /**
   * How wide the image renders, so the browser picks the right width:
   * e.g. `100vw` for a full-bleed photo.
   */
  sizes: string
  className?: string
}

/**
 * A photo as a `<picture>` with AVIF and WebP at several widths, made at
 * build time by vite-imagetools. Lazy by default; pass `loading="eager"`
 * and `fetchPriority="high"` for the photo at the top of a page. The
 * `<picture>` is `display: contents`, so `className` lays out the `<img>`
 * as if it stood alone (grid placement, absolute fill, …).
 */
export function ResponsiveImage({
  image,
  sizes,
  className,
  loading = 'lazy',
  decoding = 'async',
  ref,
  ...props
}: ResponsiveImageProps) {
  const src = image.img.src
  return (
    <picture className="contents">
      {Object.entries(image.sources).map(([format, srcSet]) => (
        <source
          key={format}
          type={`image/${format}`}
          srcSet={srcSet}
          sizes={sizes}
        />
      ))}
      <img
        // `src` is set once the <img> is inside the <picture>: React sets
        // attributes before attaching an element, and Safari would start
        // downloading the fallback right away, then the <source> pick too.
        ref={(img) => {
          if (img && img.getAttribute('src') !== src) img.src = src
          if (typeof ref === 'function') return ref(img)
          if (ref) ref.current = img
        }}
        width={image.img.w}
        height={image.img.h}
        loading={loading}
        decoding={decoding}
        className={className}
        {...props}
      />
    </picture>
  )
}
