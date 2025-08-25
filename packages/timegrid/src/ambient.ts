import { OPTION_REFINERS } from './options-refiners.js'

// all dependencies except core
import '@teamdiverst/fullcalendar-daygrid'

type ExtraOptionRefiners = typeof OPTION_REFINERS

declare module '@teamdiverst/fullcalendar-core/internal' {
  interface BaseOptionRefiners extends ExtraOptionRefiners {}
}
