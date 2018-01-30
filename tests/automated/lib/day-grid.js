
export function getDayGridDayEls(date) {
  date = $.fullCalendar.moment.parseZone(date)
  return $(`.fc-day-grid .fc-day[data-date="${date.format('YYYY-MM-DD')}"]`)
}


// TODO: discourage use
export function getDayGridDowEls(dayAbbrev) {
  return $(`.fc-day-grid .fc-row:first-child td.fc-day.fc-${dayAbbrev}`)
}
