
export function expectRenderRange(start, end) {
  var currentView = currentCalendar.getView()
  var dateProfile = currentView.dateProfile

  var renderRangeStart = currentCalendar.msToUtcMoment(dateProfile.renderUnzonedRange.startMs, dateProfile.isRangeAllDay)
  var renderRangeEnd = currentCalendar.msToUtcMoment(dateProfile.renderUnzonedRange.endMs, dateProfile.isRangeAllDay)

  expect(renderRangeStart).toEqualMoment(start)
  expect(renderRangeEnd).toEqualMoment(end)
}


export function expectActiveRange(start, end) {
  var currentView = currentCalendar.getView()
  var dateProfile = currentView.dateProfile

  var activeRangeStart = currentCalendar.msToUtcMoment(dateProfile.activeUnzonedRange.startMs, dateProfile.isRangeAllDay)
  var activeRangeEnd = currentCalendar.msToUtcMoment(dateProfile.activeUnzonedRange.endMs, dateProfile.isRangeAllDay)

  expect(activeRangeStart).toEqualMoment(start)
  expect(activeRangeEnd).toEqualMoment(end)
}
