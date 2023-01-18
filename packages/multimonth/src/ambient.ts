import { OPTION_REFINERS } from './options-refiners.js'

type ExtraOptionRefiners = typeof OPTION_REFINERS

declare module '@fullcalendar/core/internal' {
  interface BaseOptionRefiners extends ExtraOptionRefiners {}
}
