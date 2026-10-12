import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import content from '@/content.json'
import { SubmissionForm } from '@/components/submit/submission-form'
import { SubmissionNotice } from '@/components/submit/submission-notice'
import { deadlines } from '@/lib/deadlines'
import { formatDateTime } from '@/lib/schedule'
import type { SessionTypeId } from '@/lib/session-types'
import {
  isMockSubmission,
  loadEditDraft,
  type EditLoadResult,
} from '@/lib/submission-client'

const text = content.submit_page.edit

/**
 * The form behind an emailed edit link: loads the latest verified version and
 * sends the next one. Remount it (`key`) for another token.
 */
export function EditSubmission({
  type,
  token,
}: {
  type: SessionTypeId
  token: string
}) {
  const [result, setResult] = useState<EditLoadResult | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    let active = true
    void loadEditDraft(token).then((loaded) => {
      if (active) setResult(loaded)
    })
    return () => {
      active = false
    }
  }, [token])

  // A link opened under another type's tab moves to the submission's own.
  const draftType = result?.status === 'ok' ? result.draft.type : null
  useEffect(() => {
    if (draftType && draftType !== type) {
      void navigate({
        to: '/submit/$type',
        params: { type: draftType },
        search: { edit: token },
        replace: true,
      })
    }
  }, [draftType, type, token, navigate])

  if (!result || (result.status === 'ok' && result.draft.type !== type)) {
    return (
      <SubmissionNotice
        live
        title={text.loadingTitle}
        description={text.loadingDescription}
      />
    )
  }
  switch (result.status) {
    case 'invalid':
      return (
        <SubmissionNotice
          live
          title={text.invalidTitle}
          description={text.invalidDescription}
        />
      )
    case 'closed':
      return (
        <SubmissionNotice
          live
          title={content.submit_closed.title}
          description={content.submit_closed.description.replace(
            '{deadline}',
            deadlines.submission ? formatDateTime(deadlines.submission) : '',
          )}
        />
      )
    case 'error':
      return (
        <SubmissionNotice
          live
          title={text.errorTitle}
          description={
            isMockSubmission ? text.mockDescription : text.errorDescription
          }
        />
      )
  }

  return (
    <>
      <div className="px-2.5 py-7.5">
        <p
          role="status"
          className="mx-auto max-w-content p-2.5 text-center text-h3 font-bold text-balance"
        >
          {text.notice.replace('{id}', result.draft.id)}
        </p>
      </div>
      <SubmissionForm type={type} edit={{ token, draft: result.draft }} />
    </>
  )
}
