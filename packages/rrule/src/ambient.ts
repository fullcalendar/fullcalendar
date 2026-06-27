import {} from '@fullcalendar/core/protected-api'
import { RRULE_EVENT_REFINERS } from './event-refiners'

type ExtraRefiners = typeof RRULE_EVENT_REFINERS

declare module '@fullcalendar/core/protected-api' {
  interface EventRefiners extends ExtraRefiners {}
}
