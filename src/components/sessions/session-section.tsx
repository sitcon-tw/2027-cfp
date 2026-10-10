import { useId, type ReactNode } from 'react'

import { SectionHeading } from '@/components/section-heading'

export interface SessionSectionProps {
  title: string
  /** Short text between the rule and the content. */
  description?: string
  /** Content in the column under the heading. */
  children?: ReactNode
  /** Full-width content after the column, e.g. the poster strip. */
  bleed?: ReactNode
}

/**
 * A session-page section: the shared `SectionHeading` (title over a rule),
 * then the content column, laid out like the homepage sections.
 */
export function SessionSection({
  title,
  description,
  children,
  bleed,
}: SessionSectionProps) {
  const titleId = useId()
  return (
    <section aria-labelledby={titleId} className="py-15">
      <div className="px-2.5">
        <div className="mx-auto flex max-w-content flex-col gap-2.5 p-2.5">
          <SectionHeading id={titleId}>{title}</SectionHeading>
          {description && <p className="text-paragraph">{description}</p>}
          {children && <div className="py-2.5">{children}</div>}
        </div>
      </div>
      {bleed}
    </section>
  )
}
