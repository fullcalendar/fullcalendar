import { queryParts } from './models/events'

/*
The dates of the rendered day cells and day lanes, sorted and deduped. Disabled days (outside
validRange, or other months' days with showNonCurrentDates:false) have no date, so aren't included.
*/
export function getDatedDays(root: ParentNode): string[] {
  const dates = new Set<string>()

  for (const el of [...queryParts(root, 'dayCell'), ...queryParts(root, 'dayLane')]) {
    const date = el.getAttribute('data-date')

    if (date) {
      dates.add(date)
    }
  }

  return [...dates].sort()
}

/*
`YYYY-MM-DD` strings from `start` up to the exclusive `end`.
*/
export function getDayRange(start: string, end: string): string[] {
  const dates: string[] = []

  for (let d = new Date(start + 'T00:00:00Z'); d < new Date(end + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10))
  }

  return dates
}
