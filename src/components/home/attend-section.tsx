import { useNavigate, useSearch } from '@tanstack/react-router'
import { CalendarDays, ChevronRight } from 'lucide-react'

import content from '@/content.json'
import bottomIcon from '@/assets/sitcon-icon-backdrop-bottom.svg'
import { ActionCard } from '@/components/action-card'
import { CalendarMenu } from '@/components/calendar-menu'
import { SectionHeading } from '@/components/section-heading'
import {
  TicketDialogContent,
  TicketStatusBadge,
  TicketTypeIcon,
} from '@/components/home/ticket-dialog'
import { Card } from '@/components/ui/card'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { tickets } from '@/lib/tickets'
import { cn } from '@/lib/utils'

/**
 * 想要參與？ — every ticket type with a one-line "who it's for", since the
 * names alone (開源築夢計畫, 遠道而來票) don't explain themselves. Each card
 * opens the ticket's details; the open one is in the URL (`/?ticket=far`),
 * so posts can link straight to it. The card under them subscribes to the
 * 索票重要時程 calendar with all of their dates.
 */
export function AttendSection() {
  const { ticket: openId } = useSearch({ from: '/' })
  const navigate = useNavigate()
  const show = (id?: string) =>
    void navigate({
      to: '/',
      search: (prev) => ({ ...prev, ticket: id }),
      replace: true,
      resetScroll: false,
      hashScrollIntoView: false,
    })

  return (
    <section
      id="attend"
      aria-labelledby="attend-title"
      className="relative isolate px-2.5 pt-15 pb-40"
    >
      <img
        src={bottomIcon}
        alt=""
        aria-hidden
        className="pointer-events-none absolute top-188 -left-24.5 -z-10 -rotate-21 blur-md"
      />
      {/* Darkens toward the bottom, over the icon. */}
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/0 via-black/36 via-24% to-black/40 to-83%" />
      <div className="mx-auto flex max-w-content flex-col gap-2.5 p-2.5">
        <SectionHeading id="attend-title">
          {content.attend_section.title}
        </SectionHeading>
        <p className="pt-2.5 text-paragraph">
          {content.attend_section.description}
        </p>
        {/* One stack, so only its outer corners are xl. */}
        <ul className="flex w-full flex-col gap-2.5 pt-5 pb-2.5">
          {tickets.map((ticket, index) => (
            <li key={ticket.id}>
              <Dialog
                open={openId === ticket.id}
                onOpenChange={(open) => show(open ? ticket.id : undefined)}
              >
                {/* The trigger's ::after covers the card, so the whole
                      card opens the dialog while the name stays the h3. */}
                <Card
                  className={cn(
                    'relative flex flex-wrap items-center gap-x-5 gap-y-1.25 px-7.5 py-5 transition-colors duration-300 ease-smooth hover:bg-light has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-blue motion-reduce:transition-none',
                    index === 0 && 'rounded-t-xl',
                    index === tickets.length - 1 && 'rounded-b-xl',
                  )}
                >
                  <TicketTypeIcon ticket={ticket} className="size-8 shrink-0" />
                  <h3 className="text-h3 font-bold md:basis-55">
                    <DialogTrigger className="cursor-pointer text-left outline-none after:absolute after:inset-0">
                      {ticket.name}
                    </DialogTrigger>
                  </h3>
                  <p className="text-paragraph text-gray max-md:order-last max-md:basis-full">
                    {ticket.summary}
                  </p>
                  <div className="ml-auto flex items-center gap-2.5">
                    <TicketStatusBadge ticket={ticket} />
                    <ChevronRight aria-hidden className="size-6 shrink-0" />
                  </div>
                </Card>
                <TicketDialogContent ticket={ticket} onSwitch={show} />
              </Dialog>
            </li>
          ))}
        </ul>
        <div className="w-full pt-5 pb-12.5">
          <ActionCard
            icon={CalendarDays}
            title={content.attend_section.scheduleTitle}
            description={content.attend_section.scheduleDescription}
            action={
              <CalendarMenu
                file={content.links.ticketCalendarFile}
                variant="dark"
              />
            }
          />
        </div>
      </div>
    </section>
  )
}
