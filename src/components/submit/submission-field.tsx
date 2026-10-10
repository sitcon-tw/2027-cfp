import { Circle } from 'lucide-react'
import { useId } from 'react'

import content from '@/content.json'
import { Placeholder } from '@/components/placeholder'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { SubmissionField, SubmissionValue } from '@/lib/submission'

const text = content.submit_page
const pendingControls = {
  input: text.controls.input,
  textarea: text.controls.textarea,
  'checkbox-group': text.controls.checkboxGroup,
  checkbox: text.controls.checkbox,
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
  const label = field.required
    ? text.requiredLabel.replace('{label}', field.label)
    : field.label

  return (
    <div className="flex w-full max-w-183.5 flex-col gap-2.5 py-2.5">
      <p id={`${id}-label`} className="text-paragraph">
        {label}
      </p>
      {field.kind === 'radio' ? (
        <RadioGroup
          name={field.key}
          value={typeof value === 'string' ? value : ''}
          disabled={disabled}
          aria-labelledby={`${id}-label`}
          aria-describedby={
            error ? `${id}-description ${id}-error` : `${id}-description`
          }
          aria-required={field.required}
          aria-invalid={Boolean(error)}
          onValueChange={(value) => {
            if (typeof value === 'string') onValueChange(value)
          }}
          className="rounded-none rounded-tl-none bg-background p-0"
        >
          {field.options?.map((option) => (
            <RadioGroupItem
              key={option.value}
              value={option.value}
              aria-label={option.label}
              className="group min-h-20 gap-2.5 rounded-sm border-2 border-gray bg-background px-5 py-2.5 text-foreground data-checked:bg-foreground data-checked:text-background"
            >
              <Circle
                aria-hidden="true"
                className="size-6 shrink-0 group-data-checked:fill-current"
              />
              {option.label}
            </RadioGroupItem>
          ))}
        </RadioGroup>
      ) : (
        <Placeholder
          label={text.pendingControl.replace(
            '{control}',
            pendingControls[field.kind],
          )}
          className="min-h-20 text-body font-normal text-light"
        />
      )}
      <p id={`${id}-description`} className="text-body text-light">
        {field.description}
      </p>
      {error && (
        <p id={`${id}-error`} className="text-body text-red">
          {error}
        </p>
      )}
    </div>
  )
}
