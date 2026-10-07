import { Placeholder } from '@/components/placeholder'

export interface CriteriaTableProps {
  /** Placeholder label until the section is built. */
  label: string
}

/** Label and description rows: 審稿標準 / 投稿需要什麼？ */
export function CriteriaTable({ label }: CriteriaTableProps) {
  return (
    <section className="px-2.5 py-7.5">
      <Placeholder label={label} className="mx-auto max-w-content" />
    </section>
  )
}
