import { OPTION_REFINERS } from './options-refiners.js'

// all dependencies except core
import '@fullcalendar/daygrid'

type ExtraOptionRefiners = typeof OPTION_REFINERS

declare module '@fullcalendar/core/internal' {
  interface BaseOptionRefiners extends ExtraOptionRefiners {}
}
