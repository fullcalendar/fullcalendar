import { SIMPLE_RECURRING_REFINERS } from './recurring-event-simple-refiners.js'

type ExtraRefiners = typeof SIMPLE_RECURRING_REFINERS
declare module './event-parse.js' {
  interface EventRefiners extends ExtraRefiners {}
}
