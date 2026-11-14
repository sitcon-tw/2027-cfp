import { Link } from '@tanstack/react-router'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

import content from '@/content.json'
import { SectionHeading } from '@/components/section-heading'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { links } from '@/lib/links'

const community = content.community
const textLinkClassName =
  'inline-flex min-h-control items-center gap-2.5 self-start rounded-xs text-paragraph underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function ParticipationSection() {
  return (
    <section
      id="community"
      aria-labelledby="community-title"
      className="relative bg-background px-2.5 pt-15 pb-40"
    >
      <div className="mx-auto flex max-w-content flex-col gap-2.5 p-2.5">
        <SectionHeading id="community-title">{community.title}</SectionHeading>
        <p className="pt-2.5 text-paragraph">{community.intro}</p>
        <div className="grid gap-2.5 pt-5 md:grid-cols-2">
          <Card
            tone="gray"
            className="flex flex-col gap-5 rounded-t-xl p-7.5 md:rounded-tr-sm md:rounded-bl-xl md:p-10"
          >
            <h3 className="text-h3 font-bold">{community.home.nowTitle}</h3>
            <p className="text-paragraph">{community.openParticipation}</p>
            <a
              href={links.social.telegram}
              className={buttonVariants({
                variant: 'green',
                className: 'self-start',
              })}
            >
              {community.actions.telegram}
              <ArrowUpRight aria-hidden className="size-5 shrink-0" />
            </a>
            <a href={links.communityCalendar} className={textLinkClassName}>
              {community.actions.calendar}
              <ArrowUpRight aria-hidden className="size-5 shrink-0" />
            </a>
            <div className="flex flex-col gap-2.5 pt-2.5">
              <p className="text-paragraph">{community.home.readPrompt}</p>
              <Link
                to="/about"
                hash="participate"
                className={textLinkClassName}
              >
                {community.actions.guide}
                <ArrowRight aria-hidden className="size-5 shrink-0" />
              </Link>
            </div>
          </Card>
          <Card className="flex flex-col gap-5 rounded-b-xl p-7.5 md:rounded-tr-xl md:rounded-bl-sm md:p-10">
            <h3 className="text-h3 font-bold">{community.recruitment.title}</h3>
            <p className="text-paragraph">{community.recruitment.purpose}</p>
            <p className="text-paragraph">
              {community.recruitment.notification}
            </p>
            <p className="text-body text-gray">
              {community.recruitment.status}
            </p>
            <a
              href={links.recruitForm}
              className={buttonVariants({
                variant: 'dark',
                className: 'mt-auto self-start',
              })}
            >
              {community.actions.register}
              <ArrowUpRight aria-hidden className="size-5 shrink-0" />
            </a>
          </Card>
        </div>
      </div>
    </section>
  )
}
