import type { ReactNode } from 'react'

import defaultPhoto from '@/assets/session-general.jpg'
import { cn } from '@/lib/utils'

export interface PhotoCtaProps {
  title: string
  /** Link buttons under the title. */
  children: ReactNode
  /** `center` on session pages, `start` on the submission page. */
  align?: 'start' | 'center'
  /** Background photo, dimmed and faded in from the top. */
  image?: string
  className?: string
}

/**
 * Full-width photo band with a heading and link buttons, above the footer:
 * 想要在舞臺發光發熱？ on session pages, 參考更多稿件 on the submission page.
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
        className="absolute inset-0 -z-10 size-full object-cover object-bottom opacity-40"
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
