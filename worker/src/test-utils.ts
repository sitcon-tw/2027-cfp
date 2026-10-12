import type { SessionTypeId } from '@/lib/session-type-ids'
import {
  getSheetMetaColumn,
  getSheetStatusLabel,
  getSubmissionFields,
  parseSheetStatus,
  type FieldKind,
  type SubmissionValues,
} from '@/lib/submission'

import type { Cell } from './sheets'
import type { RowRef, StatusChange, SubmissionStore } from './store'

const validText: Partial<Record<FieldKind, string>> = {
  email: 'speaker@example.com',
  tel: '0912-345-678',
  url: 'https://example.com/answer',
}

/** A draft answering every question of `type` with something valid. */
export function validValues(
  type: SessionTypeId,
  overrides: SubmissionValues = {},
): SubmissionValues {
  const values: SubmissionValues = {}
  for (const field of getSubmissionFields(type)) {
    values[field.key] =
      field.kind === 'checkboxes'
        ? [field.options![0]]
        : field.options
          ? field.options[0]
          : (validText[field.kind] ?? `${field.key} answer`)
  }
  return { ...values, ...overrides }
}

/** A sheet tab in memory, cells by column header. */
export class MemoryStore implements SubmissionStore {
  rows: Record<string, Cell>[] = []

  async index(): Promise<RowRef[]> {
    return this.rows.map((cells, index) => ({
      row: index + 2,
      id: String(cells[getSheetMetaColumn('id')]),
      version: Number(cells[getSheetMetaColumn('version')]),
      status: parseSheetStatus(String(cells[getSheetMetaColumn('status')])),
    }))
  }

  async read(row: number) {
    return Object.fromEntries(
      Object.entries(this.rows[row - 2]).map(([key, value]) => [
        key,
        String(value),
      ]),
    )
  }

  async append(cells: Record<string, Cell>) {
    this.rows.push({ ...cells })
  }

  async setStatus(changes: StatusChange[]) {
    for (const { row, status, verifiedAt } of changes) {
      const cells = this.rows[row - 2]
      cells[getSheetMetaColumn('status')] = getSheetStatusLabel(status)
      if (verifiedAt) cells[getSheetMetaColumn('verifiedAt')] = verifiedAt
    }
  }

  /** `[version, status]` of every row, for assertions. */
  summary() {
    return this.rows.map((cells) => [
      cells[getSheetMetaColumn('version')],
      cells[getSheetMetaColumn('status')],
    ])
  }
}
