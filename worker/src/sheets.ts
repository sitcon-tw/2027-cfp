import { GoogleApiError } from './google-auth'

const api = 'https://sheets.googleapis.com/v4/spreadsheets'

export type Cell = string | number

/** `'Tab'!A1:C2`, quoting the tab title. */
export function a1(tab: string, range: string) {
  return `'${tab.replace(/'/g, "''")}'!${range}`
}

/** 0 → A, 25 → Z, 26 → AA. */
export function columnLetter(index: number): string {
  let letters = ''
  for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
    letters = String.fromCharCode(65 + ((n - 1) % 26)) + letters
  }
  return letters
}

/**
 * The Sheets REST API, as the service account itself (the sheet is shared
 * with its address). Writes use `RAW`, so text such as `=IMPORTXML(…)` stays
 * text instead of becoming a formula.
 */
export class Sheets {
  private readonly token: string
  readonly spreadsheetId: string

  constructor(token: string, spreadsheetId: string) {
    this.token = token
    this.spreadsheetId = spreadsheetId
  }

  private async call<T>(action: string, path: string, init?: RequestInit) {
    const response = await fetch(
      `${api}/${encodeURIComponent(this.spreadsheetId)}${path}`,
      {
        ...init,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      },
    )
    if (!response.ok) {
      throw new GoogleApiError(
        `Sheets ${action}`,
        response.status,
        await response.text(),
      )
    }
    return response.json<T>()
  }

  async tabTitles(): Promise<string[]> {
    const body = await this.call<{
      sheets?: { properties: { title: string } }[]
    }>('metadata', '?fields=sheets.properties.title')
    return (body.sheets ?? []).map((sheet) => sheet.properties.title)
  }

  async addTab(title: string) {
    await this.call('addSheet', ':batchUpdate', {
      method: 'POST',
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title } } }],
      }),
    })
  }

  /** Rows of formatted cell text; trailing empty cells and rows are left out. */
  async get(range: string): Promise<string[][]> {
    const body = await this.call<{ values?: string[][] }>(
      'get',
      `/values/${encodeURIComponent(range)}`,
    )
    return body.values ?? []
  }

  async update(range: string, values: Cell[][]) {
    await this.call(
      'update',
      `/values/${encodeURIComponent(range)}?valueInputOption=RAW`,
      { method: 'PUT', body: JSON.stringify({ values }) },
    )
  }

  async append(range: string, values: Cell[][]) {
    await this.call(
      'append',
      `/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      { method: 'POST', body: JSON.stringify({ values }) },
    )
  }

  async batchUpdate(data: { range: string; values: Cell[][] }[]) {
    if (!data.length) return
    await this.call('batchUpdate', '/values:batchUpdate', {
      method: 'POST',
      body: JSON.stringify({ valueInputOption: 'RAW', data }),
    })
  }
}
