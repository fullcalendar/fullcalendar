import { eventSourceDef } from './event-source-def'
import { OPTION_REFINERS, EVENT_SOURCE_REFINERS } from './options'
import './ambient'

export default {
  name: 'google-calendar',
  eventSourceDefs: [eventSourceDef],
  optionRefiners: OPTION_REFINERS,
  eventSourceRefiners: EVENT_SOURCE_REFINERS,
}

export { GoogleCalendarOptions } from './options'
