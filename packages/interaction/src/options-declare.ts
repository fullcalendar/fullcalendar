import { LISTENER_REFINERS } from './options'

type ExtraListenerRefiners = typeof LISTENER_REFINERS

declare module '@fullcalendar/common' {
  interface CalendarListenerRefiners extends ExtraListenerRefiners {}
}
