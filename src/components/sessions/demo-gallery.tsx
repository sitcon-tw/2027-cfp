import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'
import { SessionSection } from '@/components/sessions/session-section'

const text = content.session_page.demoGallery

// Heights of the photo slots in Figma, column by column, so the two columns
// stagger. TODO: past Demo booth photos, from the organizers.
const columns = [
  ['h-87.25', 'h-131'],
  ['h-128', 'h-90.25'],
]

/** 歷年展區照片 — two-column photo wall of past Demo booths. */
export function DemoGallery() {
  return (
    <SessionSection title={text.title}>
      <div className="grid gap-5 md:grid-cols-2">
        {columns.map((slots, column) => (
          <div key={column} className="flex flex-col gap-5">
            {slots.map((height, i) => (
              <Placeholder
                key={i}
                label={text.placeholder}
                className={`${height} rounded-xl`}
              />
            ))}
          </div>
        ))}
      </div>
    </SessionSection>
  )
}
