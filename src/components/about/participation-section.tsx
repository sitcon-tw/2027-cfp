import { ArrowUpRight } from 'lucide-react'

import content from '@/content.json'
import { PageSection } from '@/components/about/page-section'
import { buttonVariants } from '@/components/ui/button'
import { links } from '@/lib/links'

const community = content.community
const textLinkClassName =
  'inline-flex min-h-control items-center gap-2.5 self-start rounded-xs text-paragraph underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

export function ParticipationSection() {
  return (
    <PageSection id="participate" title={community.title}>
      <div className="flex flex-col gap-10">
        <p className="text-paragraph">{community.intro}</p>
        <div className="grid gap-5 border-t border-foreground/20 pt-7.5 md:grid-cols-3">
          <h3 className="text-h3 font-bold">{community.about.nowTitle}</h3>
          <div className="flex flex-col gap-5 md:col-span-2">
            <p className="text-paragraph">{community.openParticipation}</p>
            <p className="text-paragraph">
              {community.about.calendarDescription}
            </p>
            <div className="flex flex-wrap items-center gap-x-7.5 gap-y-2.5">
              <a
                href={links.social.telegram}
                className={buttonVariants({ variant: 'green' })}
              >
                {community.actions.telegram}
                <ArrowUpRight aria-hidden className="size-5 shrink-0" />
              </a>
              <a href={links.communityCalendar} className={textLinkClassName}>
                {community.actions.calendar}
                <ArrowUpRight aria-hidden className="size-5 shrink-0" />
              </a>
            </div>
            <div className="flex flex-col gap-2.5">
              <p className="text-paragraph">
                {community.about.mailDescription}
              </p>
              <a href={links.mailingList} className={textLinkClassName}>
                {community.actions.mailingList}
                <ArrowUpRight aria-hidden className="size-5 shrink-0" />
              </a>
            </div>
          </div>
        </div>
        <div className="grid gap-5 border-t border-foreground/20 pt-7.5 md:grid-cols-3">
          <h3 className="text-h3 font-bold">{community.about.learnTitle}</h3>
          <div className="flex flex-col gap-5 md:col-span-2">
            <p className="text-paragraph">{community.about.learnDescription}</p>
            <a
              href={links.newcomerGuide}
              className={buttonVariants({ className: 'self-start' })}
            >
              {community.actions.handbook}
              <ArrowUpRight aria-hidden className="size-5 shrink-0" />
            </a>
            <div className="flex flex-wrap gap-x-7.5 gap-y-2.5">
              <a href={links.meetingMinutes} className={textLinkClassName}>
                {community.actions.minutes}
                <ArrowUpRight aria-hidden className="size-5 shrink-0" />
              </a>
              <a href={links.preparationBoard} className={textLinkClassName}>
                {community.actions.board}
                <ArrowUpRight aria-hidden className="size-5 shrink-0" />
              </a>
            </div>
          </div>
        </div>
        <div className="grid gap-5 border-t border-foreground/20 pt-7.5 md:grid-cols-3">
          <h3 className="text-h3 font-bold">{community.recruitment.title}</h3>
          <div className="flex flex-col gap-5 md:col-span-2">
            <p className="text-paragraph">{community.about.workExamples}</p>
            <p className="text-paragraph">{community.recruitment.purpose}</p>
            <p className="text-paragraph">
              {community.recruitment.notification}
            </p>
            <p className="text-body">{community.recruitment.status}</p>
            <a
              href={links.recruitForm}
              className={buttonVariants({ className: 'self-start' })}
            >
              {community.actions.register}
              <ArrowUpRight aria-hidden className="size-5 shrink-0" />
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 border-t border-foreground/20 pt-7.5">
          <p className="text-paragraph">{community.about.help}</p>
          <div className="flex flex-wrap gap-x-7.5 gap-y-2.5">
            <a href={links.social.instagram} className={textLinkClassName}>
              {community.actions.instagram}
              <ArrowUpRight aria-hidden className="size-5 shrink-0" />
            </a>
            <a href={links.social.facebook} className={textLinkClassName}>
              {community.actions.facebook}
              <ArrowUpRight aria-hidden className="size-5 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </PageSection>
  )
}
