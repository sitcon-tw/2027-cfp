import type { ReactNode } from 'react'

import defaultPhoto from '@/assets/session-general.jpg'
import { cn } from '@/lib/utils'

export interface PhotoCtaProps {
  title: string
  /** Link buttons under the title. */
  children: ReactNode
  /** `center` on session pages. */
  align?: 'start' | 'center'
  /** Background photo, dimmed and faded in from the top and out at the bottom. */
  image?: string
  className?: string
}

/**
 * Full-width photo band with a heading and link buttons: 想要在舞臺發光發熱？
 * on session pages, above 參考更多稿件. The photo fades into the page at both
 * edges so the band has no seam against the sections around it.
 */
export function PhotoCta({
  title,
  children,
  align = 'start',
  image = defaultPhoto,
  className,
}: PhotoCtaProps) {
  return (
    <section
      className={cn('relative isolate overflow-hidden px-2.5 py-25', className)}
    >
      <img
        src={image}
        alt=""
        className="absolute inset-0 -z-10 size-full mask-fade-b object-cover object-bottom opacity-40"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-background from-2% to-transparent" />
      <div
        className={cn(
          'mx-auto flex max-w-content flex-col gap-10 p-2.5',
          align === 'center' ? 'items-center text-center' : 'items-start',
        )}
      >
        <h2 className="text-h1 font-extrabold text-balance text-foreground">
          {title}
        </h2>
        <div
          className={cn(
            'flex flex-wrap gap-5',
            align === 'center' && 'justify-center',
          )}
        >
          {children}
        </div>
      </div>
    </section>
  )
}
