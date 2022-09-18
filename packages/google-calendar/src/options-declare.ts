import { OPTION_REFINERS } from './options-refiners.js'

type ExtraOptionRefiners = typeof OPTION_REFINERS
declare module '@fullcalendar/core' {
  interface BaseOptionRefiners extends ExtraOptionRefiners {}
}
