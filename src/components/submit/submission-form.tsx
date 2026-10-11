import { useCallback, useState, useSyncExternalStore } from 'react'

import content from '@/content.json'
import { LinkedText } from '@/components/linked-text'
import { SubmissionFieldControl } from '@/components/submit/submission-field'
import { Button } from '@/components/ui/button'
import { Fieldset, FieldsetLegend } from '@/components/ui/fieldset'
import { Form } from '@/components/ui/form'
import type { SessionTypeId } from '@/lib/session-types'
import {
  createSubmissionStore,
  getSubmissionSections,
  isFieldVisible,
  type SubmissionValue,
} from '@/lib/submission'
import { cn } from '@/lib/utils'

const text = content.submit_page

/** The form of one session type, laid out from forms.json. */
export function SubmissionForm({ type }: { type: SessionTypeId }) {
  const [store] = useState(createSubmissionStore)
  const states = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  )
  const { values, errors, isSubmitting, result } = states[type]
  const sections = getSubmissionSections(type)
  const setValue = useCallback(
    (key: string, value: SubmissionValue) => store.setValue(type, key, value),
    [store, type],
  )
  const failed = result != null && result.status !== 'success'

  return (
    <section className="px-2.5">
      <div className="mx-auto max-w-content">
        <Form
          key={type}
          aria-busy={isSubmitting}
          // Keep no-errors stable while awaiting a response, so Base UI focuses
          // the first invalid control when asynchronous field errors arrive.
          errors={Object.keys(errors).length ? errors : undefined}
          onSubmit={(event) => {
            event.preventDefault()
            void store.submit(type)
          }}
        >
          {sections.map((section) => (
            <Fieldset
              key={section.id}
              disabled={isSubmitting}
              className="px-2.5 py-7.5"
            >
              <FieldsetLegend>
                <h2>{section.title}</h2>
              </FieldsetLegend>
              {section.description.map((paragraph) => (
                <p key={paragraph} className="text-body text-light">
                  <LinkedText text={paragraph} />
                </p>
              ))}
              {section.fields
                .filter((field) => isFieldVisible(field, values))
                .map((field) => (
                  <SubmissionFieldControl
                    key={field.key}
                    field={field}
                    value={values[field.key]}
                    error={errors[field.key]}
                    disabled={isSubmitting}
                    onValueChange={setValue}
                  />
                ))}
            </Fieldset>
          ))}

          <div className="flex flex-col items-start gap-5 px-2.5 pt-7.5 pb-15">
            <Button disabled={isSubmitting} type="submit" shape="pill">
              {isSubmitting ? text.loading : text.submit}
            </Button>
            <p
              role={failed ? 'alert' : 'status'}
              className={cn('text-body', failed ? 'text-red' : 'text-light')}
            >
              {result?.message}
            </p>
          </div>
        </Form>
      </div>
    </section>
  )
}
