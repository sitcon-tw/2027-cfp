import type { ReactNode } from 'react'
import { ArrowUpRight, Megaphone } from 'lucide-react'
import { siFacebook, siInstagram, siThreads } from 'simple-icons'

import content from '@/content.json'
import { ActionCard } from '@/components/action-card'
import { links } from '@/lib/links'
import { cn } from '@/lib/utils'

const follow = content.community.follow

/** Instagram leads; Threads and Facebook are equal alternatives. */
const platforms = [
  {
    name: content.social.instagram,
    href: links.social.instagram,
    icon: siInstagram,
  },
  { name: content.social.threads, href: links.social.threads, icon: siThreads },
  {
    name: content.social.facebook,
    href: links.social.facebook,
    icon: siFacebook,
  },
]

export interface FollowCardProps {
  /** Extra fine print under the platform tiles. */
  children?: ReactNode
}

/**
 * 持續關注 SITCON — the low-commitment way in, an ActionCard whose
 * platforms are joined tiles (the corner rule) in its text column:
 * Instagram dark as the primary choice, Threads and Facebook light beside
 * it. Not in Figma.
 */
export function FollowCard({ children }: FollowCardProps) {
  return (
    <ActionCard
      icon={Megaphone}
      title={follow.title}
      description={follow.description}
    >
      {/* One shape: stacked on mobile, a row from sm up. */}
      <ul className="flex flex-col gap-2.5 pt-5 sm:flex-row">
        {platforms.map(({ name, href, icon }, i) => (
          <li key={name} className="flex flex-1">
            <a
              href={href}
              className={cn(
                'flex min-h-control-lg flex-1 items-center gap-5 rounded-sm px-5 py-2.5 transition-colors duration-300 ease-smooth focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none',
                i === 0
                  ? 'bg-background text-foreground hover:bg-gray'
                  : 'bg-light text-background hover:bg-background hover:text-foreground',
                i === 0 && 'rounded-t-lg sm:rounded-l-lg sm:rounded-tr-sm',
                i === platforms.length - 1 &&
                  'rounded-b-lg sm:rounded-r-lg sm:rounded-bl-sm',
              )}
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="size-6 shrink-0 fill-current"
              >
                <path d={icon.path} />
              </svg>
              <span className="text-paragraph font-bold">{name}</span>
              <ArrowUpRight aria-hidden className="ml-auto size-5 shrink-0" />
            </a>
          </li>
        ))}
      </ul>
      {children}
    </ActionCard>
  )
}
