import * as EventDragUtils from './EventDragUtils'
import { computeSpanRects } from '../event-render/TimeGridEventRenderUtils'


export function drag(startDate, endDate, debug) {

  startDate = $.fullCalendar.moment.parseZone(startDate)
  endDate = $.fullCalendar.moment.parseZone(endDate)

  var startRect = computeSpanRects(
    startDate,
    startDate.clone().add({ minutes: 30 }) // hardcoded 30 minute slot :(
  )[0]
  var endRect = computeSpanRects(
    endDate,
    endDate.clone().add({ minutes: 30 }) // hardcoded 30 minute slot :(
  )[0]

  return EventDragUtils.drag(
    startRect,
    endRect,
    debug
  )
}
