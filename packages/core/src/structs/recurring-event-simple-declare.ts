import { SIMPLE_RECURRING_REFINERS } from './recurring-event-simple-refiners'

type ExtraRefiners = typeof SIMPLE_RECURRING_REFINERS
declare module './event-parse' {
  interface EventRefiners extends ExtraRefiners {}
}
