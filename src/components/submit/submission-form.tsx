import { useId, useState, useSyncExternalStore } from 'react'

import content from '@/content.json'
import { SubmissionFieldControl } from '@/components/submit/submission-field'
import { Button } from '@/components/ui/button'
import { Fieldset, FieldsetLegend } from '@/components/ui/fieldset'
import { Form } from '@/components/ui/form'
import type { SessionTypeId } from '@/lib/session-types'
import {
  createSubmissionStore,
  getSubmissionFields,
  type MockOutcome,
  type SubmissionField,
} from '@/lib/submission'

const text = content.submit_page

const mockOutcomeField: SubmissionField = {
  key: 'mock-outcome',
  kind: 'radio',
  group: 'choices',
  required: false,
  label: text.mock.outcomeLabel,
  description: text.mock.outcomeDescription,
  options: Object.entries(text.mock.outcomes).map(([value, label]) => ({
    value,
    label,
  })),
}

/** Shared controls and validation, with an explicitly simulated submission. */
export function SubmissionForm({ type }: { type: SessionTypeId }) {
  const id = useId()
  const [store] = useState(createSubmissionStore)
  const [outcomes, setOutcomes] = useState<Record<SessionTypeId, MockOutcome>>({
    general: 'success',
    open: 'success',
    demo: 'success',
  })
  const states = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  )
  const { values, errors, isSubmitting, result } = states[type]
  const fields = getSubmissionFields(type)

  function renderField(field: SubmissionField) {
    return (
      <SubmissionFieldControl
        key={`${type}-${field.key}`}
        field={field}
        value={values[field.key]}
        error={errors[field.key]}
        disabled={isSubmitting}
        onValueChange={(value) => store.setValue(type, field.key, value)}
      />
    )
  }

  return (
    <section className="px-2.5" aria-describedby={`${id}-mock`}>
      <div className="mx-auto max-w-content">
        <div
          id={`${id}-mock`}
          className="mx-2.5 mb-7.5 flex flex-col gap-2.5 rounded-sm border border-blue p-5"
        >
          <p className="text-paragraph font-bold">{text.mockNotice}</p>
          <p className="text-body text-light">{text.demoDescription}</p>
          <SubmissionFieldControl
            key={type}
            field={mockOutcomeField}
            value={outcomes[type]}
            disabled={isSubmitting}
            onValueChange={(value) => {
              if (
                value === 'success' ||
                value === 'field-error' ||
                value === 'server-error'
              ) {
                setOutcomes((current) => ({ ...current, [type]: value }))
              }
            }}
          />
        </div>

        <Form
          key={type}
          aria-busy={isSubmitting}
          aria-describedby={`${id}-mock`}
          // Keep no-errors stable while awaiting a response, so Base UI focuses
          // the first invalid control when asynchronous field errors arrive.
          errors={Object.keys(errors).length ? errors : undefined}
          onSubmit={(event) => {
            event.preventDefault()
            void store.submit(type, outcomes[type])
          }}
        >
          <Fieldset disabled={isSubmitting} className="px-2.5 py-7.5">
            <FieldsetLegend>
              <h2>{text.detailsTitle}</h2>
            </FieldsetLegend>
            {fields
              .filter((field) => field.group === 'details')
              .map(renderField)}
          </Fieldset>

          <Fieldset disabled={isSubmitting} className="px-2.5 py-7.5">
            <FieldsetLegend>
              <h2>{text.choicesTitle}</h2>
            </FieldsetLegend>
            {fields
              .filter((field) => field.group === 'choices')
              .map(renderField)}
          </Fieldset>

          <div className="flex flex-col items-start gap-5 px-2.5 pt-7.5 pb-15">
            {fields
              .filter((field) => field.group === 'consent')
              .map(renderField)}
            <Button
              disabled={isSubmitting}
              type="submit"
              className="rounded-full"
              aria-describedby={`${id}-mock`}
            >
              {isSubmitting ? text.loading : text.submit}
            </Button>
            <p
              role={result && result.status !== 'success' ? 'alert' : 'status'}
              className={
                result && result.status !== 'success'
                  ? 'text-body text-red'
                  : 'text-body text-light'
              }
            >
              {result?.message}
            </p>
          </div>
        </Form>
      </div>
    </section>
  )
}
