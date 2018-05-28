import { formatIsoDay } from '../datelib/utils'


export function getSingleDayEl(date) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  var els = $('.fc-day-grid .fc-bg .fc-day[data-date="' + formatIsoDay(date) + '"]')
  expect(els).toHaveLength(1)
  return els
}


export function getDisabledEl(i) {
  var el = $('.fc-day-grid .fc-bg .fc-disabled-day:eq(' + i + ')')
  expect(el).toHaveLength(1)
  return el
}
