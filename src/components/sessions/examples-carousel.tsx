import { Placeholder } from '@/components/placeholder'

export interface ExamplesCarouselProps {
  /** Placeholder label until the section is built. */
  label: string
}

/** Paged 2×2 grid of past sessions: Presentation / Espresso / 投稿範例. */
export function ExamplesCarousel({ label }: ExamplesCarouselProps) {
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder label={label} className="mx-auto max-w-content" />
    </section>
  )
}
