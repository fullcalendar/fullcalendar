import { recurringType } from './recurring-type'
import { RRULE_EVENT_REFINERS } from './event-refiners'
import './ambient'

export default {
  name: 'rrule',
  recurringTypes: [recurringType],
  eventRefiners: RRULE_EVENT_REFINERS,
}
