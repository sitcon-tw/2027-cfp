import { Link } from '@tanstack/react-router'
import { useId } from 'react'

import content from '@/content.json'
import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs'
import { sessionTypes, type SessionTypeId } from '@/lib/session-types'

export interface SubmissionTypeTabsProps {
  /** The page's session type, shown as selected. */
  type: SessionTypeId
}

/** 今天想要投稿什麼議程？ — links between the three submission forms. The current type is selected. */
export function SubmissionTypeTabs({ type }: SubmissionTypeTabsProps) {
  const headingId = useId()
  return (
    <section className="flex flex-col items-center gap-5 p-2.5">
      <h2 id={headingId} className="text-center text-h3 font-bold">
        {content.submit_page.typePrompt}
      </h2>
      <Tabs value={type} className="w-full items-center py-2.5">
        <TabsList aria-labelledby={headingId} className="w-full md:w-auto">
          {sessionTypes.map((session) => (
            <TabsTab
              key={session.id}
              value={session.id}
              nativeButton={false}
              render={<Link to="/submit/$type" params={{ type: session.id }} />}
              className="px-2.5 font-normal md:flex-none md:px-10"
            >
              {session.title}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
    </section>
  )
}
