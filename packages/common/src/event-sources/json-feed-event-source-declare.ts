import { EVENT_SOURCE_REFINERS } from './json-feed-event-source-refiners'

type ExtraRefiners = typeof EVENT_SOURCE_REFINERS
declare module '../structs/event-source-parse' {
  interface EventSourceRefiners extends ExtraRefiners {}
}
