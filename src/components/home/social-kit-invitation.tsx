import { ArrowUpRight } from 'lucide-react'

import content from '@/content.json'
import avatarFrame from '@/assets/social-kit/2027/sitcon-2027-frame.png?responsive'
import avatarPlaceholder from '@/assets/social-kit/2027/placeholder-avatar.png?responsive'
import facebookCover from '@/assets/social-kit/2027/facebook-cover.png?responsive'
import lineBackground from '@/assets/social-kit/2027/line-background.png?responsive'
import { ResponsiveImage } from '@/components/responsive-image'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { links } from '@/lib/links'

const kit = content.social_kit

// Artwork and the sample avatar come from the published 2027 social kit.
export function SocialKitInvitation() {
  return (
    <Card
      tone="ink"
      className="grid items-center gap-7.5 rounded-xl border border-foreground/20 p-7.5 lg:grid-cols-2"
    >
      <div className="flex min-w-0 flex-col items-start gap-5">
        <h3 className="text-h3 font-bold">{kit.title}</h3>
        <p className="text-paragraph">{kit.description}</p>
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
      </div>
      <div className="grid min-w-0 grid-cols-4 gap-5 text-center text-body text-balance">
        <figure className="flex min-w-0 flex-col gap-2.5">
          <div className="flex h-40 items-center justify-center">
            <div className="relative aspect-square w-full max-w-40 overflow-hidden rounded-full">
              <ResponsiveImage
                image={avatarPlaceholder}
                sizes="7.5rem"
                alt=""
                className="h-auto w-full"
              />
              <ResponsiveImage
                image={avatarFrame}
                sizes="7.5rem"
                alt={kit.previews.avatar.alt}
                className="absolute inset-0 size-full"
              />
            </div>
          </div>
          <figcaption>{kit.previews.avatar.label}</figcaption>
        </figure>
        <figure className="col-span-2 flex min-w-0 flex-col gap-2.5">
          <div className="flex h-40 items-center justify-center">
            <ResponsiveImage
              image={facebookCover}
              sizes="(min-width: 64rem) 14rem, (min-width: 48rem) 28rem, 45vw"
              alt={kit.previews.facebook.alt}
              className="max-h-full w-full rounded-xs object-contain"
            />
          </div>
          <figcaption>{kit.previews.facebook.label}</figcaption>
        </figure>
        <figure className="flex min-w-0 flex-col gap-2.5">
          <div className="flex h-40 items-center justify-center">
            <ResponsiveImage
              image={lineBackground}
              sizes="4.25rem"
              alt={kit.previews.line.alt}
              className="h-full w-auto max-w-full rounded-xs object-contain"
            />
          </div>
          <figcaption>{kit.previews.line.label}</figcaption>
        </figure>
      </div>
    </Card>
  )
}
