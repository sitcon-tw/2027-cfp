import content from '@/content.json'
import forms from '@/forms.json'
import type { SessionTypeId } from '@/lib/session-types'

export type SubmissionValue = string | string[] | boolean | File | null
export type SubmissionValues = Record<string, SubmissionValue>
export type SubmissionErrors = Record<string, string>
export type SubmissionDrafts = Record<SessionTypeId, SubmissionValues>

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
  if (
    (field.kind === 'radio' ||
      field.kind === 'checkboxes' ||
      field.kind === 'select' ||
      field.kind === 'consent') &&
    !field.options?.length
  ) {
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

// Resolved once, so a typo in forms.json fails on load rather than on submit.
const sectionsByType: Record<SessionTypeId, readonly SubmissionSection[]> = {
  general: resolveForm('general'),
  open: resolveForm('open'),
  demo: resolveForm('demo'),
}

export function getSubmissionSections(type: SessionTypeId) {
  return sectionsByType[type]
}

export function getSubmissionFields(type: SessionTypeId) {
  return sectionsByType[type].flatMap((section) => section.fields)
}

export function isFieldVisible(
  field: SubmissionField,
  values: SubmissionValues,
) {
  return !field.showIf || values[field.showIf.field] === field.showIf.equals
}

function emptyValue(field: SubmissionField): SubmissionValue {
  if (field.kind === 'consent') return false
  if (field.kind === 'checkboxes') return []
  if (field.kind === 'file') return null
  return ''
}

function createEmptyValues(type: SessionTypeId): SubmissionValues {
  return Object.fromEntries(
    getSubmissionFields(type).map((field) => [field.key, emptyValue(field)]),
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

/** Validation driven by the field definitions in forms.json. */
export function validateSubmission(
  type: SessionTypeId,
  values: SubmissionValues,
): SubmissionErrors {
  const errors: SubmissionErrors = {}
  const messages = content.submit_page.validation

  for (const field of getSubmissionFields(type)) {
    // TODO(#5): validate select and file once their primitives exist.
    if (!isFieldVisible(field, values) || pendingKinds.has(field.kind)) continue
    const value = values[field.key]
    let error: string | undefined

    if (field.kind === 'consent') {
      if (field.required && value !== true) error = messages.consent
    } else if (field.kind === 'radio' || field.kind === 'checkboxes') {
      const choices = Array.isArray(value) ? value : value ? [value] : []
      if (!choices.length) {
        if (field.required) error = messages.requiredChoice
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
  for (const field of getSubmissionFields(type)) {
    const value = isFieldVisible(field, values) ? values[field.key] : null
    if (value instanceof File) {
      row.files[field.column] = value
      row.cells[field.column] = ''
    } else if (field.kind === 'consent') {
      // Like Google Forms, a confirmation stores its single option's text.
      row.cells[field.column] = value === true ? field.options![0] : ''
    } else if (Array.isArray(value)) {
      row.cells[field.column] = value.join(', ')
    } else {
      row.cells[field.column] = typeof value === 'string' ? value.trim() : ''
    }
  }
  return row
}

export type SubmissionResult = {
  mock: true
  type: SessionTypeId
  message: string
} & (
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
  const base = { mock: true as const, type }

  if (Object.keys(errors).length) {
    return { ...base, status: 'field-error', errors, message: text.fieldError }
  }

  await new Promise<void>((resolve) => setTimeout(resolve, 600))
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
    async submit(type: SessionTypeId): Promise<SubmissionResult | null> {
      // Synchronous guard also covers a second send before React rerenders.
      if (state[type].isSubmitting) return null
      const values = state[type].values
      update(type, { isSubmitting: true, errors: {}, result: null })

      let result: SubmissionResult
      try {
        result = await adapter(type, values)
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
