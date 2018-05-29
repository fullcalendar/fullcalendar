
export function getSingleDayEl(date) {
  date = date.isMoment ? date : FullCalendar.moment.parseZone(date)
  var els = $(`.fc-day-grid .fc-bg .fc-day[data-date="${date.format('YYYY-MM-DD')}"]`)
  expect(els).toHaveLength(1)
  return els
}


export function getDisabledEl(i) {
  var el = $('.fc-day-grid .fc-bg .fc-disabled-day:eq(' + i + ')')
  expect(el).toHaveLength(1)
  return el
}

export function getDayEls() {
  return $('.fc-day-header[data-date]')
}

export function getDayTdEls(date) {
  return $(`td[data-date="${date}"]`)
}
