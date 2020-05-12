import { RRULE_EVENT_REFINERS } from './event-refiners'

type ExtraRefiners = typeof RRULE_EVENT_REFINERS
declare module '@fullcalendar/common' {
  interface EventRefiners extends ExtraRefiners {}
}
