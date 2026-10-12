import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { SessionTypePhoto } from '@/components/session-type-photo'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { sessionTypes, type SessionType } from '@/lib/session-types'
import { cn } from '@/lib/utils'

/**
 * Session types. From `md` up, a stack of tabs with a detail panel that
 * follows the selection; below it, one card per type, so phones don't have
 * to tap through tabs.
 */
export function SessionTypeTabs() {
  return (
    <>
      <SessionTypeCards />
      <SessionTypeTabList />
    </>
  )
}

function SessionTypeCards() {
  return (
    <ul className="flex w-full flex-col gap-5 md:hidden">
      {sessionTypes.map((type) => (
        <li key={type.id} className="group flex">
          <SessionTypeIntro
            type={type}
            className="group-first:rounded-t-xl group-last:rounded-b-xl"
            heading={
              <div className="flex items-center gap-2.5">
                <type.icon className="size-10 shrink-0" />
                <div className="flex flex-col">
                  <h3 className="text-h3 font-bold">{type.title}</h3>
                  <p className="text-paragraph">{type.summary}</p>
                </div>
              </div>
            }
          />
        </li>
      ))}
    </ul>
  )
}

function SessionTypeTabList() {
  return (
    <Tabs
      orientation="vertical"
      defaultValue={sessionTypes[0].id}
      className="w-full gap-5 max-md:hidden"
    >
      <TabsList className="grow basis-111.25 gap-5">
        {sessionTypes.map(({ id, title, summary, icon: Icon }) => (
          <TabsTab
            key={id}
            value={id}
            className="justify-start gap-2.5 px-5 py-4 text-left data-[orientation=vertical]:first:rounded-tr-sm data-[orientation=vertical]:last:rounded-br-sm"
          >
            <Icon className="mx-2.5 size-10 shrink-0" />
            <span className="flex flex-col p-2.5">
              <span className="text-h3 font-bold">{title}</span>
              <span className="text-paragraph font-normal">{summary}</span>
            </span>
          </TabsTab>
        ))}
      </TabsList>
      {/* Every panel stays laid out in the same grid cell (closed ones are
          invisible and inert, not `hidden`), so switching tabs doesn't
          resize it. */}
      <div className="grid grow basis-121.25">
        {sessionTypes.map((type) => (
          <TabsPanel
            key={type.id}
            value={type.id}
            keepMounted
            hidden={false}
            className="col-start-1 row-start-1 flex data-hidden:invisible"
          >
            <SessionTypeIntro type={type} className="rounded-r-xl" />
          </TabsPanel>
        ))}
      </div>
    </Tabs>
  )
}

/**
 * Dimmed session photo behind the type's title and a link to its session
 * page, where the description and the submission CTA live, so a visitor
 * sent here by 我要投稿 can go on to submit. The link sits at the bottom,
 * so it lines up across the equal-height panels. Stacked tiles read as one
 * shape: callers round only the outer corners to `xl`.
 */
function SessionTypeIntro({
  type,
  heading = <h3 className="text-h3 font-bold">{type.title}</h3>,
  className,
}: {
  type: SessionType
  heading?: ReactNode
  className?: string
}) {
  return (
    <Card
      tone="ink"
      className={cn(
        'relative isolate flex flex-1 flex-col px-5 py-3.75',
        className,
      )}
    >
      <SessionTypePhoto image={type.intro.image} />
      <div className="flex grow flex-col gap-2.5 px-5 py-2.5">
        {heading}
        <div className="mt-auto pt-2.5">
          <Link
            to="/sessions/$type"
            params={{ type: type.id }}
            className={buttonVariants({
              variant: 'cream',
              className: 'group',
            })}
          >
            {type.link}
            <ArrowRight
              aria-hidden
              className="size-5 shrink-0 transition-transform duration-300 ease-smooth group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </Card>
  )
}
