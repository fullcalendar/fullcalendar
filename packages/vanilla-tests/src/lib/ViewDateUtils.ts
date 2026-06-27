import type { Calendar } from 'fullcalendar'

export function expectRenderRange(calendar: Calendar, start, end) {
  let { dateProfile } = calendar.getCurrentData() // not a great way to get this info

  expect(dateProfile.renderRange.start).toEqualDate(start)
  expect(dateProfile.renderRange.end).toEqualDate(end)
}

export function expectActiveRange(calendar: Calendar, start, end) {
  let currentView = calendar.view

  expect(currentView.activeStart).toEqualDate(start)
  expect(currentView.activeEnd).toEqualDate(end)
}
