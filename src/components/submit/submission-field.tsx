import { Circle } from 'lucide-react'
import { Toolbar } from '@base-ui/react/toolbar'
import { useId, type KeyboardEvent } from 'react'

import content from '@/content.json'
import { LinkedText } from '@/components/linked-text'
import { Placeholder } from '@/components/placeholder'
import { Checkbox, CheckboxCard } from '@/components/ui/checkbox'
import { CheckboxGroup } from '@/components/ui/checkbox-group'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import {
  pendingKinds,
  type SubmissionField,
  type SubmissionValue,
} from '@/lib/submission'

const text = content.submit_page

function confirmChoice(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== 'Enter') return
  // Activate through Base UI's click handling, without submitting the form.
  event.preventDefault()
  if (!event.repeat) event.currentTarget.click()
}

/** Field kinds determine controls; groups only determine their placement. */
export function SubmissionFieldControl({
  field,
  value,
  error,
  disabled,
  onValueChange,
}: {
  field: SubmissionField
  value: SubmissionValue | undefined
  error?: string
  disabled: boolean
  onValueChange: (value: SubmissionValue) => void
}) {
  const id = useId()
  const title = field.public
    ? text.publicLabel.replace('{label}', field.label)
    : field.label
  const label = field.required
    ? text.requiredLabel.replace('{label}', title)
    : title
  const isText =
    field.kind === 'text' ||
    field.kind === 'email' ||
    field.kind === 'tel' ||
    field.kind === 'textarea'
  const isGroup =
    field.kind === 'radio' ||
    field.kind === 'checkboxes' ||
    field.kind === 'consent' ||
    pendingKinds.has(field.kind)

  return (
    <Field
      name={field.key}
      disabled={disabled}
      invalid={Boolean(error)}
      className="max-w-183.5"
    >
      <FieldLabel
        id={`${id}-label`}
        nativeLabel={isText}
        render={isGroup ? <span /> : undefined}
      >
        {label}
      </FieldLabel>
      {(field.kind === 'text' ||
        field.kind === 'email' ||
        field.kind === 'tel') && (
        <Input
          // Format validation uses the shared schema and JSON messages.
          inputMode={field.kind}
          autoComplete="off"
          aria-required={field.required}
          value={typeof value === 'string' ? value : ''}
          onValueChange={onValueChange}
        />
      )}
      {field.kind === 'textarea' && (
        <Textarea
          aria-required={field.required}
          value={typeof value === 'string' ? value : ''}
          onValueChange={onValueChange}
        />
      )}
      {pendingKinds.has(field.kind) && (
        // TODO(#5): replace with the Select and file upload primitives.
        <Placeholder
          label={text.pendingControl.replace(
            '{kind}',
            text.pendingKinds[field.kind as keyof typeof text.pendingKinds],
          )}
          className="min-h-20 text-paragraph"
        />
      )}
      {field.kind === 'radio' ? (
        <RadioGroup
          name={field.key}
          value={typeof value === 'string' ? value : ''}
          disabled={disabled}
          aria-labelledby={`${id}-label`}
          aria-required={field.required}
          onValueChange={(value) => {
            if (typeof value === 'string') onValueChange(value)
          }}
          className="rounded-none rounded-tl-none bg-background p-0"
        >
          {field.options?.map((option, index) => (
            <RadioGroupItem
              key={option}
              value={option}
              aria-labelledby={`${id}-${index}`}
              // Keep Base UI's arrow navigation, but require explicit activation.
              onFocus={(event) => event.preventDefault()}
              onKeyDown={confirmChoice}
              className="group min-h-20 gap-2.5 rounded-sm border-2 border-gray bg-background px-5 py-2.5 text-foreground data-checked:bg-foreground data-checked:text-background data-invalid:border-red"
            >
              <Circle
                aria-hidden="true"
                className="size-6 shrink-0 group-data-checked:fill-current"
              />
              <span id={`${id}-${index}`}>{option}</span>
            </RadioGroupItem>
          ))}
        </RadioGroup>
      ) : null}
      {field.kind === 'checkboxes' && (
        <Toolbar.Root
          orientation="vertical"
          disabled={disabled}
          role="group"
          aria-orientation={undefined}
          render={
            <CheckboxGroup
              value={Array.isArray(value) ? value : []}
              disabled={disabled}
              aria-labelledby={`${id}-label`}
              onValueChange={onValueChange}
            />
          }
        >
          {field.options?.map((option, index) => (
            <Toolbar.Button
              key={option}
              nativeButton={false}
              role="checkbox"
              focusableWhenDisabled={false}
              render={
                <CheckboxCard
                  value={option}
                  aria-labelledby={`${id}-${index}`}
                  onKeyDown={confirmChoice}
                />
              }
            >
              <span id={`${id}-${index}`}>{option}</span>
            </Toolbar.Button>
          ))}
        </Toolbar.Root>
      )}
      {field.kind === 'consent' && (
        // A confirmation is a single-option question, as in Google Forms.
        <Checkbox
          checked={value === true}
          aria-required={field.required}
          aria-labelledby={`${id}-label ${id}-0`}
          onCheckedChange={onValueChange}
          onKeyDown={confirmChoice}
          className="min-h-control text-left"
        >
          <span id={`${id}-0`}>{field.options?.[0]}</span>
        </Checkbox>
      )}
      {field.description && (
        <FieldDescription>
          <LinkedText text={field.description} />
        </FieldDescription>
      )}
      {error && <FieldError match>{error}</FieldError>}
    </Field>
  )
}
