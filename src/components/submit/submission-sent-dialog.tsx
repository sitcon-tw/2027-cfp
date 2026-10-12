import content from '@/content.json'
import { LinkedText } from '@/components/linked-text'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { verifyTokenHours } from '@/lib/submission-api'
import type { SubmissionResult } from '@/lib/submission-client'

const text = content.submit_page.sent

export type SentResult = Extract<SubmissionResult, { status: 'success' }>

/**
 * Pops up once a send succeeds, so it can't be missed: a new submission
 * still needs its verification email, which the steps walk through.
 */
export function SubmissionSentDialog({
  result,
  open,
  onOpenChange,
}: {
  result: SentResult | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const copy = result ? text[result.sent] : null
  const email = result && result.sent !== 'mock' ? result.email : ''

  return (
    <Dialog open={open && result != null} onOpenChange={onOpenChange}>
      {copy && (
        <DialogContent className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-2.5">
            <DialogTitle className="text-balance">{copy.title}</DialogTitle>
            <DialogClose aria-label={text.close} />
          </div>
          <DialogDescription>
            {copy.description.replace('{email}', email)}
          </DialogDescription>
          {result?.sent === 'pending' && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-paragraph font-bold">
                {text.pending.stepsTitle}
              </h3>
              <ol className="flex list-decimal flex-col gap-2.5 ps-7.5 text-paragraph text-gray marker:font-numeric marker:font-medium">
                {text.pending.steps.map((step) => (
                  <li key={step}>
                    <LinkedText
                      text={step
                        .replace(
                          '{subject}',
                          content.submission_email.verify.subject,
                        )
                        .replace('{hours}', String(verifyTokenHours))}
                    />
                  </li>
                ))}
              </ol>
            </div>
          )}
          <Button
            variant="dark"
            shape="pill"
            className="self-end"
            onClick={() => onOpenChange(false)}
          >
            {text.confirm}
          </Button>
        </DialogContent>
      )}
    </Dialog>
  )
}
