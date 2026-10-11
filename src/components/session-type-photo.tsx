import { cn } from '@/lib/utils'

/**
 * A session type's photo, dimmed behind a card's text: the homepage
 * session-type cards and 參考更多稿件. Place it in a `relative isolate` parent.
 */
export function SessionTypePhoto({
  image,
  className,
}: {
  image: string
  /** Extra classes for the photo, e.g. a hover zoom. */
  className?: string
}) {
  return (
    <>
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn(
          'absolute inset-0 -z-10 size-full object-cover',
          className,
        )}
      />
      <div className="absolute inset-0 -z-10 bg-black/70 bg-linear-136 from-black/40 from-18% to-foreground/5 to-91%" />
    </>
  )
}
