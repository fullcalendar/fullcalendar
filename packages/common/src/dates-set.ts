import { DateProfile } from './DateProfileGenerator'
import { CalendarData } from './reducers/data-types'
import { RangeApiWithTimeZone, buildRangeApiWithTimeZone } from './structs/date-span'
import { ViewApi } from './ViewApi'

export type DatesSetArg = RangeApiWithTimeZone & { view: ViewApi }

export function handleDateProfile(dateProfile: DateProfile, context: CalendarData) {
  context.emitter.trigger('datesSet', {
    ...buildRangeApiWithTimeZone(dateProfile.activeRange, context.dateEnv),
    view: context.viewApi,
  })
}
