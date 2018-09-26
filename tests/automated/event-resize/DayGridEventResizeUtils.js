import * as EventResizeUtils from './EventResizeUtils'
import * as DayGridRenderUtils from '../view-render/DayGridRenderUtils'


export function resize(startDate, endDate, fromStart, debug) {
  var el0 = DayGridRenderUtils.getDayEl(startDate)
  var el1 = DayGridRenderUtils.getDayEl(endDate)

  return EventResizeUtils.resize(
    el0[0].getBoundingClientRect(),
    el1[0].getBoundingClientRect(),
    fromStart,
    debug
  )
}
