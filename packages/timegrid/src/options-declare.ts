import { OPTION_REFINERS } from './options'

type ExtraOptionRefiners = typeof OPTION_REFINERS
declare module '@fullcalendar/common' {
  interface BaseOptionRefiners extends ExtraOptionRefiners {}
}
