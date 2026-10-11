import type { ReactNode } from 'react'
import { LinkedText } from '@/components/linked-text'
import { SessionTypePhoto } from '@/components/session-type-photo'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsPanel, TabsTab } from '@/components/ui/tabs'
import { sessionTypes, type SessionType } from '@/lib/session-types'
import { cn } from '@/lib/utils'

/**
 * Session types. From `md` up, a stack of tabs with a detail panel that
 * follows the selection; below it, one card per type with everything shown,
 * so phones don't have to tap through tabs to read the descriptions.
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
          invisible and inert, not `hidden`), so the panel keeps the tallest
          intro's height and switching tabs doesn't resize it. */}
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
 * Dimmed session photo behind the type's description. Stacked tiles read as
 * one shape: callers round only the outer corners to `xl`.
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
      className={cn('relative isolate flex-1 px-5 py-3.75', className)}
    >
      <SessionTypePhoto image={type.intro.image} />
      <div className="flex flex-col gap-2.5 px-5 py-2.5">
        {heading}
        <p className="text-paragraph">
          <LinkedText text={type.intro.description} />
        </p>
      </div>
    </Card>
  )
}
