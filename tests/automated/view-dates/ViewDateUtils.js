
export function expectRenderRange(start, end) {
  var currentView = currentCalendar.view
  var dateProfile = currentView.props.dateProfile

  expect(dateProfile.renderRange.start).toEqualDate(start)
  expect(dateProfile.renderRange.end).toEqualDate(end)
}


export function expectActiveRange(start, end) {
  var currentView = currentCalendar.view
  var dateProfile = currentView.props.dateProfile

  expect(dateProfile.activeRange.start).toEqualDate(start)
  expect(dateProfile.activeRange.end).toEqualDate(end)
}
