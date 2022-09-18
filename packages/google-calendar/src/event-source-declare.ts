import { EVENT_SOURCE_REFINERS } from './event-source-refiners.js'

type ExtraEventSourceRefiners = typeof EVENT_SOURCE_REFINERS
declare module '@fullcalendar/core' {
  interface EventSourceRefiners extends ExtraEventSourceRefiners {}
}
