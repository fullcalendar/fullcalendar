import { OPTION_REFINERS } from './options-refiners'

type ExtraOptionRefiners = typeof OPTION_REFINERS
declare module '@fullcalendar/core' {
  interface BaseOptionRefiners extends ExtraOptionRefiners {}
}
