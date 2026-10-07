import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'
import { getSessionType, type SessionTypeId } from '@/lib/session-types'

export interface SubmissionTypeTabsProps {
  /** The page's session type, shown as selected. */
  type: SessionTypeId
}

/** 今天想要投稿什麼議程？ — links between the three submission forms. The current type is selected. */
export function SubmissionTypeTabs({ type }: SubmissionTypeTabsProps) {
  const { title } = getSessionType(type)
  return (
    <Placeholder
      label={content.submit_page.placeholders.tabs.replace('{title}', title)}
    />
  )
}
