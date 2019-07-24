import * as EventDragUtils from './EventDragUtils'
import * as DayGridRenderUtils from '../view-render/DayGridRenderUtils'


export function drag(startDate, endDate, debug) {
  var el0 = DayGridRenderUtils.getDayEl(startDate)
  var el1 = DayGridRenderUtils.getDayEl(endDate)

  return EventDragUtils.drag(
    el0[0].getBoundingClientRect(),
    el1[0].getBoundingClientRect(),
    debug
  )
}
