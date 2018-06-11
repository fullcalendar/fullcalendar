import { formatIsoDay } from '../datelib/utils'

export function getDayEl(date) {
  if (typeof date === 'string') {
    date = new Date(date)
  }
  return $('.fc-day-grid .fc-bg .fc-day[data-date="' + formatIsoDay(date) + '"]')
}

export function getDisabledEl(i) {
  var el = $('.fc-day-grid .fc-bg .fc-disabled-day:eq(' + i + ')')
  expect(el).toHaveLength(1)
  return el
}

export function getDayEls() {
  return $('.fc-day-header')
}

export function getDayElTopElText(date) {
  return $(`td.fc-day-top[data-date="${date}"]`).text()
}

export function getHeaderEl() {
  return $('.fc-view > table > .fc-head')
}

export function hasHeaderEl() {
  return getHeaderEl().length === 1
}

export function getFirstDayEl() {
  return getDayEls().first()
}

export function getLastDayEl() {
  return getDayEls().last()
}
