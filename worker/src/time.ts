// Workers run in UTC; the conference, its deadlines and its organizers are
// in Taiwan (UTC+8, no daylight saving time).
const taipeiOffset = 8 * 60 * 60 * 1000

const pad = (n: number) => String(n).padStart(2, '0')

function taipei(date: Date) {
  const shifted = new Date(date.getTime() + taipeiOffset)
  return {
    year: shifted.getUTCFullYear(),
    month: pad(shifted.getUTCMonth() + 1),
    day: pad(shifted.getUTCDate()),
    hours: pad(shifted.getUTCHours()),
    minutes: pad(shifted.getUTCMinutes()),
    seconds: pad(shifted.getUTCSeconds()),
  }
}

/** `2026-10-12 14:03:22`, Taiwan time: sorts as text in the sheet. */
export function sheetTimestamp(date: Date) {
  const t = taipei(date)
  return `${t.year}-${t.month}-${t.day} ${t.hours}:${t.minutes}:${t.seconds}`
}

/** Taiwan time, formatted like `formatDateTime` on the site. */
export function displayDateTime(date: Date) {
  const t = taipei(date)
  const day = `${t.year} / ${t.month} / ${t.day}`
  return t.hours === '00' && t.minutes === '00'
    ? day
    : `${day} ${t.hours}:${t.minutes}`
}
