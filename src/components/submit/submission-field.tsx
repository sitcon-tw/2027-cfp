import { Circle } from 'lucide-react'
import { Toolbar } from '@base-ui/react/toolbar'
import { useId, type KeyboardEvent } from 'react'

import content from '@/content.json'
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
import type { SubmissionField, SubmissionValue } from '@/lib/submission'

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
  const label = field.required
    ? text.requiredLabel.replace('{label}', field.label)
    : field.label

  return (
    <Field
      name={field.key}
      disabled={disabled}
      invalid={Boolean(error)}
      className={field.kind === 'checkbox' ? undefined : 'max-w-183.5'}
    >
      {field.kind !== 'checkbox' && (
        <FieldLabel
          id={`${id}-label`}
          nativeLabel={field.kind === 'input' || field.kind === 'textarea'}
          render={
            field.kind === 'radio' || field.kind === 'checkbox-group' ? (
              <span />
            ) : undefined
          }
        >
          {label}
        </FieldLabel>
      )}
      {field.kind === 'input' && (
        <Input
          // Format validation uses the shared schema and JSON messages.
          inputMode={field.inputType === 'email' ? 'email' : 'text'}
          autoComplete="off"
          aria-required={field.required}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          value={typeof value === 'string' ? value : ''}
          onValueChange={onValueChange}
        />
      )}
      {field.kind === 'textarea' && (
        <Textarea
          aria-required={field.required}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          value={typeof value === 'string' ? value : ''}
          onValueChange={onValueChange}
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
          {field.options?.map((option) => (
            <RadioGroupItem
              key={option.value}
              value={option.value}
              aria-labelledby={`${id}-${option.value}`}
              // Keep Base UI's arrow navigation, but require explicit activation.
              onFocus={(event) => event.preventDefault()}
              onKeyDown={confirmChoice}
              className="group min-h-20 gap-2.5 rounded-sm border-2 border-gray bg-background px-5 py-2.5 text-foreground data-checked:bg-foreground data-checked:text-background data-invalid:border-red"
            >
              <Circle
                aria-hidden="true"
                className="size-6 shrink-0 group-data-checked:fill-current"
              />
              <span id={`${id}-${option.value}`}>{option.label}</span>
            </RadioGroupItem>
          ))}
        </RadioGroup>
      ) : null}
      {field.kind === 'checkbox-group' && (
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
          {field.options?.map((option) => (
            <Toolbar.Button
              key={option.value}
              nativeButton={false}
              role="checkbox"
              focusableWhenDisabled={false}
              render={
                <CheckboxCard
                  value={option.value}
                  aria-labelledby={`${id}-${option.value}`}
                  onKeyDown={confirmChoice}
                />
              }
            >
              <span id={`${id}-${option.value}`}>{option.label}</span>
            </Toolbar.Button>
          ))}
        </Toolbar.Root>
      )}
      {field.kind === 'checkbox' && (
        <Checkbox
          checked={value === true}
          aria-required={field.required}
          aria-label={label}
          onCheckedChange={onValueChange}
          onKeyDown={confirmChoice}
          className="min-h-control text-left"
        >
          {label}
        </Checkbox>
      )}
      <FieldDescription>{field.description}</FieldDescription>
      {error && <FieldError match>{error}</FieldError>}
    </Field>
  )
}
