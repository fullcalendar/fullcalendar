import * as EventDragUtils from './EventDragUtils'
import { computeSpanRects } from '../view-render/TimeGridRenderUtils'


export function drag(startDate, endDate, debug) {

  if (typeof startDate === 'string') {
    startDate = FullCalendar.parseMarker(startDate).marker
  }

  if (typeof endDate === 'string') {
    endDate = FullCalendar.parseMarker(endDate).marker
  }

  var startRect = computeSpanRects(
    startDate,
    FullCalendar.addMs(startDate, 1000 * 60 * 30) // hardcoded 30 minute slot :(
  )[0]

  var endRect = computeSpanRects(
    endDate,
    FullCalendar.addMs(endDate, 1000 * 60 * 30) // hardcoded 30 minute slot :(
  )[0]

  return EventDragUtils.drag(
    startRect,
    endRect,
    debug
  )
}
