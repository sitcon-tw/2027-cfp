import type { ReactNode } from 'react'

export interface PageHeroProps {
  /** Page title, rendered as the page's `<h1>`. */
  title: string
  /** One-line intro under the title. */
  description?: string
  /** Decorative background photo; it fades into the page background. */
  image?: string
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
  children,
}: PageHeroProps) {
  return (
    <>
      <section className="relative isolate px-2.5 pt-header">
        {image && (
          <div aria-hidden className="absolute inset-0 -z-10">
            <img src={image} alt="" className="size-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-b from-black/0 to-background" />
          </div>
        )}
        <div className="mx-auto max-w-content p-2.5 pt-25 md:pt-62.5">
          <div className="flex flex-col gap-2.5 py-2.5">
            <h1 className="text-title font-extrabold">{title}</h1>
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
