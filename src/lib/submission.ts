import content from '@/content.json'
import forms from '@/forms.json'
import { sessionTypeIds } from '@/lib/session-type-ids'
import type { SessionTypeId } from '@/lib/session-types'

export type SubmissionValue = string | string[] | File | null
export type SubmissionValues = Record<string, SubmissionValue>
export type SubmissionErrors = Record<string, string>

const fieldKinds = [
  'text',
  'email',
  'tel',
  'textarea',
  'radio',
  'checkboxes',
  'select',
  'file',
  'consent',
] as const

export type FieldKind = (typeof fieldKinds)[number]

/** Kinds whose primitive does not exist yet; they render a placeholder. */
export const pendingKinds: ReadonlySet<FieldKind> = new Set(['select', 'file'])
/** Kinds typed into a native input, labelled by a native `<label>`. */
export const textKinds: ReadonlySet<FieldKind> = new Set([
  'text',
  'email',
  'tel',
  'textarea',
])
/** Kinds whose value is one or more of `options`. */
export const choiceKinds: ReadonlySet<FieldKind> = new Set([
  'radio',
  'checkboxes',
  'select',
  'consent',
])

export interface SubmissionField {
  key: string
  kind: FieldKind
  label: string
  description?: string
  required: boolean
  /** Published after acceptance; the label gets a 【公開】 mark. */
  public?: boolean
  /** Choice labels. They are also the values written to the sheet. */
  options?: readonly string[]
  /** File input `accept`. */
  accept?: string
  /** Only shown (and validated and sent) when another field has a value. */
  showIf?: { field: string; equals: string }
  /** Google Sheet column header this field is written to. */
  column: string
}

export interface SubmissionSection {
  id: keyof typeof forms.sections
  title: string
  description: readonly string[]
  fields: readonly SubmissionField[]
}

type FieldEntry = string | ({ key: string } & Partial<SubmissionField>)

function resolveField(entry: FieldEntry): SubmissionField {
  const { key, ...overrides } =
    typeof entry === 'string' ? { key: entry } : entry
  const base = (forms.fields as Record<string, Omit<SubmissionField, 'key'>>)[
    key
  ]
  if (!base) throw new Error(`forms.json: unknown field "${key}"`)
  const field = { ...base, ...overrides, key }
  if (!fieldKinds.includes(field.kind)) {
    throw new Error(`forms.json: "${key}" has unknown kind "${field.kind}"`)
  }
  if (choiceKinds.has(field.kind) && !field.options?.length) {
    throw new Error(`forms.json: "${key}" needs options`)
  }
  return field
}

function resolveForm(type: SessionTypeId): SubmissionSection[] {
  return forms.forms[type].sections.map((section) => {
    const id = section.id as SubmissionSection['id']
    const shared = forms.sections[id]
    return {
      id,
      title: shared.title,
      description:
        ('description' in section && section.description) || shared.description,
      fields: (section.fields as FieldEntry[]).map(resolveField),
    }
  })
}

function byType<T>(build: (type: SessionTypeId) => T) {
  return Object.fromEntries(
    sessionTypeIds.map((type) => [type, build(type)]),
  ) as Record<SessionTypeId, T>
}

// Resolved once, so a typo in forms.json fails on load rather than on submit.
const sectionsByType = byType(resolveForm)
const fieldsByType = byType((type) =>
  sectionsByType[type].flatMap((section) => section.fields),
)

export function getSubmissionSections(type: SessionTypeId) {
  return sectionsByType[type]
}

export function isFieldVisible(
  field: SubmissionField,
  values: SubmissionValues,
) {
  return !field.showIf || values[field.showIf.field] === field.showIf.equals
}

function emptyValue(field: SubmissionField): SubmissionValue {
  if (field.kind === 'checkboxes') return []
  if (field.kind === 'file') return null
  return ''
}

function createEmptyValues(type: SessionTypeId): SubmissionValues {
  return Object.fromEntries(
    fieldsByType[type].map((field) => [field.key, emptyValue(field)]),
  )
}

/** Validation driven by the field definitions in forms.json. */
export function validateSubmission(
  type: SessionTypeId,
  values: SubmissionValues,
): SubmissionErrors {
  const errors: SubmissionErrors = {}
  const messages = content.submit_page.validation

  for (const field of fieldsByType[type]) {
    // TODO(#5): validate select and file once their primitives exist.
    if (!isFieldVisible(field, values) || pendingKinds.has(field.kind)) continue
    const value = values[field.key]
    let error: string | undefined

    if (choiceKinds.has(field.kind)) {
      const choices = Array.isArray(value) ? value : value ? [value] : []
      if (!choices.length) {
        if (field.required) {
          error =
            field.kind === 'consent'
              ? messages.consent
              : messages.requiredChoice
        }
      } else if (
        choices.some(
          (choice) =>
            typeof choice !== 'string' || !field.options?.includes(choice),
        )
      ) {
        error = messages.invalidChoice
      }
    } else {
      const input = typeof value === 'string' ? value.trim() : ''
      if (!input) {
        if (field.required) error = messages.requiredText
      } else if (
        field.kind === 'email' &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
      ) {
        error = messages.email
      }
    }

    if (error) errors[field.key] = error.replace('{label}', field.label)
  }
  return errors
}

export interface SheetRow {
  /** Column header → cell text. Hidden fields are written as empty cells. */
  cells: Record<string, string>
  /** Column header → file, for the backend to upload and link in the cell. */
  files: Record<string, File>
}

/** Maps a draft to the Google Sheet columns declared in forms.json. */
export function toSheetRow(
  type: SessionTypeId,
  values: SubmissionValues,
): SheetRow {
  const row: SheetRow = { cells: {}, files: {} }
  for (const field of fieldsByType[type]) {
    const value = isFieldVisible(field, values) ? values[field.key] : null
    if (value instanceof File) {
      row.files[field.column] = value
      row.cells[field.column] = ''
    } else if (Array.isArray(value)) {
      row.cells[field.column] = value.join(', ')
    } else {
      row.cells[field.column] = typeof value === 'string' ? value.trim() : ''
    }
  }
  return row
}

export type SubmissionResult = { message: string } & (
  | { status: 'success' }
  | { status: 'field-error'; errors: SubmissionErrors }
  | { status: 'server-error' }
)

/**
 * Development-only adapter: no network requests, persistence or logging.
 * TODO(#5): send `toSheetRow(type, values)` to the real API when configured.
 */
export async function submit(
  type: SessionTypeId,
  values: SubmissionValues,
): Promise<SubmissionResult> {
  const errors = validateSubmission(type, values)
  const text = content.submit_page.mock

  if (Object.keys(errors).length) {
    return { status: 'field-error', errors, message: text.fieldError }
  }

  await new Promise<void>((resolve) => setTimeout(resolve, 600))
  return { status: 'success', message: text.success }
}

export interface SubmissionState {
  values: SubmissionValues
  errors: SubmissionErrors
  isSubmitting: boolean
  result: SubmissionResult | null
}

/**
 * One store per mounted form, holding a fresh draft of each type; responses
 * always update the sending type.
 */
export function createSubmissionStore() {
  let state = byType((type): SubmissionState => ({
    values: createEmptyValues(type),
    errors: {},
    isSubmitting: false,
    result: null,
  }))
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
      const current = state[type]
      if (current.isSubmitting) return
      // Keep `errors` unchanged unless this field had one, so Base UI's `Form`
      // does not re-render every field on each keystroke.
      let errors = current.errors
      if (key in errors) {
        errors = { ...errors }
        delete errors[key]
      }
      update(type, {
        values: { ...current.values, [key]: value },
        errors,
        result: null,
      })
    },
    async submit(type: SessionTypeId) {
      // Synchronous guard also covers a second send before React rerenders.
      if (state[type].isSubmitting) return
      const values = state[type].values
      update(type, { isSubmitting: true, errors: {}, result: null })

      let result: SubmissionResult
      try {
        result = await submit(type, values)
      } catch {
        result = {
          status: 'server-error',
          message: content.submit_page.mock.serverError,
        }
      }
      update(type, {
        isSubmitting: false,
        errors: result.status === 'field-error' ? result.errors : {},
        result,
      })
    },
  }
}
