export function expectRenderRange(start, end) {
  let { dateProfile } = currentCalendar.getCurrentData() // not a great way to get this info

  expect(dateProfile.renderRange.start).toEqualDate(start)
  expect(dateProfile.renderRange.end).toEqualDate(end)
}

export function expectActiveRange(start, end) {
  let currentView = currentCalendar.view

  expect(currentView.activeStart).toEqualDate(start)
  expect(currentView.activeEnd).toEqualDate(end)
}
