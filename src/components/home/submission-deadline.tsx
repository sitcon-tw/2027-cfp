import { useEffect, useState } from 'react'

import content from '@/content.json'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { formatDate } from '@/lib/schedule'

// The end of the `submission` item in the speaker schedule.
const deadline = content.speaker_section.schedule.find(
  ({ id }) => id === 'submission',
)?.end as string | null | undefined
const DEADLINE = deadline ? new Date(deadline) : null

const MINUTE = 60_000

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
            <p className="font-numeric text-paragraph font-medium">
              {DEADLINE ? (
                <Countdown to={DEADLINE} />
              ) : (
                content.submission_deadline.unknownCountdown
              )}
            </p>
          </div>
          {DEADLINE ? (
            <a
              href={calendarUrl(DEADLINE)}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: 'muted', size: 'lg' })}
            >
              {content.submission_deadline.addCalendar}
            </a>
          ) : (
            <Button variant="muted" size="lg" disabled>
              {content.submission_deadline.addCalendar}
            </Button>
          )}
        </Card>
      </div>
    </section>
  )
}

function Countdown({ to }: { to: Date }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), MINUTE)
    return () => clearInterval(id)
  }, [])

  const minutes = Math.max(0, Math.floor((to.getTime() - now) / MINUTE))
  const pad = (n: number) => String(n).padStart(2, '0')

  return content.submission_deadline.countdownFormat
    .replace('{days}', pad(Math.floor(minutes / 1440)))
    .replace('{hours}', pad(Math.floor(minutes / 60) % 24))
    .replace('{minutes}', pad(minutes % 60))
}

/** Google Calendar "add event" link for the deadline. */
function calendarUrl(deadline: Date) {
  const stamp = deadline.toISOString().replace(/[-:]|\.\d{3}/g, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: content.submission_deadline.calendarTitle,
    dates: `${stamp}/${stamp}`,
  })
  return `${content.links.calendar}?${params}`
}
