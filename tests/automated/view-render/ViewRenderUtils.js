
export function expectDayRange(start, end) {
  start = processWholeDay(start)
  end = processWholeDay(end)

  var dayBefore = start.clone().subtract(1, 'day')
  expectDay(dayBefore, false)

  var date = start.clone()
  while (date < end) { // eslint-disable-line
    expectDay(date, true)
    date.add(1, 'day')
  }

  // `date` is now the first day after the range
  expectDay(date, false)
}


export function expectDay(date, bool) {
  date = processWholeDay(date)
  var els = $('td.fc-day[data-date="' + date.format() + '"]')

  if (bool) {
    expect(els).toBeInDOM()
  } else {
    expect(els).not.toBeInDOM()
  }
}


function processWholeDay(date) {
  date = $.fullCalendar.moment.parseZone(date)
  expect(date.hasTime()).toBe(false)
  expect(date.hasZone()).toBe(false)
  return date
}
