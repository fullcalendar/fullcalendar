
export const version = '<%= version %>'

// When introducing internal API incompatibilities (where fullcalendar plugins would break),
// the minor version of the calendar should be upped (ex: 2.7.2 -> 2.8.0)
// and the below integer should be incremented.
export const internalApiVersion = 12

export {
  BusinessHoursInput,
  EventObjectInput,
  EventOptionsBase,
  OptionsInput
} from './types/input-types'

export {
  applyAll,
  debounce,
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
export { default as ListenerMixin, ListenerInterface } from './common/ListenerMixin'
export { default as Model } from './common/Model'
export { default as Constraints } from './Constraints'
export { default as UnzonedRange } from './models/UnzonedRange'
export { default as ComponentFootprint } from './models/ComponentFootprint'
export { default as BusinessHourGenerator } from './models/BusinessHourGenerator'
export { default as EventDef } from './models/event/EventDef'
export { default as EventDefMutation } from './models/event/EventDefMutation'
export { default as EventSourceParser } from './models/event-source/EventSourceParser'
export { default as EventSource } from './models/event-source/EventSource'
export { defineThemeSystem } from './theme/ThemeRegistry'
export { default as EventInstanceGroup } from './models/event/EventInstanceGroup'
export { default as ArrayEventSource } from './models/event-source/ArrayEventSource'
export { default as FuncEventSource } from './models/event-source/FuncEventSource'
export { default as JsonFeedEventSource } from './models/event-source/JsonFeedEventSource'
export { default as EventFootprint } from './models/event/EventFootprint'
export { default as Class } from './common/Class'
export { default as Mixin } from './common/Mixin'
export { default as CoordCache } from './common/CoordCache'
export { default as DragListener } from './common/DragListener'
export { default as TaskQueue } from './common/TaskQueue'
export { default as RenderQueue } from './common/RenderQueue'
export { default as Scroller } from './common/Scroller'
export { default as Theme } from './theme/Theme'
export { default as DateComponent } from './component/DateComponent'
export { default as InteractiveDateComponent } from './component/InteractiveDateComponent'
export { default as Calendar } from './Calendar'
export { default as View } from './View'
export { defineView, getViewConfig } from './ViewRegistry'
export { default as DayTableMixin } from './component/DayTableMixin'
export { default as BusinessHourRenderer } from './component/renderers/BusinessHourRenderer'
export { default as EventRenderer } from './component/renderers/EventRenderer'
export { default as FillRenderer } from './component/renderers/FillRenderer'
export { default as HelperRenderer } from './component/renderers/HelperRenderer'
export { default as ExternalDropping } from './component/interactions/ExternalDropping'
export { default as EventResizing } from './component/interactions/EventResizing'
export { default as EventPointing } from './component/interactions/EventPointing'
export { default as EventDragging } from './component/interactions/EventDragging'
export { default as DateSelecting } from './component/interactions/DateSelecting'
export { default as StandardInteractionsMixin } from './component/interactions/StandardInteractionsMixin'
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
  isSingleDay, multiplyDuration,
  asRoughMinutes, asRoughSeconds, asRoughMs,
  wholeDivideDurations, greatestDurationDenominator
} from './datelib/duration'
export { DateEnv } from './datelib/env'
export { defineLocale, getLocale, getLocaleCodes } from './datelib/locale'
export { DateFormatter, createFormatter } from './datelib/formatting'
