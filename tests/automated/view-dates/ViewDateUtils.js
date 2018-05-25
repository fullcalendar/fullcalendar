
export function expectRenderRange(start, end) {
  var currentView = currentCalendar.getView()
  var dateProfile = currentView.dateProfile

  expect(dateProfile.renderUnzonedRange.start).toEqualDate(start)
  expect(dateProfile.renderUnzonedRange.end).toEqualDate(end)
}


export function expectActiveRange(start, end) {
  var currentView = currentCalendar.getView()
  var dateProfile = currentView.dateProfile

  expect(dateProfile.activeUnzonedRange.start).toEqualDate(start)
  expect(dateProfile.activeUnzonedRange.end).toEqualDate(end)
}
