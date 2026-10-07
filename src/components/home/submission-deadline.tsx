import { useEffect, useState } from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// TODO: set once the submission deadline is announced.
const DEADLINE: Date | null = null

const MINUTE = 60_000

export function SubmissionDeadline() {
  return (
    <section className="px-2.5 pt-10 pb-2.5">
      <div className="mx-auto grid max-w-content gap-2.5 md:grid-cols-5">
        <Card className="rounded-t-xl px-5 py-4 md:col-span-2 md:rounded-l-xl md:rounded-tr-sm">
          <div className="px-5 py-3.75">
            <h2 className="text-h3 font-bold">投稿截止</h2>
            <p className="font-numeric text-paragraph font-medium">
              {DEADLINE ? formatDate(DEADLINE) : '2027 / ?? / ??'}
            </p>
          </div>
        </Card>
        <Card className="flex flex-wrap items-center gap-2.5 rounded-b-xl py-4 pr-10 pl-5 md:col-span-3 md:rounded-r-xl md:rounded-bl-sm">
          <div className="grow px-5 py-3.75">
            <h2 className="text-h3 font-bold">倒數</h2>
            <p className="font-numeric text-paragraph font-medium">
              {DEADLINE ? <Countdown to={DEADLINE} /> : 'XX D XX h XX min'}
            </p>
          </div>
          {DEADLINE ? (
            <a
              href={calendarUrl(DEADLINE)}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ variant: 'muted', size: 'lg' })}
            >
              加入行事曆
            </a>
          ) : (
            <Button variant="muted" size="lg" disabled>
              加入行事曆
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

  return `${pad(Math.floor(minutes / 1440))} D ${pad(Math.floor(minutes / 60) % 24)} h ${pad(minutes % 60)} min`
}

function formatDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()} / ${pad(date.getMonth() + 1)} / ${pad(date.getDate())}`
}

/** Google Calendar "add event" link for the deadline. */
function calendarUrl(deadline: Date) {
  const stamp = deadline.toISOString().replace(/[-:]|\.\d{3}/g, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: 'SITCON 2027 投稿截止',
    dates: `${stamp}/${stamp}`,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}
