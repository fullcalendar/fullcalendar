import { Calendar } from 'fullcalendar'
import { queryParts } from './models/events'
import { partSelector } from './parts'

/*
The view's active range (the dates that can hold events and be interacted with), as
`[start, end]` strings in the calendar's time zone. Midnights are `YYYY-MM-DD`; anything else keeps
its full ISO form, so an unexpected time fails the comparison.
*/
export function getActiveRange(calendar: Calendar): [string, string] {
  const { view } = calendar
  return [formatDate(calendar, view.activeStart), formatDate(calendar, view.activeEnd)]
}

/*
The view's current range: the interval the view is "about", ex: the month of a month view.
*/
export function getCurrentRange(calendar: Calendar): [string, string] {
  const { view } = calendar
  return [formatDate(calendar, view.currentStart), formatDate(calendar, view.currentEnd)]
}

export function formatDate(calendar: Calendar, date: Date): string {
  const iso = calendar.formatIso(date)
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})T00:00:00(Z|[+-]\d{2}:\d{2})?$/)
  return match ? match[1] : iso
}

/*
The dates of the rendered day-header columns, in DOM order. Includes disabled days (ex: outside
validRange), which still get a column. Not for month views, whose headers are days-of-week.
*/
export function getDayHeaderDates(root: ParentNode): string[] {
  // a disabled day's header gets no dayHeaderClass, so no part. it's still a dated cell of the header row
  const selector = `${partSelector('dayHeader')}, ${partSelector('dayHeaderRow')} > [data-date]`
  return Array.from(root.querySelectorAll(selector)).map((el) => el.getAttribute('data-date')!)
}

/*
The dates of the day cells that have dates, in DOM order. Disabled cells have no date.
*/
export function getDayCellDates(root: ParentNode): string[] {
  return queryParts(root, 'dayCell')
    .map((el) => el.getAttribute('data-date'))
    .filter((date): date is string => Boolean(date))
}

/*
The date of each rendered cell marked as today (aria-current="date").
*/
export function getTodayDates(root: ParentNode): string[] {
  return Array.from(root.querySelectorAll('[aria-current="date"]'))
    .map((el) => el.getAttribute('data-date')!)
}
