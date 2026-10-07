import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'
import { getSessionType, type SessionTypeId } from '@/lib/session-types'

export interface SessionPageTabsProps {
  /** The page's session type, shown as selected. */
  type: SessionTypeId
}

/** Links between the three session pages, under the page intro. The current type is selected. */
export function SessionPageTabs({ type }: SessionPageTabsProps) {
  const { title } = getSessionType(type)
  return (
    <Placeholder
      label={content.session_page.placeholders.tabs.replace('{title}', title)}
    />
  )
}
