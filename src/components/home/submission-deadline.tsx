import content from '@/content.json'
import { ChevronDown } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Menu,
  MenuContent,
  MenuLinkItem,
  MenuTrigger,
} from '@/components/ui/menu'
import { deadlines, useCountdown, type Countdown } from '@/lib/countdown'
import { formatDate } from '@/lib/schedule'
import { fillPlaceholders, pad } from '@/lib/utils'

// The end of 投稿期間 in `content.speaker_section.schedule`.
const DEADLINE = deadlines.submission

type CountdownPart = Exclude<keyof Countdown, 'expired'>

export function SubmissionDeadline() {
  return (
    <section className="px-2.5 pt-10 pb-2.5">
      <div className="mx-auto grid max-w-content gap-2.5 md:grid-cols-5">
        <Card className="rounded-t-xl px-5 py-4 md:col-span-2 md:rounded-l-xl md:rounded-tr-sm">
          <div className="px-5 py-3.75">
            <h2 className="text-h3 font-bold">
              {content.submission_deadline.title}
            </h2>
            <p className="font-numeric text-paragraph font-medium">
              {DEADLINE
                ? formatDate(DEADLINE)
                : content.submission_deadline.unknownDate}
            </p>
          </div>
        </Card>
        <Card className="flex flex-wrap items-center gap-2.5 rounded-b-xl py-4 pr-10 pl-5 md:col-span-3 md:rounded-r-xl md:rounded-bl-sm">
          <div className="grow px-5 py-3.75">
            <h2 className="text-h3 font-bold">
              {content.submission_deadline.countdown}
            </h2>
            <p className="text-paragraph">
              {DEADLINE ? <LiveCountdown to={DEADLINE} /> : <CountdownText />}
            </p>
          </div>
          <CalendarMenu />
        </Card>
      </div>
    </section>
  )
}

function LiveCountdown({ to }: { to: Date }) {
  return <CountdownText parts={useCountdown(to)!} />
}

/**
 * `countdownFormat` with the numbers in bold Inter, so they stand out from
 * the Chinese units and keep their width as they tick. Without `parts` (the
 * deadline is unannounced) every number is `??`.
 */
function CountdownText({ parts }: { parts?: Record<CountdownPart, number> }) {
  return fillPlaceholders(
    content.submission_deadline.countdownFormat,
    (name) => (
      <span key={name} className="font-numeric font-bold tabular-nums">
        {parts
          ? pad(parts[name as CountdownPart])
          : content.submission_deadline.unknownCountdownValue}
      </span>
    ),
  )
}

// The 投稿重要時程 calendar, served from `public/`. Google and Apple
// Calendar subscribe to it, so they pick up later changes to the file.
const CALENDAR_FILE = content.links.calendarFile
const CALENDAR_WEBCAL = CALENDAR_FILE.replace(/^https?:/, 'webcal:')

function CalendarMenu() {
  const labels = content.submission_deadline
  return (
    <Menu>
      <MenuTrigger className={buttonVariants({ variant: 'muted', size: 'lg' })}>
        {labels.addCalendar}
        <ChevronDown
          aria-hidden
          className="size-6 transition-transform duration-200 in-data-popup-open:rotate-180"
        />
      </MenuTrigger>
      <MenuContent>
        <MenuLinkItem
          href={content.links.googleCalendarSubscribe.replace(
            '{url}',
            encodeURIComponent(CALENDAR_WEBCAL),
          )}
          target="_blank"
          rel="noreferrer"
        >
          {labels.calendarGoogle}
        </MenuLinkItem>
        <MenuLinkItem href={CALENDAR_WEBCAL}>
          {labels.calendarApple}
        </MenuLinkItem>
        <MenuLinkItem href={CALENDAR_FILE} download>
          {labels.calendarDownload}
        </MenuLinkItem>
      </MenuContent>
    </Menu>
  )
}
