import { OPTION_REFINERS } from './option-refiners.js'

type ExtraOptionRefiners = typeof OPTION_REFINERS

declare module '@teamdiverst/fullcalendar-core/internal' {
  interface BaseOptionRefiners extends ExtraOptionRefiners {}
}
