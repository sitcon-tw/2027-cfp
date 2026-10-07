import { Placeholder } from '@/components/placeholder'

export interface InfoCardStackProps {
  /** Placeholder label until the section is built. */
  label: string
}

/** Stacked dark cards: 投稿前需確認 / 投稿後會做什麼？ */
export function InfoCardStack({ label }: InfoCardStackProps) {
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder label={label} className="mx-auto max-w-content" />
    </section>
  )
}
