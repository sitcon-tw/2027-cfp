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
 * the submission and has the API email its copy and edit link. The hero is
 * the page's own (not 我要投稿！) and follows the outcome: verifying,
 * success or failure; the message under it gives the details.
 */
function VerifyPage() {
  const { token } = Route.useSearch()
  const result = useVerification(token)
  const hero =
    result === null
      ? text.hero.verifying
      : result.status === 'verified'
        ? text.hero.success
        : text.hero.failure
  return (
    <main className="overflow-x-clip">
      <PageHero
        title={hero.title}
        description={hero.description}
        image={heroPhoto}
        placeholder={heroPhotoPlaceholder}
      />
      {/* Stays mounted, so the outcome is announced when it arrives. */}
      <div aria-live="polite">
        {result && <VerificationNotice result={result} />}
      </div>
    </main>
  )
}

/** The outcome for `token`; `null` while verifying. No token is invalid. */
function useVerification(token: string | undefined): VerifyResult | null {
  const [verified, setVerified] = useState<{
    token: string
    result: VerifyResult
  } | null>(null)

  useEffect(() => {
    if (!token) return
    let active = true
    void verifySubmission(token).then((result) => {
      if (active) setVerified({ token, result })
    })
    return () => {
      active = false
    }
  }, [token])

  if (!token) return { status: 'invalid' }
  return verified?.token === token ? verified.result : null
}

function VerificationNotice({ result }: { result: VerifyResult }) {
  const [title, description] = (() => {
    switch (result.status) {
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

  return <SubmissionNotice title={title} description={description} />
}
