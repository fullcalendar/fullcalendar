
export const OPTION_REFINERS = {
  allDaySlot: Boolean
}

// add types
type ExtraOptionRefiners = typeof OPTION_REFINERS
declare module '@fullcalendar/common' {
  interface BaseOptionRefiners extends ExtraOptionRefiners {}
}
