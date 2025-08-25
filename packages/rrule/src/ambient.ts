import { RRULE_EVENT_REFINERS } from './event-refiners.js'

type ExtraRefiners = typeof RRULE_EVENT_REFINERS

declare module '@teamdiverst/fullcalendar-core/internal' {
  interface EventRefiners extends ExtraRefiners {}
}
