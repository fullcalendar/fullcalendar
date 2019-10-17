import * as EventDragUtils from './EventDragUtils'
import { computeSpanRects } from '../view-render/TimeGridRenderUtils'
import { parseMarker, addMs } from '@fullcalendar/core'

export function drag(startDate, endDate, debug) {

  if (typeof startDate === 'string') {
    startDate = parseMarker(startDate).marker
  }

  if (typeof endDate === 'string') {
    endDate = parseMarker(endDate).marker
  }

  var startRect = computeSpanRects(
    startDate,
    addMs(startDate, 1000 * 60 * 30) // hardcoded 30 minute slot :(
  )[0]

  var endRect = computeSpanRects(
    endDate,
    addMs(endDate, 1000 * 60 * 30) // hardcoded 30 minute slot :(
  )[0]

  return EventDragUtils.drag(
    startRect,
    endRect,
    debug
  )
}
