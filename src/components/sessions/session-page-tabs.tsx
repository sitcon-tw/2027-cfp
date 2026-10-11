import { Link } from '@tanstack/react-router'

import content from '@/content.json'
import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs'
import { sessionTypes, type SessionTypeId } from '@/lib/session-types'

export interface SessionPageTabsProps {
  /** The page's session type, shown as selected. */
  type: SessionTypeId
}

/**
 * Links between the three session pages, under the page intro. Each tab is a
 * router link, so reload and back/forward follow the URL.
 */
export function SessionPageTabs({ type }: SessionPageTabsProps) {
  return (
    <Tabs value={type} className="py-2.5">
      <TabsList aria-label={content.session_page.tabsLabel}>
        {sessionTypes.map(({ id, title }) => (
          <TabsTab
            key={id}
            value={id}
            nativeButton={false}
            render={<Link to="/sessions/$type" params={{ type: id }} />}
            className="px-2.5 py-5 md:px-5"
          >
            {title}
          </TabsTab>
        ))}
      </TabsList>
    </Tabs>
  )
}
