import { useId, useState, useSyncExternalStore } from 'react'

import content from '@/content.json'
import { SubmissionFieldControl } from '@/components/submit/submission-field'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { SessionTypeId } from '@/lib/session-types'
import {
  createSubmissionStore,
  getSubmissionFields,
  type SubmissionField,
} from '@/lib/submission'

const text = content.submit_page

/** Staged form UI: working radios; Form and other controls await shared primitives. */
export function SubmissionForm({ type }: { type: SessionTypeId }) {
  const id = useId()
  const [store] = useState(createSubmissionStore)
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
          <p className="text-body text-light">{text.pendingNotice}</p>
        </div>

        {/* Shared Form/Field primitives are required before enabling submission. */}
        <div key={type} aria-busy={isSubmitting}>
          <section className="flex flex-col gap-2.5 px-2.5 py-7.5">
            <h2 className="text-h3 font-bold">{text.detailsTitle}</h2>
            <Separator className="bg-light" />
            {fields
              .filter((field) => field.group === 'details')
              .map(renderField)}
          </section>

          <section className="flex flex-col gap-2.5 px-2.5 py-7.5">
            <h2 className="text-h3 font-bold">{text.choicesTitle}</h2>
            <Separator className="bg-light" />
            {fields
              .filter((field) => field.group === 'choices')
              .map(renderField)}
          </section>

          <div className="flex flex-col items-start gap-5 px-2.5 pt-7.5 pb-15">
            {fields
              .filter((field) => field.group === 'consent')
              .map(renderField)}
            <Button
              disabled
              type="button"
              className="rounded-full"
              aria-describedby={`${id}-mock`}
            >
              {isSubmitting ? text.loading : text.submit}
            </Button>
            <p role="status" className="text-body text-light">
              {result?.message}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
