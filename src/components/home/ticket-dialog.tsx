import {
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  FileText,
  Gift,
  GitPullRequest,
  HandHeart,
  Info,
  ListOrdered,
  MapPin,
  Plane,
  Sprout,
  Ticket as TicketIcon,
  TrainFront,
  UserCheck,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'

import content from '@/content.json'
import { LinkedText } from '@/components/linked-text'
import { StatusBadge } from '@/components/schedule-card'
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Menu,
  MenuContent,
  MenuLinkItem,
  MenuTrigger,
} from '@/components/ui/menu'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { formatScheduleDate, scheduleStatus } from '@/lib/schedule'
import {
  googleCalendarUrl,
  icsDataUrl,
  infoLabel,
  ticketAction,
  ticketDateStates,
  type Ticket,
  type TicketDate,
  type TicketDateState,
  type TicketSection,
} from '@/lib/tickets'
import { cn } from '@/lib/utils'

const labels = content.attend_section.ticketDialog

/** Icon per ticket id in `content.attend_section.tickets`. */
const ticketIcons: Record<string, LucideIcon> = {
  contributor: GitPullRequest,
  far: MapPin,
  dream: Sprout,
  supporter: HandHeart,
  general: TicketIcon,
}

/** Icon per `details.benefits[].icon` in `content.json`. */
const benefitIcons: Record<string, LucideIcon> = {
  ticket: TicketIcon,
  train: TrainFront,
  bed: BedDouble,
  plane: Plane,
  sprout: Sprout,
  gift: Gift,
}

const sectionIcons: Record<TicketSection, LucideIcon> = {
  eligibility: UserCheck,
  benefits: Gift,
  tiers: HandHeart,
  steps: ListOrdered,
  dates: CalendarDays,
  documents: FileText,
  notes: Info,
  faq: CircleHelp,
}

export function TicketTypeIcon({
  ticket,
  className,
}: {
  ticket: Ticket
  className?: string
}) {
  const Icon = ticketIcons[ticket.id] ?? TicketIcon
  return <Icon aria-hidden className={className} />
}

/** The ticket's live status; a ticket with no dates yet reads 確認中. */
export function TicketStatusBadge({ ticket }: { ticket: Ticket }) {
  const status = scheduleStatus(ticket)
  return status === 'unannounced' ? (
    <Badge>{labels.pendingBadge}</Badge>
  ) : (
    <StatusBadge status={status} />
  )
}

export interface TicketDialogContentProps {
  ticket: Ticket
  /** Opens another ticket's dialog in place of this one. */
  onSwitch: (id: string) => void
}

/**
 * Everything about one ticket: who it is for, what it gives, how and when
 * to apply, then the fine print. Not in Figma yet; it is composed from the
 * site's existing surfaces. The action bar near the top always offers a
 * next step (see `ticketAction()`).
 */
export function TicketDialogContent({
  ticket,
  onSwitch,
}: TicketDialogContentProps) {
  const { details } = ticket
  const title = (section: TicketSection) =>
    details.titles?.[section] ?? labels.sections[section]

  return (
    <DialogContent className="flex flex-col gap-7.5">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex flex-col gap-2.5">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.25">
            <TicketTypeIcon ticket={ticket} className="size-8 shrink-0" />
            <DialogTitle>{ticket.name}</DialogTitle>
            <TicketStatusBadge ticket={ticket} />
          </div>
          <DialogDescription className="text-pretty">
            {ticket.description}
          </DialogDescription>
        </div>
        <DialogClose aria-label={content.schedule.close} />
      </div>

      <ActionBar ticket={ticket} onSwitch={onSwitch} />

      {details.eligibility && (
        <Section section="eligibility" title={title('eligibility')}>
          {details.eligibility.lead && (
            <p className="text-paragraph">{details.eligibility.lead}</p>
          )}
          <Variants
            groups={details.eligibility.groups}
            render={(items) => (
              <Tiles>
                {items.map((item, index) => (
                  <Tile key={item.title} index={index} count={items.length}>
                    <p className="text-paragraph font-bold">{item.title}</p>
                    <p className="text-body text-pretty text-gray">
                      {item.text}
                    </p>
                  </Tile>
                ))}
              </Tiles>
            )}
          />
        </Section>
      )}

      {details.benefits && (
        <Section section="benefits" title={title('benefits')}>
          <Tiles>
            {details.benefits.map((benefit, index, all) => {
              const BenefitIcon = benefitIcons[benefit.icon] ?? Gift
              return (
                <Tile key={benefit.title} index={index} count={all.length}>
                  <BenefitIcon aria-hidden className="mb-1.25 size-7" />
                  <p className="text-paragraph font-bold">{benefit.title}</p>
                  <p className="text-body text-pretty text-gray">
                    <LinkedText text={benefit.text} />
                  </p>
                </Tile>
              )
            })}
          </Tiles>
        </Section>
      )}

      {details.tiers && (
        <Section section="tiers" title={title('tiers')}>
          <ul className="flex flex-col gap-2.5">
            {/* Mobile: amount and badge on one line, rewards under them. */}
            {details.tiers.map((tier, index, all) => (
              <li
                key={tier.amount}
                className={cn(
                  'flex flex-wrap items-center gap-x-5 gap-y-1.25 rounded-sm bg-light px-5 py-2.5',
                  index === 0 && 'rounded-t-xl',
                  index === all.length - 1 && 'rounded-b-xl',
                )}
              >
                <span className="shrink-0 font-numeric text-paragraph font-bold whitespace-nowrap md:basis-60">
                  {tier.amount}
                </span>
                <span className="text-body text-gray max-md:order-last max-md:basis-full md:flex-1">
                  {tier.rewards}
                </span>
                {tier.ticket && (
                  <Badge
                    tone="green"
                    className="flex items-center gap-1.25 max-md:ml-auto"
                  >
                    <TicketIcon aria-hidden className="size-4" />
                    {tier.ticket}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
          {details.tiersNote && (
            <p className="text-body text-gray">
              <LinkedText text={details.tiersNote} />
            </p>
          )}
        </Section>
      )}

      {details.steps && (
        <Section section="steps" title={title('steps')}>
          <Tiles as="ol">
            {details.steps.map((step, index, all) => (
              <Tile key={step.title} index={index} count={all.length}>
                <span
                  aria-hidden
                  className="mb-1.25 flex size-8 items-center justify-center rounded-full bg-background font-numeric text-body font-medium text-foreground"
                >
                  {index + 1}
                </span>
                <p className="text-paragraph font-bold">{step.title}</p>
                <p className="text-body text-pretty text-gray">{step.text}</p>
              </Tile>
            ))}
          </Tiles>
        </Section>
      )}

      {details.dates && (
        <Section section="dates" title={title('dates')}>
          <DateList dates={details.dates} />
        </Section>
      )}

      {details.documents && (
        <Section section="documents" title={title('documents')}>
          <Variants
            groups={details.documents.groups}
            render={(items) => (
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item} className="flex gap-2.5 text-paragraph">
                    <Check aria-hidden className="mt-1.25 size-5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          />
        </Section>
      )}

      {details.notes && (
        <Section section="notes" title={title('notes')}>
          <ul className="flex list-disc flex-col gap-2.5 pl-7.5 text-paragraph marker:text-gray">
            {details.notes.map((note) => (
              <li key={note}>
                <LinkedText text={note} />
              </li>
            ))}
          </ul>
        </Section>
      )}

      {details.faq && (
        <Section section="faq" title={title('faq')}>
          <Accordion className="gap-2.5">
            {details.faq.map(({ question, answer }) => (
              <AccordionItem key={question}>
                <AccordionTrigger
                  headingLevel="h4"
                  className="py-2.5 text-paragraph md:px-7.5"
                >
                  {question}
                </AccordionTrigger>
                <AccordionPanel className="bg-light text-body md:px-7.5">
                  <LinkedText text={answer} />
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Section>
      )}
    </DialogContent>
  )
}

/**
 * The ink bar under the header: when the ticket is open (or why not), and
 * the next step. The secondary link goes to the full rules whenever they
 * are not already the main action.
 */
function ActionBar({ ticket, onSwitch }: TicketDialogContentProps) {
  const status = scheduleStatus(ticket)
  const action = ticketAction(ticket)
  const { info } = ticket.details

  // The badge in the header says whether it is open yet; this is the window.
  const when =
    status === 'unannounced' ? (
      <p className="text-paragraph font-bold">{labels.pending}</p>
    ) : (
      <>
        <p className="text-body text-foreground/70">{labels.period}</p>
        <p className="font-numeric text-paragraph font-medium">
          {formatScheduleDate(ticket)}
        </p>
      </>
    )

  return (
    <Card
      tone="ink"
      className="flex flex-wrap items-center gap-5 rounded-xl px-7.5 py-5"
    >
      <div className="flex grow basis-60 flex-col">{when}</div>
      <div className="flex flex-wrap items-center gap-x-7.5 gap-y-2.5">
        {action && (
          <PrimaryAction ticket={ticket} action={action} onSwitch={onSwitch} />
        )}
        {info && action?.kind !== 'info' && (
          <a
            href={info}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.25 rounded-xs text-paragraph font-bold underline underline-offset-4 transition hover:brightness-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            {infoLabel(ticket)}
            <ArrowUpRight aria-hidden className="size-5" />
          </a>
        )}
      </div>
    </Card>
  )
}

const primaryClassName = buttonVariants({ variant: 'green' })

function PrimaryAction({
  ticket,
  action,
  onSwitch,
}: TicketDialogContentProps & {
  action: NonNullable<ReturnType<typeof ticketAction>>
}) {
  switch (action.kind) {
    case 'apply':
    case 'info':
      return (
        <a
          href={action.href}
          target="_blank"
          rel="noreferrer"
          className={primaryClassName}
        >
          {action.label}
          <ArrowUpRight aria-hidden className="size-5" />
        </a>
      )
    case 'switch':
      return (
        <Button variant="green" onClick={() => onSwitch(action.ticket.id)}>
          {labels.switchTo.replace('{name}', action.ticket.name)}
          <ArrowRight aria-hidden className="size-5" />
        </Button>
      )
    case 'remind':
      return <ReminderMenu ticket={ticket} at={action.at} />
  }
}

// Same light items as the 投稿日程 calendar menu.
const CALENDAR_ITEM =
  'min-h-control rounded-xl py-2.5 font-bold data-highlighted:bg-background data-highlighted:text-foreground'

/** 加入行事曆 for the moment the ticket opens. */
function ReminderMenu({ ticket, at }: { ticket: Ticket; at: Date }) {
  const calendar = content.submission_deadline
  return (
    <Menu>
      <MenuTrigger
        className={buttonVariants({
          variant: 'green',
          className: 'data-popup-open:brightness-90',
        })}
      >
        {calendar.addCalendar}
        <ChevronDown
          aria-hidden
          className="size-5 transition-transform duration-200 in-data-popup-open:rotate-180 motion-reduce:transition-none"
        />
      </MenuTrigger>
      <MenuContent
        align="start"
        className="rounded-xl border-0 bg-light bg-none text-background backdrop-blur-none transition-opacity duration-300 ease-smooth data-ending-style:scale-100 data-starting-style:scale-100"
      >
        <MenuLinkItem
          className={CALENDAR_ITEM}
          href={googleCalendarUrl(ticket, at)}
          target="_blank"
          rel="noreferrer"
        >
          {calendar.calendarGoogle}
        </MenuLinkItem>
        <MenuLinkItem
          className={CALENDAR_ITEM}
          href={icsDataUrl(ticket, at)}
          download={`sitcon-2027-${ticket.id}.ics`}
        >
          {calendar.calendarDownload}
        </MenuLinkItem>
      </MenuContent>
    </Menu>
  )
}

function Section({
  section,
  title,
  children,
}: {
  section: TicketSection
  title: string
  children: ReactNode
}) {
  const Icon = sectionIcons[section]
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="flex items-center gap-2.5 text-lead font-bold">
        <Icon aria-hidden className="size-6 shrink-0" />
        {title}
      </h3>
      {children}
    </section>
  )
}

/** One group as is; several (遠道而來票's regions) as tabs. */
function Variants<T>({
  groups,
  render,
}: {
  groups: { label?: string; items: T[] }[]
  render: (items: T[]) => ReactNode
}) {
  if (groups.length === 1) return render(groups[0].items)
  return (
    <Tabs defaultValue={0}>
      <TabsList>
        {groups.map((group, index) => (
          <TabsTab
            key={group.label}
            value={index}
            className="bg-light text-background data-active:bg-background data-active:text-foreground"
          >
            {group.label}
          </TabsTab>
        ))}
      </TabsList>
      {groups.map((group, index) => (
        <TabsPanel key={group.label} value={index}>
          {render(group.items)}
        </TabsPanel>
      ))}
    </Tabs>
  )
}

/** A row of light tiles (a column on mobile) joined by the corner rule. */
function Tiles({
  as: List = 'ul',
  children,
}: {
  as?: 'ul' | 'ol'
  children: ReactNode
}) {
  return <List className="flex flex-col gap-2.5 md:flex-row">{children}</List>
}

function Tile({
  index,
  count,
  children,
}: {
  index: number
  count: number
  children: ReactNode
}) {
  const first = index === 0
  const last = index === count - 1
  return (
    <li
      className={cn(
        'flex flex-1 flex-col gap-1.25 rounded-sm bg-light p-5',
        first && last
          ? 'rounded-xl'
          : cn(
              first && 'rounded-t-xl md:rounded-l-xl md:rounded-tr-sm',
              last && 'rounded-b-xl md:rounded-r-xl md:rounded-bl-sm',
            ),
      )}
    >
      {children}
    </li>
  )
}

/**
 * 重要日期: passed dates dim, a range in progress glows green and the next
 * date ahead is blue, like the dots of the schedule dialogs.
 */
const dateDotClassNames: Record<TicketDateState, string> = {
  passed: 'bg-gray/40',
  ongoing: 'bg-green ring-4 ring-green/30',
  next: 'bg-blue',
  later: 'border-2 border-gray/40',
}

function DateList({ dates }: { dates: TicketDate[] }) {
  const states = ticketDateStates(dates)
  return (
    <ol className="flex flex-col rounded-xl bg-light p-5 md:px-7.5">
      {dates.map((date, index) => (
        <li
          key={date.name}
          className={cn(
            'group flex gap-5',
            states[index] === 'passed' && 'opacity-60',
          )}
        >
          {/* Rail: a dot centered on the name's first line, joined to the
              next date by a line. */}
          <div
            aria-hidden
            className="flex flex-col items-center text-paragraph"
          >
            <span className="flex h-lh items-center">
              <span
                className={cn(
                  'size-3 rounded-full',
                  dateDotClassNames[states[index]],
                )}
              />
            </span>
            <span className="w-0.5 grow rounded-full bg-gray/20 group-last:hidden" />
          </div>
          <div className="flex flex-col pb-5 group-last:pb-0">
            <span className="text-paragraph font-bold">{date.name}</span>
            <span className="font-numeric text-body font-medium text-gray">
              {formatScheduleDate({
                id: date.name,
                name: date.name,
                start: date.start ?? null,
                end: date.end ?? null,
              })}
            </span>
          </div>
        </li>
      ))}
    </ol>
  )
}
