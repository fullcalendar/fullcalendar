import { OPTION_REFINERS, LISTENER_REFINERS } from './option-refiners.js'

type ExtraOptionRefiners = typeof OPTION_REFINERS
type ExtraListenerRefiners = typeof LISTENER_REFINERS

declare module '@fullcalendar/core/internal' {
  interface BaseOptionRefiners extends ExtraOptionRefiners {}
  interface CalendarListenerRefiners extends ExtraListenerRefiners {}
}
