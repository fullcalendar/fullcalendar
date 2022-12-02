import { OPTION_REFINERS } from './options-refiners.js'
import { EVENT_SOURCE_REFINERS } from './event-source-refiners.js'

type ExtraOptionRefiners = typeof OPTION_REFINERS
type ExtraEventSourceRefiners = typeof EVENT_SOURCE_REFINERS

declare module '@fullcalendar/core/internal' {
  interface BaseOptionRefiners extends ExtraOptionRefiners {}
}

declare module '@fullcalendar/core/internal' {
  interface EventSourceRefiners extends ExtraEventSourceRefiners {}
}
