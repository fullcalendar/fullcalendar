import { formatIsoDay } from '../datelib/utils'


export function getDayGridDayEls(date) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return $('.fc-day-grid .fc-day[data-date="' + formatIsoDay(date) + '"]')
}

export function getDayGridAxis() {
  return $('.fc-day-grid .fc-axis')
}

// TODO: discourage use
export function getDayGridDowEls(dayAbbrev) {
  return $(`.fc-day-grid .fc-row:first-child td.fc-day.fc-${dayAbbrev}`)
}
