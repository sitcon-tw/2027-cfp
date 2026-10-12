import type { SessionTypeId } from '@/lib/session-type-ids'
import {
  getSheetColumns,
  getSheetMetaColumn,
  getSheetStatusLabel,
  getSheetTitle,
  parseSheetStatus,
  sheetMetaKeys,
  type SheetStatus,
} from '@/lib/submission'

import { a1, columnLetter, Sheets, type Cell } from './sheets'

/** Where a version of a submission sits in its tab. */
export interface RowRef {
  /** 1-based sheet row. */
  row: number
  id: string
  version: number
  status: SheetStatus | null
}

export interface StatusChange {
  row: number
  status: SheetStatus
  /** Also fills 驗證時間. */
  verifiedAt?: string
}

/** One session type's rows. The handlers only see this interface. */
export interface SubmissionStore {
  /** Every row's ID, version and status. */
  index(): Promise<RowRef[]>
  /** A row's cells by column header. */
  read(row: number): Promise<Record<string, string>>
  /** Appends a row; cells by column header, missing ones left empty. */
  append(cells: Record<string, Cell>): Promise<void>
  setStatus(changes: StatusChange[]): Promise<void>
}

// Tabs whose header row has been checked by this isolate.
const readyTabs = new Set<string>()

/**
 * A session type's tab in the Google Sheet. Its header row is metadata, then
 * every field's `column`, from forms.json. A missing tab is created and an
 * empty header row is written; a different header stops every write, so a
 * forms.json change can't shift answers into the wrong columns.
 */
export class SheetSubmissionStore implements SubmissionStore {
  private readonly sheets: Sheets
  private readonly title: string
  private readonly columns: string[]

  constructor(sheets: Sheets, type: SessionTypeId) {
    this.sheets = sheets
    this.title = getSheetTitle(type)
    this.columns = getSheetColumns(type)
  }

  async prepare() {
    const key = `${this.sheets.spreadsheetId} ${this.title}`
    if (readyTabs.has(key)) return
    if (!(await this.sheets.tabTitles()).includes(this.title)) {
      await this.sheets.addTab(this.title)
    }
    const [header = []] = await this.sheets.get(a1(this.title, '1:1'))
    if (!header.length) {
      await this.sheets.update(a1(this.title, 'A1'), [this.columns])
    } else if (!sameHeader(header, this.columns)) {
      throw new Error(
        `The header row of sheet tab "${this.title}" does not match forms.json`,
      )
    }
    readyTabs.add(key)
  }

  private column(key: (typeof sheetMetaKeys)[number]) {
    return this.columns.indexOf(getSheetMetaColumn(key))
  }

  async index(): Promise<RowRef[]> {
    const id = this.column('id')
    const version = this.column('version')
    const status = this.column('status')
    const last = columnLetter(Math.max(id, version, status))
    const rows = await this.sheets.get(a1(this.title, `A2:${last}`))
    return rows.flatMap((cells, index) =>
      cells[id]
        ? [
            {
              row: index + 2,
              id: cells[id],
              version: Number(cells[version]) || 0,
              status: parseSheetStatus(cells[status] ?? ''),
            },
          ]
        : [],
    )
  }

  async read(row: number) {
    const last = columnLetter(this.columns.length - 1)
    const [cells = []] = await this.sheets.get(
      a1(this.title, `A${row}:${last}${row}`),
    )
    return Object.fromEntries(
      this.columns.map((column, index) => [column, cells[index] ?? '']),
    )
  }

  async append(cells: Record<string, Cell>) {
    await this.sheets.append(a1(this.title, 'A1'), [
      this.columns.map((column) => cells[column] ?? ''),
    ])
  }

  async setStatus(changes: StatusChange[]) {
    const status = columnLetter(this.column('status'))
    const verifiedAt = columnLetter(this.column('verifiedAt'))
    await this.sheets.batchUpdate(
      changes.flatMap((change) => [
        {
          range: a1(this.title, `${status}${change.row}`),
          values: [[getSheetStatusLabel(change.status)]],
        },
        ...(change.verifiedAt
          ? [
              {
                range: a1(this.title, `${verifiedAt}${change.row}`),
                values: [[change.verifiedAt]],
              },
            ]
          : []),
      ]),
    )
  }
}

export function sameHeader(actual: readonly string[], expected: string[]) {
  return (
    actual.length === expected.length &&
    expected.every((column, index) => actual[index]?.trim() === column)
  )
}
