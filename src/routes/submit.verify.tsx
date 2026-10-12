import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import content from '@/content.json'
import heroPhotoPlaceholder from '@/assets/submit-hero.webp?placeholder'
import heroPhoto from '@/assets/submit-hero.webp?responsive'
import { PageHero } from '@/components/page-hero'
import { SubmissionNotice } from '@/components/submit/submission-notice'
import { deadlines } from '@/lib/deadlines'
import { formatDateTime } from '@/lib/schedule'
import {
  isMockSubmission,
  verifySubmission,
  type VerifyResult,
} from '@/lib/submission-client'
import { verifyTokenHours } from '@/lib/submission-api'

export const Route = createFileRoute('/submit/verify')({
  // `token`: from the link in the verification email.
  validateSearch: (search: Record<string, unknown>): { token?: string } =>
    typeof search.token === 'string' && search.token
      ? { token: search.token }
      : {},
  component: VerifyPage,
})

const text = content.submit_verify

/**
 * Where the verification email links: confirms the address, which completes
 * the submission and has the API email its copy and edit link.
 */
function VerifyPage() {
  const { token } = Route.useSearch()
  return (
    <main className="overflow-x-clip">
      <PageHero
        title={content.submit_page.hero.title}
        description={content.submit_page.hero.description}
        image={heroPhoto}
        placeholder={heroPhotoPlaceholder}
      />
      {token ? (
        <Verification key={token} token={token} />
      ) : (
        <SubmissionNotice
          title={text.invalidTitle}
          description={text.invalidDescription}
        />
      )}
    </main>
  )
}

function Verification({ token }: { token: string }) {
  const [result, setResult] = useState<VerifyResult | null>(null)

  useEffect(() => {
    let active = true
    void verifySubmission(token).then((verified) => {
      if (active) setResult(verified)
    })
    return () => {
      active = false
    }
  }, [token])

  const [title, description] = (() => {
    switch (result?.status) {
      case undefined:
        return [text.verifyingTitle, text.verifyingDescription]
      case 'verified':
        return [
          text.successTitle,
          text.successDescription.replace(
            '{deadline}',
            deadlines.submission ? formatDateTime(deadlines.submission) : '',
          ),
        ]
      case 'expired':
        return [
          text.expiredTitle,
          text.expiredDescription.replace('{hours}', String(verifyTokenHours)),
        ]
      case 'invalid':
        return [text.invalidTitle, text.invalidDescription]
      case 'not-found':
        return [text.notFoundTitle, text.notFoundDescription]
      case 'error':
        return [
          text.errorTitle,
          isMockSubmission ? text.mockDescription : text.errorDescription,
        ]
    }
  })()

  return <SubmissionNotice live title={title} description={description} />
}
