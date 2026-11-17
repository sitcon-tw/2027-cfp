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
import { ActionCard } from '@/components/action-card'
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
 * 一起參與 SITCON 社群 — the ways to join in now as one row of tiles, then
 * future preparation as an ActionCard, the same rhythm as 想來參加年會？ above.
 * The guide tile leads to the full write-up on About.
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
        <p className="pt-2.5 text-paragraph">{community.intro}</p>
        {/* One shape: stacked on mobile, a row from md up. */}
        <ul className="flex w-full flex-col gap-2.5 pt-5 pb-2.5 md:flex-row">
          {ways.map(({ icon: Icon, title, summary, href }, i) => {
            const className = cn(
              'flex-1 rounded-sm bg-foreground px-5 py-4 text-background transition-colors duration-300 ease-smooth hover:bg-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue motion-reduce:transition-none',
              i === 0 && 'rounded-t-xl md:rounded-l-xl md:rounded-tr-sm',
              i === ways.length - 1 &&
                'rounded-b-xl md:rounded-r-xl md:rounded-bl-sm',
            )
            const Arrow = href ? ArrowUpRight : ArrowRight
            // Icon, title and arrow on one line like the ticket cards, padded
            // like the session-type tiles and the ActionCard below.
            const body = (
              <div className="flex flex-col p-2.5">
                <div className="flex items-center gap-5">
                  <Icon aria-hidden className="size-8 shrink-0" />
                  <h3 className="text-h3 font-bold">{title}</h3>
                  <Arrow aria-hidden className="ml-auto size-6 shrink-0" />
                </div>
                <p className="text-paragraph text-gray">{summary}</p>
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
                className={buttonVariants({ variant: 'dark' })}
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
