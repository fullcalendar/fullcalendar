import * as EventResizeUtils from './EventResizeUtils'
import * as DayGridRenderUtils from '../view-render/DayGridRenderUtils'


export function resize(startDate, endDate, debug) {
  var el0 = DayGridRenderUtils.getSingleDayEl(startDate)
  var el1 = DayGridRenderUtils.getSingleDayEl(endDate)

  return EventResizeUtils.resize(
    el0[0].getBoundingClientRect(),
    el1[0].getBoundingClientRect(),
    debug
  )
}
