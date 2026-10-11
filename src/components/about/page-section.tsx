import type { ReactNode } from 'react'

export interface PageSectionProps {
  /** Stable anchor for the section, also used for its heading's id. */
  id: string
  title: string
  children: ReactNode
}

/**
 * A dark `/about` section: heading, then the content in the shared column.
 * The headings carry no rule here, unlike the homepage's `SectionHeading`.
 */
export function PageSection({ id, title, children }: PageSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="px-2.5 py-15">
      <div className="mx-auto flex max-w-content flex-col gap-2.5 p-2.5">
        <h2 id={`${id}-title`} className="text-h1 font-extrabold text-balance">
          {title}
        </h2>
        <div className="pt-7.5">{children}</div>
      </div>
    </section>
  )
}
