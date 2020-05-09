
export const OPTION_REFINERS = {
  googleCalendarApiKey: String
}

// add types
type ExtraOptionRefiners = typeof OPTION_REFINERS
declare module '@fullcalendar/common' {
  interface BaseOptionRefiners extends ExtraOptionRefiners {}
}
