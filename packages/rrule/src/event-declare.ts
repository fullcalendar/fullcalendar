import { RRULE_EVENT_REFINERS } from './event-refiners.js'

type ExtraRefiners = typeof RRULE_EVENT_REFINERS
declare module '@fullcalendar/core' {
  interface EventRefiners extends ExtraRefiners {}
}
