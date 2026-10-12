import content from '@/content.json'
import forms from '@/forms.json'
import { sessionTypeIds, type SessionTypeId } from '@/lib/session-type-ids'

// Shared by the form and the submission API (`worker/`), so it stays free of
// React, the DOM and Vite-only APIs. The browser side is in
// `submission-client.ts`.

export type SubmissionValue = string | string[]
export type SubmissionValues = Record<string, SubmissionValue>
export type SubmissionErrors = Record<string, string>

const fieldKinds = [
  'text',
  'email',
  'tel',
  'url',
  'textarea',
  'radio',
  'checkboxes',
  'select',
  'consent',
] as const

export type FieldKind = (typeof fieldKinds)[number]

/** Kinds typed into a native input, labelled by a native `<label>`. */
export const textKinds: ReadonlySet<FieldKind> = new Set([
  'text',
  'email',
  'tel',
  'url',
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

export function getSubmissionFields(type: SessionTypeId) {
  return fieldsByType[type]
}

export function isFieldVisible(
  field: SubmissionField,
  values: SubmissionValues,
) {
  return !field.showIf || values[field.showIf.field] === field.showIf.equals
}

function emptyValue(field: SubmissionField): SubmissionValue {
  if (field.kind === 'checkboxes') return []
  return ''
}

export function createEmptyValues(type: SessionTypeId): SubmissionValues {
  return Object.fromEntries(
    fieldsByType[type].map((field) => [field.key, emptyValue(field)]),
  )
}

// The address pattern browsers use for `type="email"`, requiring a dot in the
// domain. Stricter than "anything with an @": the address goes into an email
// header, where commas or angle brackets would add recipients.
const emailPattern =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export function isEmailAddress(value: string) {
  return emailPattern.test(value)
}

// Digits with the usual separators, an optional leading `+` and an optional
// extension (`#123`), e.g. `0912-345-678`, `+886 2 1234 5678 #9`.
const phonePattern = /^\+?[\d\s().-]+(?:#\d+)?$/

export function isPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '').length
  return phonePattern.test(value) && digits >= 7 && digits <= 20
}

/** An absolute `http(s)` link, as the `url` fields ask for. */
export function isLink(value: string) {
  if (/\s/.test(value)) return false
  try {
    const url = new URL(value)
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      url.hostname.includes('.')
    )
  } catch {
    return false
  }
}

/** Google Sheets holds at most 50,000 characters in a cell. */
const maxTextLength = 50_000

/**
 * The error of one answer, or `undefined` when it is valid. Shared by the
 * form (on blur and submit) and the API, so both reject the same answers.
 */
export function validateField(
  field: SubmissionField,
  value: SubmissionValue | undefined,
): string | undefined {
  const messages = content.submit_page.validation
  let error: string | undefined

  if (choiceKinds.has(field.kind)) {
    const choices = Array.isArray(value) ? value : value ? [value] : []
    if (!choices.length) {
      if (field.required) {
        error =
          field.kind === 'consent' ? messages.consent : messages.requiredChoice
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
    } else if (field.kind === 'email' && !isEmailAddress(input)) {
      error = messages.email
    } else if (field.kind === 'tel' && !isPhoneNumber(input)) {
      error = messages.tel
    } else if (field.kind === 'url' && !isLink(input)) {
      error = messages.url
    } else if (input.length > maxTextLength) {
      error = messages.tooLong.replace('{max}', String(maxTextLength))
    }
  }

  return error?.replace('{label}', field.label)
}

/** Validation driven by the field definitions in forms.json. */
export function validateSubmission(
  type: SessionTypeId,
  values: SubmissionValues,
): SubmissionErrors {
  const errors: SubmissionErrors = {}
  for (const field of fieldsByType[type]) {
    if (!isFieldVisible(field, values)) continue
    const error = validateField(field, values[field.key])
    if (error) errors[field.key] = error
  }
  return errors
}

export interface SheetRow {
  /** Column header → cell text. Hidden fields are written as empty cells. */
  cells: Record<string, string>
}

/** Maps a draft to the Google Sheet columns declared in forms.json. */
export function toSheetRow(
  type: SessionTypeId,
  values: SubmissionValues,
): SheetRow {
  const row: SheetRow = { cells: {} }
  for (const field of fieldsByType[type]) {
    const value = isFieldVisible(field, values) ? values[field.key] : null
    if (Array.isArray(value)) {
      row.cells[field.column] = value.join(', ')
    } else {
      row.cells[field.column] = typeof value === 'string' ? value.trim() : ''
    }
  }
  return row
}

/**
 * The submission's contact address: its first `email` field, which receives
 * the verification link, the copy and the edit link.
 */
export function getContactEmail(
  type: SessionTypeId,
  values: SubmissionValues,
): string {
  const field = fieldsByType[type].find((field) => field.kind === 'email')
  const value = field && values[field.key]
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Keeps only this type's fields, each as a string or (for checkboxes) a
 * string list; anything else becomes the field's empty value. Used on input
 * that was not built by the form, such as an API request body.
 */
export function normalizeValues(
  type: SessionTypeId,
  input: unknown,
): SubmissionValues {
  const source = (
    typeof input === 'object' && input !== null ? input : {}
  ) as Record<string, unknown>
  const values = createEmptyValues(type)
  for (const field of fieldsByType[type]) {
    const value = source[field.key]
    if (field.kind === 'checkboxes') {
      if (Array.isArray(value)) {
        values[field.key] = value.filter(
          (item): item is string => typeof item === 'string',
        )
      }
    } else if (typeof value === 'string') {
      values[field.key] = value
    }
  }
  return values
}

/** Metadata the API writes before the answers on every sheet row. */
export type SheetMetaKey = keyof typeof forms.sheet.columns
export type SheetStatus = keyof typeof forms.sheet.status

export const sheetMetaKeys = Object.keys(
  forms.sheet.columns,
) as readonly SheetMetaKey[]

/** The sheet tab a session type is written to. */
export function getSheetTitle(type: SessionTypeId) {
  return forms.forms[type].sheet
}

/** The header row of a session type's tab: metadata, then every field. */
export function getSheetColumns(type: SessionTypeId): string[] {
  const columns = [
    ...sheetMetaKeys.map((key) => forms.sheet.columns[key]),
    ...fieldsByType[type].map((field) => field.column),
  ]
  const duplicate = columns.find(
    (column, index) => columns.indexOf(column) !== index,
  )
  if (duplicate) {
    throw new Error(`forms.json: column "${duplicate}" is used twice`)
  }
  return columns
}

export function getSheetMetaColumn(key: SheetMetaKey) {
  return forms.sheet.columns[key]
}

export function getSheetStatusLabel(status: SheetStatus) {
  return forms.sheet.status[status]
}

/** The status a sheet cell names, or `null` for an unknown label. */
export function parseSheetStatus(label: string): SheetStatus | null {
  const entry = Object.entries(forms.sheet.status).find(
    ([, text]) => text === label,
  )
  return entry ? (entry[0] as SheetStatus) : null
}

/** The reverse of `toSheetRow`: cells by column header back to a draft. */
export function fromSheetRow(
  type: SessionTypeId,
  cells: Record<string, string>,
): SubmissionValues {
  const values = createEmptyValues(type)
  for (const field of fieldsByType[type]) {
    const cell = cells[field.column] ?? ''
    // Matched whole, so an option that itself contains ", " survives.
    values[field.key] =
      field.kind === 'checkboxes'
        ? (field.options ?? []).filter((option) =>
            `, ${cell}, `.includes(`, ${option}, `),
          )
        : cell
  }
  return values
}
