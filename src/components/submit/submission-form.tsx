import { useCallback, useState, useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

import content from '@/content.json'
import { LinkedText } from '@/components/linked-text'
import { SubmissionFieldControl } from '@/components/submit/submission-field'
import { Turnstile } from '@/components/submit/turnstile'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Fieldset, FieldsetLegend } from '@/components/ui/fieldset'
import { Form } from '@/components/ui/form'
import type { SessionTypeId } from '@/lib/session-types'
import {
  getSubmissionSections,
  isFieldVisible,
  type SubmissionValue,
} from '@/lib/submission'
import type { EditDraft } from '@/lib/submission-api'
import {
  createSubmissionStore,
  isMockSubmission,
  isSubmitted,
  turnstileSiteKey,
} from '@/lib/submission-client'
import { cn, pad } from '@/lib/utils'

const text = content.submit_page

/**
 * The form of one session type, laid out from forms.json. With `edit`, it
 * starts from that draft and sends a new version of it.
 */
export function SubmissionForm({
  type,
  edit,
}: {
  type: SessionTypeId
  edit?: { token: string; draft: EditDraft }
}) {
  const [store] = useState(() => createSubmissionStore(edit))
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  // A token is spent on every send, so each send gets a fresh widget.
  const [turnstileRound, setTurnstileRound] = useState(0)
  const states = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  )
  const state = states[type]
  const { values, errors, isSubmitting, result } = state
  const locked = isSubmitting || isSubmitted(state)
  const sections = getSubmissionSections(type)
  const setValue = useCallback(
    (key: string, value: SubmissionValue) => store.setValue(type, key, value),
    [store, type],
  )
  const validateField = useCallback(
    (key: string) => store.validateField(type, key),
    [store, type],
  )
  const failed = result != null && result.status !== 'success'
  const loading = isMockSubmission ? text.mock.loading : text.loading

  return (
    <section className="px-2.5">
      <div className="mx-auto max-w-content">
        <Form
          key={type}
          aria-busy={isSubmitting}
          // Changes once per send (see `submit` in submission-client.ts), so
          // Base UI focuses the first invalid control when errors arrive.
          errors={errors}
          // Runs before Base UI's own check, which would stop at a field
          // already showing an error; committed at once so it sees them all.
          onSubmitCapture={() => flushSync(() => store.validate(type))}
          onSubmit={(event) => {
            event.preventDefault()
            void store.submit(type, turnstileToken).then(() => {
              setTurnstileToken(null)
              setTurnstileRound((round) => round + 1)
            })
          }}
        >
          {sections.map((section, index) => (
            <Fieldset
              key={section.id}
              disabled={locked}
              className="px-2.5 py-10"
            >
              <FieldsetLegend
                aside={
                  <Badge aria-hidden className="font-numeric">
                    {text.sectionPosition
                      .replace('{position}', pad(index + 1))
                      .replace('{total}', pad(sections.length))}
                  </Badge>
                }
              >
                <h2>{section.title}</h2>
              </FieldsetLegend>
              <div className="flex w-full flex-col gap-2.5 md:w-2/3">
                {section.description.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-body text-light [&_a]:text-foreground [&_strong]:text-foreground"
                  >
                    <LinkedText text={paragraph} />
                  </p>
                ))}
              </div>
              {section.fields
                .filter((field) => isFieldVisible(field, values))
                .map((field) => (
                  <SubmissionFieldControl
                    key={field.key}
                    field={field}
                    value={values[field.key]}
                    error={errors[field.key]}
                    disabled={locked}
                    onValueChange={setValue}
                    onValidate={validateField}
                  />
                ))}
            </Fieldset>
          ))}

          <div className="flex flex-col items-start gap-5 px-2.5 pt-7.5 pb-15">
            {turnstileSiteKey && !isSubmitted(state) && (
              <Turnstile
                key={turnstileRound}
                siteKey={turnstileSiteKey}
                onToken={setTurnstileToken}
              />
            )}
            <Button disabled={locked} type="submit" shape="pill">
              {isSubmitting ? loading : edit ? text.edit.submit : text.submit}
            </Button>
            <p
              role={failed ? 'alert' : 'status'}
              className={cn('text-body', failed ? 'text-red' : 'text-light')}
            >
              {result && <LinkedText text={result.message} />}
            </p>
          </div>
        </Form>
      </div>
    </section>
  )
}
