import { identity, Identity, RawOptionsFromRefiners, RefinedOptionsFromRefiners } from "@fullcalendar/core/protected-api"

export const OPTION_REFINERS = {
  googleCalendarApiKey: String,
}

type GoogleCalendarOptionRefiners = typeof OPTION_REFINERS
export type GoogleCalendarOptions = RawOptionsFromRefiners<GoogleCalendarOptionRefiners>
export type GoogleCalendarOptionsRefined = RefinedOptionsFromRefiners<GoogleCalendarOptionRefiners>

export const EVENT_SOURCE_REFINERS = {
  googleCalendarApiKey: String, // TODO: rename with no prefix?
  googleCalendarId: String,
  googleCalendarApiBase: String,
  extraParams: identity as Identity<Record<string, any> | (() => Record<string, any>)>,
}

type GoogleCalendarEventSourceRefiners = typeof EVENT_SOURCE_REFINERS
export type GoogleCalendarEventSourceOptions = RawOptionsFromRefiners<GoogleCalendarEventSourceRefiners>
export type GoogleCalendarEventSourceOptionsRefined = RefinedOptionsFromRefiners<GoogleCalendarEventSourceRefiners>
