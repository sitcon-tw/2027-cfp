import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'

import content from '@/content.json'
import { PageSection } from '@/components/about/page-section'
import { FollowCard } from '@/components/follow-card'
import { LinkedText } from '@/components/linked-text'
import { buttonVariants } from '@/components/ui/button'
import { links } from '@/lib/links'

const community = content.community
const textLinkClassName =
  'inline-flex min-h-control items-center gap-2.5 self-start rounded-xs text-paragraph underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

type Action = { href: string; label: string }

function ActionLink({
  action,
  className,
}: {
  action: Action
  className: string
}) {
  return (
    <a href={action.href} className={className}>
      {action.label}
      <ArrowUpRight aria-hidden className="size-5 shrink-0" />
    </a>
  )
}

// Keep alternatives together when they wrap below the primary action.
function ActionBar({
  primary,
  secondary = [],
}: {
  primary: Action
  secondary?: Action[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-7.5 gap-y-2.5">
      <ActionLink
        action={primary}
        className={buttonVariants({
          className:
            'h-auto min-h-control max-w-full py-2.5 text-center whitespace-normal',
        })}
      />
      {secondary.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-7.5 gap-y-2.5">
          {secondary.map((action) => (
            <ActionLink
              key={action.href}
              action={action}
              className={textLinkClassName}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ParticipationRow({
  title,
  children,
  primary,
  secondary,
}: {
  title: string
  children: ReactNode
  primary: Action
  secondary?: Action[]
}) {
  return (
    <div className="grid gap-5 border-t border-foreground/20 pt-7.5 md:grid-cols-3">
      <h3 className="text-h3 font-bold">{title}</h3>
      <div className="flex flex-col gap-5 md:col-span-2">
        {children}
        <ActionBar primary={primary} secondary={secondary} />
      </div>
    </div>
  )
}

export function ParticipationSection() {
  return (
    <PageSection id="participate" title={community.title}>
      <div className="flex flex-col gap-10">
        <p className="text-paragraph">{community.intro}</p>
        <FollowCard>
          <p className="pt-2.5 text-body text-gray">{community.about.help}</p>
        </FollowCard>
        <ParticipationRow
          title={community.about.nowTitle}
          primary={{
            href: links.social.telegram,
            label: community.actions.telegram,
          }}
          secondary={[
            {
              href: links.communityCalendar,
              label: community.actions.calendar,
            },
            { href: links.mailingList, label: community.actions.mailingList },
          ]}
        >
          <p className="text-paragraph">{community.openParticipation}</p>
          <p className="text-paragraph">
            {community.about.calendarDescription}
          </p>
          <p className="text-paragraph">{community.about.mailDescription}</p>
        </ParticipationRow>
        <ParticipationRow
          title={community.about.learnTitle}
          primary={{
            href: links.newcomerGuide,
            label: community.actions.handbook,
          }}
          secondary={[
            { href: links.meetingMinutes, label: community.actions.minutes },
            { href: links.preparationBoard, label: community.actions.board },
          ]}
        >
          <p className="text-paragraph">{community.about.learnDescription}</p>
        </ParticipationRow>
        <ParticipationRow
          title={community.recruitment.title}
          primary={{
            href: links.recruitForm,
            label: community.actions.register,
          }}
        >
          <p className="text-paragraph">{community.about.workExamples}</p>
          <p className="text-paragraph">{community.recruitment.purpose}</p>
          <p className="text-paragraph">{community.recruitment.notification}</p>
          <p className="text-body">{community.recruitment.status}</p>
        </ParticipationRow>
        <p className="border-t border-foreground/20 pt-7.5 text-paragraph">
          <LinkedText
            text={community.about.socialKit.replace('{url}', links.socialKit)}
          />
        </p>
      </div>
    </PageSection>
  )
}
