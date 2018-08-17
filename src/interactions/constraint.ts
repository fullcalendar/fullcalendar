import { DateRangeInput, rangeContainsRange } from '../datelib/date-range'
import { BusinessHoursInput } from '../structs/business-hours'
import { EventStore } from '../structs/event-store'
import { DateProfile } from '../DateProfileGenerator'

export type ConstraintInput = DateRangeInput | BusinessHoursInput | 'businessHours'

export function isEventStoreValid(eventStore: EventStore, dateProfile: DateProfile) {
  let instanceHash = eventStore.instances

  if (dateProfile) { // for Popover
    for (let instanceId in instanceHash) {
      if (
        !rangeContainsRange(
          dateProfile.validRange,
          instanceHash[instanceId].range
        )
      ) {
        return false
      }
    }
  }

  return true
}
