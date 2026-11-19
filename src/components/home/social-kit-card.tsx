import { ArrowUpRight } from 'lucide-react'

import content from '@/content.json'
import avatarFrame from '@/assets/social-kit/2027/sitcon-2027-frame.png?responsive'
import avatarPlaceholder from '@/assets/social-kit/2027/placeholder-avatar.png?responsive'
import { ActionCard, cardMediaClassName } from '@/components/action-card'
import { ResponsiveImage } from '@/components/responsive-image'
import { buttonVariants } from '@/components/ui/button'
import { links } from '@/lib/links'
import { cn } from '@/lib/utils'

const kit = content.social_kit

/**
 * 換上 SITCON 2027 — the social kit card in 一起參與 SITCON 社群. Not in
 * Figma: blue, like the Early Bird banner, so it reads as this year's
 * campaign rather than another of the cream ways to take part.
 */
export function SocialKitCard() {
  return (
    <ActionCard
      media={
        <div
          className={cn(
            cardMediaClassName,
            'relative overflow-hidden rounded-full',
          )}
        >
          <ResponsiveImage
            image={avatarPlaceholder}
            sizes="2.25rem"
            alt=""
            className="size-full"
          />
          <ResponsiveImage
            image={avatarFrame}
            sizes="2.25rem"
            alt={kit.avatarAlt}
            className="absolute inset-0 size-full"
          />
        </div>
      }
      title={kit.title}
      description={kit.description}
      className="bg-blue text-foreground"
      descriptionClassName=""
      action={
        <a
          href={links.socialKit}
          className={buttonVariants({
            className:
              'h-auto min-h-control max-w-full py-2.5 text-center whitespace-normal',
          })}
        >
          {kit.action}
          <ArrowUpRight aria-hidden className="size-5 shrink-0" />
        </a>
      }
    />
  )
}
