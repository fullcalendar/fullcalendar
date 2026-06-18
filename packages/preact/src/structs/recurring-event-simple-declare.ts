import {} from '@fullcalendar/core/protected-api'
import { SIMPLE_RECURRING_REFINERS } from './recurring-event-simple-refiners'

type ExtraRefiners = typeof SIMPLE_RECURRING_REFINERS

declare module '@fullcalendar/core/protected-api' {
  interface EventRefiners extends ExtraRefiners {}
}
