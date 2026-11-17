import { ArrowUpRight } from 'lucide-react'

import content from '@/content.json'
import avatarFrame from '@/assets/social-kit/2027/sitcon-2027-frame.png?responsive'
import avatarPlaceholder from '@/assets/social-kit/2027/placeholder-avatar.png?responsive'
import { ResponsiveImage } from '@/components/responsive-image'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { links } from '@/lib/links'

const kit = content.social_kit

/**
 * 換上 SITCON 2027 — the social kit card in 一起參與 SITCON 社群. Not in
 * Figma: blue, like the Early Bird banner, so it reads as this year's
 * campaign rather than another of the cream ways to take part.
 */
export function SocialKitCard() {
  return (
    <Card className="flex flex-col items-start gap-5 rounded-xl bg-blue p-7.5 text-foreground md:flex-row md:items-center md:gap-7.5">
      <div className="relative size-25 shrink-0 overflow-hidden rounded-full">
        <ResponsiveImage
          image={avatarPlaceholder}
          sizes="4.6875rem"
          alt=""
          className="size-full"
        />
        <ResponsiveImage
          image={avatarFrame}
          sizes="4.6875rem"
          alt={kit.avatarAlt}
          className="absolute inset-0 size-full"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <h3 className="text-h3 font-bold">{kit.title}</h3>
        <p className="text-paragraph">{kit.description}</p>
      </div>
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
    </Card>
  )
}
