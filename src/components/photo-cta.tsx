import { Placeholder } from '@/components/placeholder'

export interface PhotoCtaProps {
  /** Placeholder label until the CTA is built. */
  label: string
}

/**
 * Full-width photo band with a heading and link buttons, above the footer:
 * 想要在舞臺發光發熱？ on session pages, 參考更多稿件 on the submission page.
 */
export function PhotoCta({ label }: PhotoCtaProps) {
  return (
    <section className="px-2.5 py-15">
      <Placeholder label={label} className="mx-auto max-w-content" />
    </section>
  )
}
