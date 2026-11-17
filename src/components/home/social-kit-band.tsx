import { ArrowUpRight } from 'lucide-react'

import content from '@/content.json'
import avatarFrame from '@/assets/social-kit/2027/sitcon-2027-frame.png?responsive'
import avatarPlaceholder from '@/assets/social-kit/2027/placeholder-avatar.png?responsive'
import lineBackground from '@/assets/social-kit/2027/line-background.png?responsive'
import { ResponsiveImage } from '@/components/responsive-image'
import { buttonVariants } from '@/components/ui/button'
import { links } from '@/lib/links'

const kit = content.social_kit

/**
 * 換上 SITCON 2027 — the social kit campaign, a full-bleed band between the
 * cream 42 essay and the cream footer. Not in Figma: it borrows the kit's own
 * artwork so it reads as a campaign of its own rather than part of the
 * essay or of 一起參與 SITCON 社群. The LINE background is cropped to its
 * centre, the 42 vortex, which leaves its baked-in title out of frame.
 */
export function SocialKitBand() {
  return (
    <section
      id="social-kit"
      aria-labelledby="social-kit-title"
      className="relative isolate overflow-clip bg-background px-2.5 py-20 text-foreground"
    >
      <ResponsiveImage
        image={lineBackground}
        sizes="(min-width: 48rem) 67vw, 100vw"
        alt=""
        className="absolute inset-x-0 top-0 -z-20 h-80 w-full object-cover md:inset-y-0 md:right-0 md:left-auto md:h-full md:w-2/3"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 -z-10 h-80 bg-linear-to-b from-transparent from-30% to-background md:inset-y-0 md:h-auto md:bg-linear-to-r md:from-background md:from-35% md:via-background/40 md:via-55% md:to-transparent"
      />
      <div className="mx-auto max-w-content p-2.5 pt-40 md:pt-2.5">
        <div className="flex flex-col items-start gap-5 md:w-1/2">
          <div className="relative size-30 shrink-0 overflow-hidden rounded-full">
            <ResponsiveImage
              image={avatarPlaceholder}
              sizes="5.625rem"
              alt=""
              className="size-full"
            />
            <ResponsiveImage
              image={avatarFrame}
              sizes="5.625rem"
              alt={kit.avatarAlt}
              className="absolute inset-0 size-full"
            />
          </div>
          <h2
            id="social-kit-title"
            tabIndex={-1}
            className="text-display font-extrabold text-balance focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            {kit.title}
          </h2>
          <p className="text-paragraph">{kit.description}</p>
          <a
            href={links.socialKit}
            className={buttonVariants({
              size: 'lg',
              className:
                'h-auto min-h-control-lg max-w-full text-center whitespace-normal',
            })}
          >
            {kit.action}
            <ArrowUpRight aria-hidden className="size-6 shrink-0" />
          </a>
        </div>
      </div>
    </section>
  )
}
