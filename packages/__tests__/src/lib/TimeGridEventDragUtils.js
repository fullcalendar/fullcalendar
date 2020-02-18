import * as EventDragUtils from './EventDragUtils'
import { parseMarker, addMs } from '@fullcalendar/core'
import TimeGridViewWrapper from './wrappers/TimeGridViewWrapper'

export function drag(startDate, endDate, debug) {

  if (typeof startDate === 'string') {
    startDate = parseMarker(startDate).marker
  }

  if (typeof endDate === 'string') {
    endDate = parseMarker(endDate).marker
  }

  var timeGridWrapper = new TimeGridViewWrapper(currentCalendar).timeGrid

  var startRect = timeGridWrapper.computeSpanRects(
    startDate,
    addMs(startDate, 1000 * 60 * 30) // hardcoded 30 minute slot :(
  )[0]

  var endRect = timeGridWrapper.computeSpanRects(
    endDate,
    addMs(endDate, 1000 * 60 * 30) // hardcoded 30 minute slot :(
  )[0]

  return EventDragUtils.drag(
    startRect,
    endRect,
    debug
  )
}
