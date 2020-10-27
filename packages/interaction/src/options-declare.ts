import { OPTION_REFINERS, LISTENER_REFINERS } from './options'

type ExtraOptionRefiners = typeof OPTION_REFINERS
type ExtraListenerRefiners = typeof LISTENER_REFINERS

declare module '@fullcalendar/common' {
  interface BaseOptionRefiners extends ExtraOptionRefiners {}
  interface CalendarListenerRefiners extends ExtraListenerRefiners {}
}
