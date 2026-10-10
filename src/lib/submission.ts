import content from '@/content.json'
import type { SessionTypeId } from '@/lib/session-types'

export type SubmissionValue = string | string[] | boolean
export type SubmissionValues = Record<string, SubmissionValue>
export type SubmissionErrors = Record<string, string>
export type SubmissionDrafts = Record<SessionTypeId, SubmissionValues>
export type MockOutcome = 'success' | 'field-error' | 'server-error'

export interface SubmissionField {
  key: string
  kind: 'input' | 'textarea' | 'radio' | 'checkbox-group' | 'checkbox'
  group: 'details' | 'choices' | 'consent'
  label: string
  description: string
  required: boolean
  inputType?: 'text' | 'email'
  placeholder?: string
  maxLength?: number
  options?: readonly { value: string; label: string }[]
}

const text = content.submit_page.fields

/** Development examples only. Issue #5 replaces these with the real schema. */
const demoFields: readonly SubmissionField[] = [
  {
    key: 'name',
    kind: 'input',
    group: 'details',
    ...text.name,
    required: true,
    inputType: 'text',
    maxLength: 80,
  },
  {
    key: 'email',
    kind: 'input',
    group: 'details',
    ...text.email,
    required: true,
    inputType: 'email',
    maxLength: 160,
  },
  {
    key: 'summary',
    kind: 'textarea',
    group: 'details',
    ...text.summary,
    required: true,
    maxLength: 1200,
  },
  {
    key: 'format',
    kind: 'radio',
    group: 'choices',
    label: text.format.label,
    description: text.format.description,
    required: true,
    options: Object.entries(text.format.options).map(([value, label]) => ({
      value,
      label,
    })),
  },
  {
    key: 'topics',
    kind: 'checkbox-group',
    group: 'choices',
    label: text.topics.label,
    description: text.topics.description,
    required: true,
    options: Object.entries(text.topics.options).map(([value, label]) => ({
      value,
      label,
    })),
  },
  {
    key: 'consent',
    kind: 'checkbox',
    group: 'consent',
    ...text.consent,
    required: true,
  },
]

// Explicitly keyed by type: the real schemas can diverge without UI changes.
const fieldsByType: Record<SessionTypeId, readonly SubmissionField[]> = {
  general: demoFields,
  open: demoFields,
  demo: demoFields,
}

export function getSubmissionFields(type: SessionTypeId) {
  return fieldsByType[type]
}

function createEmptyValues(type: SessionTypeId): SubmissionValues {
  return Object.fromEntries(
    getSubmissionFields(type).map((field) => [
      field.key,
      field.kind === 'checkbox'
        ? false
        : field.kind === 'checkbox-group'
          ? []
          : '',
    ]),
  )
}

/** Fresh, independent drafts for the lifetime of a mounted submission page. */
export function createSubmissionDrafts(): SubmissionDrafts {
  return {
    general: createEmptyValues('general'),
    open: createEmptyValues('open'),
    demo: createEmptyValues('demo'),
  }
}

export function updateSubmissionDraft(
  drafts: SubmissionDrafts,
  type: SessionTypeId,
  key: string,
  value: SubmissionValue,
): SubmissionDrafts {
  return { ...drafts, [type]: { ...drafts[type], [key]: value } }
}

/** Example validation rules, driven by the field definitions. */
export function validateSubmission(
  type: SessionTypeId,
  values: SubmissionValues,
): SubmissionErrors {
  const errors: SubmissionErrors = {}
  const messages = content.submit_page.validation

  for (const field of getSubmissionFields(type)) {
    const value = values[field.key]
    let error: string | undefined

    if (field.kind === 'checkbox') {
      if (field.required && value !== true) error = messages.consent
    } else if (field.kind === 'radio' || field.kind === 'checkbox-group') {
      const choices = field.kind === 'radio' ? [value] : value
      const empty =
        !Array.isArray(choices) ||
        choices.length === 0 ||
        choices.every((choice) => choice === '' || choice === undefined)

      if (empty && field.required) {
        error = messages.requiredChoice
      } else if (
        !empty &&
        (!Array.isArray(choices) ||
          choices.some(
            (choice) =>
              !field.options?.some((option) => option.value === choice),
          ))
      ) {
        error = messages.invalidChoice
      }
    } else {
      const input = typeof value === 'string' ? value.trim() : ''
      if (!input && field.required) {
        error = messages.requiredText
      } else if (field.maxLength && input.length > field.maxLength) {
        error = messages.maxLength.replace('{limit}', String(field.maxLength))
      } else if (
        input &&
        field.inputType === 'email' &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
      ) {
        error = messages.email
      }
    }

    if (error) errors[field.key] = error.replace('{label}', field.label)
  }
  return errors
}

type MockResultBase = { mock: true; type: SessionTypeId; message: string }
export type SubmissionResult = MockResultBase &
  (
    | { status: 'success' }
    | { status: 'field-error'; errors: SubmissionErrors }
    | { status: 'server-error' }
  )

/**
 * Development-only adapter: no network requests, persistence or logging.
 */
export async function submit(
  type: SessionTypeId,
  values: SubmissionValues,
  outcome: MockOutcome = 'success',
): Promise<SubmissionResult> {
  const errors = validateSubmission(type, values)
  const text = content.submit_page.mock
  const base = { mock: true as const, type }

  if (Object.keys(errors).length) {
    return { ...base, status: 'field-error', errors, message: text.fieldError }
  }

  await new Promise<void>((resolve) => setTimeout(resolve, 600))

  if (outcome === 'field-error') {
    return {
      ...base,
      status: 'field-error',
      errors: { email: text.emailError },
      message: text.fieldError,
    }
  }
  if (outcome === 'server-error') {
    return { ...base, status: 'server-error', message: text.serverError }
  }
  return { ...base, status: 'success', message: text.success }
}

export interface SubmissionState {
  values: SubmissionValues
  errors: SubmissionErrors
  isSubmitting: boolean
  result: SubmissionResult | null
}

type SubmissionStates = Record<SessionTypeId, SubmissionState>

/** One store per mounted form; responses always update the sending type. */
export function createSubmissionStore(adapter: typeof submit = submit) {
  const drafts = createSubmissionDrafts()
  const initial = (values: SubmissionValues): SubmissionState => ({
    values,
    errors: {},
    isSubmitting: false,
    result: null,
  })
  let state: SubmissionStates = {
    general: initial(drafts.general),
    open: initial(drafts.open),
    demo: initial(drafts.demo),
  }
  const listeners = new Set<() => void>()

  function update(type: SessionTypeId, patch: Partial<SubmissionState>) {
    state = { ...state, [type]: { ...state[type], ...patch } }
    listeners.forEach((listener) => listener())
  }

  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setValue(type: SessionTypeId, key: string, value: SubmissionValue) {
      if (state[type].isSubmitting) return
      const errors = { ...state[type].errors }
      delete errors[key]
      update(type, {
        values: { ...state[type].values, [key]: value },
        errors,
        result: null,
      })
    },
    async submit(
      type: SessionTypeId,
      outcome: MockOutcome = 'success',
    ): Promise<SubmissionResult | null> {
      // Synchronous guard also covers a second send before React rerenders.
      if (state[type].isSubmitting) return null
      const values = state[type].values
      update(type, { isSubmitting: true, errors: {}, result: null })

      let result: SubmissionResult
      try {
        result = await adapter(type, values, outcome)
      } catch {
        result = {
          mock: true,
          type,
          status: 'server-error',
          message: content.submit_page.mock.serverError,
        }
      }
      update(type, {
        isSubmitting: false,
        errors: result.status === 'field-error' ? result.errors : {},
        result,
      })
      return result
    },
  }
}
