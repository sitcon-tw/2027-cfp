import type { ReactNode } from 'react'

import { Placeholder } from '@/components/placeholder'

export interface PageHeroProps {
  /** Placeholder label until the hero is built. */
  label: string
  /** Rendered under the intro, still over the photo (session-page tabs). */
  children?: ReactNode
}

/**
 * Photo and gradient header of the session and submission pages: page title
 * and intro over a photo. Pads its top with `pt-header` for the site header.
 */
export function PageHero({ label, children }: PageHeroProps) {
  return (
    <section className="px-2.5 pt-header pb-7.5">
      <div className="mx-auto flex max-w-content flex-col gap-5">
        <Placeholder label={label} />
        {children}
      </div>
    </section>
  )
}
