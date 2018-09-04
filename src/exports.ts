
export const version = '<%= version %>'

// When introducing internal API incompatibilities (where fullcalendar plugins would break),
// the minor version of the calendar should be upped (ex: 2.7.2 -> 2.8.0)
// and the below integer should be incremented.
export const internalApiVersion = 12

// types
export { OptionsInput } from './types/input-types'
export { EventInput } from './structs/event'
export { BusinessHoursInput } from './structs/business-hours'

export {
  applyAll,
  debounce,
  padStart,
  isInt,
  capitaliseFirstLetter,
  parseFieldSpecs,
  compareByFieldSpecs,
  compareByFieldSpec,
  flexibleCompare,
  log,
  warn
} from './util/misc'

export {
  htmlEscape,
  cssToStr
} from './util/html'

export {
  removeExact
} from './util/array'

export {
  intersectRects
} from './util/geom'

export {
  assignTo
} from './util/object'

export {
  findElements,
  findChildren,
  htmlToElement,
  createElement,
  insertAfterElement,
  prependToElement,
  removeElement,
  appendToElement,
  applyStyle,
  applyStyleProp,
  elementMatches,
  forceClassName
} from './util/dom-manip'

export {
  preventDefault,
  listenBySelector,
  whenTransitionDone
} from './util/dom-event'

export {
  computeInnerRect,
  computeEdges,
  computeHeightAndMargins
} from './util/dom-geom'

export { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
export { DateRange, rangeContainsMarker, intersectRanges } from './datelib/date-range'
export { defineThemeSystem } from './theme/ThemeRegistry'
export { default as Mixin } from './common/Mixin'
export { default as PositionCache } from './common/PositionCache'
export { default as ScrollComponent } from './common/ScrollComponent'
export { default as Theme } from './theme/Theme'
export { default as DateComponent } from './component/DateComponent'
export { default as Calendar } from './Calendar'
export { default as View } from './View'
export { defineView, getViewConfig } from './ViewRegistry'
export { default as DayTableMixin } from './component/DayTableMixin'
export { default as EventRenderer } from './component/renderers/EventRenderer'
export { default as FillRenderer } from './component/renderers/FillRenderer'
export { default as MirrorRenderer } from './component/renderers/MirrorRenderer'
export { default as AgendaView } from './agenda/AgendaView'
export { default as TimeGrid } from './agenda/TimeGrid'
export { default as DayGrid } from './basic/DayGrid'
export { default as BasicView } from './basic/BasicView'
export { default as MonthView } from './basic/MonthView'
export { default as ListView } from './list/ListView'
export { DateProfile } from './DateProfileGenerator'

export { DateMarker, addDays, startOfDay, addMs, diffWholeWeeks, diffWholeDays, diffDayAndTime } from './datelib/marker'
export {
  Duration, createDuration,
  isSingleDay, multiplyDuration, addDurations,
  asRoughMinutes, asRoughSeconds, asRoughMs,
  wholeDivideDurations, greatestDurationDenominator
} from './datelib/duration'
export { DateEnv } from './datelib/env'
export { defineLocale, getLocale, getLocaleCodes } from './datelib/locale'
export { DateFormatter, createFormatter } from './datelib/formatting'
export { parse as parseMarker } from './datelib/parsing'

export { registerEventSourceDef } from './structs/event-source'
export { refineProps } from './util/misc'

export { default as PointerDragging, PointerDragEvent } from './dnd/PointerDragging'
export { default as ElementDragging } from './dnd/ElementDragging'

export { default as Draggable } from './interactions-external/ExternalDraggable'
export { default as ThirdPartyDraggable } from './interactions-external/ThirdPartyDraggable'

export { formatDate, formatRange } from './formatting-api'
