import { memo, useId } from 'react'

import content from '@/content.json'
import { LinkedText } from '@/components/linked-text'
import { Badge } from '@/components/ui/badge'
import { Checkbox, CheckboxCard } from '@/components/ui/checkbox'
import { CheckboxGroup } from '@/components/ui/checkbox-group'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RadioCard, RadioCardGroup } from '@/components/ui/radio-group'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  textKinds,
  type SubmissionField,
  type SubmissionValue,
} from '@/lib/submission'

const text = content.submit_page

/**
 * Field kinds determine controls; groups only determine their placement.
 * Memoized with a stable `onValueChange`, so a keystroke re-renders only the
 * edited field.
 */
export const SubmissionFieldControl = memo(function SubmissionFieldControl({
  field,
  value,
  error,
  disabled,
  onValueChange: setFieldValue,
}: {
  field: SubmissionField
  value: SubmissionValue | undefined
  error?: string
  disabled: boolean
  onValueChange: (key: string, value: SubmissionValue) => void
}) {
  const id = useId()
  const onValueChange = (value: SubmissionValue) =>
    setFieldValue(field.key, value)
  const isText = textKinds.has(field.kind)

  return (
    <Field name={field.key} invalid={Boolean(error)} className="max-w-183.5">
      <div className="flex flex-wrap items-center gap-2.5">
        <FieldLabel
          id={`${id}-label`}
          nativeLabel={isText}
          render={isText ? undefined : <span />}
        >
          {field.label}
        </FieldLabel>
        {field.required && (
          <Badge id={`${id}-required`} tone="red">
            {text.requiredBadge}
          </Badge>
        )}
        {field.public && <Badge>{text.publicBadge}</Badge>}
      </div>
      {field.description && (
        <FieldDescription>
          <LinkedText text={field.description} />
        </FieldDescription>
      )}
      {isText && field.kind !== 'textarea' && (
        <Input
          // Format validation uses the shared schema and JSON messages.
          inputMode={field.kind as 'text' | 'email' | 'tel'}
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
      {field.kind === 'select' && (
        <Select
          value={typeof value === 'string' && value ? value : null}
          options={(field.options ?? []).map((option) => ({
            label: option,
            value: option,
          }))}
          placeholder={text.selectPlaceholder}
          aria-labelledby={`${id}-label`}
          aria-required={field.required}
          onValueChange={(value) => onValueChange(value ?? '')}
        />
      )}
      {field.kind === 'radio' && (
        <RadioCardGroup
          name={field.key}
          value={typeof value === 'string' ? value : ''}
          aria-labelledby={`${id}-label`}
          aria-required={field.required}
          onValueChange={(value) => {
            if (typeof value === 'string') onValueChange(value)
          }}
        >
          {field.options?.map((option, index) => (
            <RadioCard
              key={option}
              value={option}
              aria-labelledby={`${id}-${index}`}
            >
              <span id={`${id}-${index}`}>{option}</span>
            </RadioCard>
          ))}
        </RadioCardGroup>
      )}
      {field.kind === 'checkboxes' && (
        <CheckboxGroup
          value={Array.isArray(value) ? value : []}
          // Toolbar's roving focus does not read the fieldset's disabled state.
          disabled={disabled}
          aria-labelledby={`${id}-label`}
          aria-describedby={field.required ? `${id}-required` : undefined}
          onValueChange={onValueChange}
        >
          {field.options?.map((option, index) => (
            <CheckboxCard
              key={option}
              value={option}
              aria-labelledby={`${id}-${index}`}
            >
              <span id={`${id}-${index}`}>{option}</span>
            </CheckboxCard>
          ))}
        </CheckboxGroup>
      )}
      {field.kind === 'consent' && (
        // A confirmation is a single-option question, as in Google Forms, and
        // stores that option's text when checked.
        <Checkbox
          checked={value === field.options?.[0]}
          aria-required={field.required}
          aria-labelledby={`${id}-label ${id}-0`}
          onCheckedChange={(checked) =>
            onValueChange(checked ? field.options![0] : '')
          }
        >
          <span id={`${id}-0`}>{field.options?.[0]}</span>
        </Checkbox>
      )}
      {error && <FieldError match>{error}</FieldError>}
    </Field>
  )
})
