import { Link } from '@tanstack/react-router'
import { useMemo, type ReactNode } from 'react'

import content from '@/content.json'
import { ReadingLayout } from '@/components/reading-layout'
import { Button, buttonVariants } from '@/components/ui/button'
import { useSubmissionClosed } from '@/lib/countdown'
import { sessionSectionLinks } from '@/lib/reading-navigation'
import type { SessionTypeId } from '@/lib/session-types'

export function SessionReadingLayout({
  type,
  children,
}: {
  type: SessionTypeId
  children: ReactNode
}) {
  const sections = useMemo(() => sessionSectionLinks(type), [type])

  return (
    <ReadingLayout
      page={{ to: '/$type', params: { type } }}
      sections={sections}
      action={<SubmitLink type={type} />}
    >
      {children}
    </ReadingLayout>
  )
}

/** The map ends at the next step: this type's form. */
function SubmitLink({ type }: { type: SessionTypeId }) {
  const className = buttonVariants({ className: 'w-full' })
  return (
    <div className="pt-5">
      {useSubmissionClosed() ? (
        <Button disabled className="w-full">
          {content.submit_closed.button}
        </Button>
      ) : (
        <Link to="/submit/$type" params={{ type }} className={className}>
          {content.site_header.submitForm}
        </Link>
      )}
    </div>
  )
}
