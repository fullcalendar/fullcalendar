import * as EventResizeUtils from './EventResizeUtils'
import TimeGridViewWrapper from './wrappers/TimeGridViewWrapper'


export function resize(startDate, endDate, fromStart, debug) {
  let timeGridWrapper = new TimeGridViewWrapper(currentCalendar).timeGrid
  let rects = timeGridWrapper.computeSpanRects(startDate, endDate)
  let firstRect = rects[0]
  let lastRect = rects[rects.length - 1]

  return EventResizeUtils.resize(
    { top: firstRect.top, left: firstRect.left },
    { top: lastRect.bottom, left: lastRect.left },
    fromStart,
    debug
  )
}
