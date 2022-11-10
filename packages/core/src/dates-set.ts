import { DateProfile } from './DateProfileGenerator.js'
import { CalendarData } from './reducers/data-types.js'
import { RangeApiWithTimeZone, buildRangeApiWithTimeZone } from './structs/date-span.js'
import { ViewImpl } from './api/ViewImpl.js'

export type DatesSetArg = RangeApiWithTimeZone & { view: ViewImpl }

export function handleDateProfile(dateProfile: DateProfile, context: CalendarData) {
  context.emitter.trigger('datesSet', {
    ...buildRangeApiWithTimeZone(dateProfile.activeRange, context.dateEnv),
    view: context.viewApi,
  })
}
