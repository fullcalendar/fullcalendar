import * as EventDragUtils from './EventDragUtils'
import { computeSpanRects } from '../event-render/TimeGridEventRenderUtils'


export function drag(startDate, endDate, debug) {

  startDate = FullCalendar.moment.parseZone(startDate)
  endDate = FullCalendar.moment.parseZone(endDate)

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

export function filterEl(selector, cb){
  return $(selector).filter(cb);
}

export function simulateEvent(selector, event, cfg){
  return $(selector).simulate(event, cfg);
}

export function simulateDrag(selector, cfg){
  return simulateEvent(selector, 'drag', cfg);
}