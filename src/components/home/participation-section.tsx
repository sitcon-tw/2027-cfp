import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  MessagesSquare,
  Sprout,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import content from '@/content.json'
import {
  ActionCard,
  cardMediaClassName,
  cardPaddingClassName,
} from '@/components/action-card'
import { FollowCard } from '@/components/follow-card'
import { SocialKitCard } from '@/components/home/social-kit-card'
import { SectionHeading } from '@/components/section-heading'
import { buttonVariants } from '@/components/ui/button'
import { links } from '@/lib/links'
import { cn } from '@/lib/utils'

const community = content.community

/** The ways in that are open right now; one without `href` opens the guide on About. */
const ways: {
  icon: LucideIcon
  title: string
  summary: string
  href?: string
}[] = [
  {
    icon: MessagesSquare,
    ...community.home.telegram,
    href: links.social.telegram,
  },
  {
    icon: CalendarDays,
    ...community.home.meetings,
    href: links.communityCalendar,
  },
  { icon: BookOpen, ...community.home.guide },
]

/**
 * 一起參與 SITCON 社群 — start with following updates and the social kit,
 * then offer direct ways to take part. The guide tile leads to About.
 */
export function ParticipationSection() {
  return (
    <section
      id="community"
      aria-labelledby="community-title"
      className="relative isolate px-2.5 pt-15 pb-40"
    >
      {/* Continues the shade 想來參加年會？'s gradient ends on. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/40" />
      <div className="mx-auto flex max-w-content flex-col gap-2.5 p-2.5">
        <SectionHeading id="community-title">{community.title}</SectionHeading>
        <div className="w-full pt-5">
          <FollowCard />
        </div>
        <div className="w-full pt-5">
          <SocialKitCard />
        </div>
        {/* One shape: stacked, a row from lg up where each tile is wide enough. */}
        <ul className="flex w-full flex-col gap-2.5 pt-5 pb-2.5 lg:flex-row">
          {ways.map(({ icon: Icon, title, summary, href }, i) => {
            const className = cn(
              'flex-1 rounded-sm bg-foreground text-background transition-colors duration-300 ease-smooth hover:bg-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none',
              cardPaddingClassName,
              i === 0 && 'rounded-t-xl lg:rounded-l-xl lg:rounded-tr-sm',
              i === ways.length - 1 &&
                'rounded-b-xl lg:rounded-r-xl lg:rounded-bl-sm',
            )
            const Arrow = href ? ArrowUpRight : ArrowRight
            // The ActionCard layout, so the icons, titles and descriptions
            // line up with the cards above and below; the arrow ends the
            // title's first line.
            const body = (
              <div className="flex gap-5">
                <Icon aria-hidden className={cardMediaClassName} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start gap-1.25">
                    <h3 className="text-h3 font-bold">{title}</h3>
                    {/* Centered on the title's first line if it wraps. */}
                    <span className="ml-auto flex h-lh shrink-0 items-center text-h3">
                      <Arrow aria-hidden className="size-5" />
                    </span>
                  </div>
                  <p className="text-paragraph text-gray">{summary}</p>
                </div>
              </div>
            )
            return (
              <li key={title} className="flex flex-1">
                {href ? (
                  <a href={href} className={className}>
                    {body}
                  </a>
                ) : (
                  <Link to="/about" hash="participate" className={className}>
                    {body}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
        <div className="w-full pt-5 pb-12.5">
          <ActionCard
            icon={Sprout}
            title={community.recruitment.title}
            description={community.home.recruit}
            action={
              <a
                href={links.recruitForm}
                className={buttonVariants({
                  variant: 'dark',
                  className:
                    'h-auto min-h-control max-w-full py-2.5 text-center whitespace-normal',
                })}
              >
                {community.actions.register}
                <ArrowUpRight aria-hidden className="size-5 shrink-0" />
              </a>
            }
          />
        </div>
      </div>
    </section>
  )
}
