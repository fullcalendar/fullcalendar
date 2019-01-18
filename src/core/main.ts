
// for intentional side-effects
import './theme/config'
import './event-sources/array-event-source'
import './event-sources/func-event-source'
import './event-sources/json-feed-event-source'
import './structs/recurring-event-simple'

import BasicPlugin from './basic/config'
import { addDefaultPlugin } from './options'
addDefaultPlugin(BasicPlugin)

// exports
// --------------------------------------------------------------------------------------------------

export const version = '<%= version %>'

// When introducing internal API incompatibilities (where fullcalendar plugins would break),
// the minor version of the calendar should be upped (ex: 2.7.2 -> 2.8.0)
// and the below integer should be incremented.
export const internalApiVersion: number = 12

// types
export { OptionsInput } from './types/input-types'
export { EventInput, EventDef, EventDefHash, EventInstance, EventInstanceHash } from './structs/event'
export { BusinessHoursInput, parseBusinessHours } from './structs/business-hours'

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
  warn,
  computeVisibleDayRange,
  refineProps,
  matchCellWidths, uncompensateScroll, compensateScroll, subtractInnerElHeight,
  isMultiDayRange
} from './util/misc'

export {
  htmlEscape,
  cssToStr
} from './util/html'

export {
  removeExact,
  isArraysEqual
} from './util/array'

export { memoize, memoizeOutput } from './util/memoize'
export { memoizeRendering, MemoizedRendering } from './component/memoized-rendering'

export {
  intersectRects
} from './util/geom'

export { isPropsEqual, mapHash, filterHash } from './util/object'

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

export { EventStore, filterEventStoreDefs, createEmptyEventStore, mergeEventStores } from './structs/event-store'
export { EventUiHash, EventUi, processScopedUiProps, combineEventUis } from './component/event-ui'
export { default as Splitter, SplittableProps } from './component/event-splitting'
export { buildGotoAnchorHtml, getAllDayHtml, getDayClasses } from './component/date-rendering'

export {
  preventDefault,
  listenBySelector,
  whenTransitionDone
} from './util/dom-event'

export {
  computeInnerRect,
  computeEdges,
  computeHeightAndMargins,
  getClippingParents
} from './util/dom-geom'

export { unpromisify } from './util/promise'

export { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
export { DateRange, rangeContainsMarker, intersectRanges, rangesEqual, rangesIntersect } from './datelib/date-range'
export { defineThemeSystem } from './theme/ThemeRegistry'
export { default as Mixin } from './common/Mixin'
export { default as PositionCache } from './common/PositionCache'
export { default as ScrollComponent, ScrollbarWidths } from './common/ScrollComponent'
export { default as Theme } from './theme/Theme'
export { default as Component, ComponentContext } from './component/Component'
export { default as DateComponent, Seg, EventSegUiInteractionState } from './component/DateComponent'
export { default as Calendar, DatePointTransform, DateSpanTransform } from './Calendar'
export { default as View, ViewProps } from './View'
export { default as FgEventRenderer, buildSegCompareObj } from './component/renderers/FgEventRenderer'
export { default as FillRenderer } from './component/renderers/FillRenderer'
export { default as SimpleDayGrid, DayGridSlicer } from './basic/SimpleDayGrid'
export { default as DayGrid, DayGridSeg } from './basic/DayGrid'
export { default as BasicView, buildDayTable as buildBasicDayTable } from './basic/BasicView'
export { default as DayBgRow } from './basic/DayBgRow'
export { default as DateProfileGenerator, DateProfile } from './DateProfileGenerator'
export { ViewDef } from './structs/view-def'
export { ViewSpec, ViewSpecTransformer } from './structs/view-spec'
export { DateSpan, DateSpanApi, DatePointApi } from './structs/date-span'

export { DateMarker, addDays, startOfDay, addMs, diffWholeWeeks, diffWholeDays, diffDayAndTime, diffDays, isValidDate } from './datelib/marker'
export {
  Duration, createDuration,
  isSingleDay, multiplyDuration, addDurations,
  asRoughMinutes, asRoughSeconds, asRoughMs,
  wholeDivideDurations, greatestDurationDenominator,
} from './datelib/duration'
export { DateEnv, DateMarkerMeta } from './datelib/env'
export { defineLocale, getLocale, getLocaleCodes } from './datelib/locale'
export {
  DateFormatter,
  createFormatter,
  VerboseFormattingArg,
  formatIsoTimeString
} from './datelib/formatting'
export { NamedTimeZoneImpl, registerNamedTimeZoneImpl } from './datelib/timezone'
export { registerCmdFormatter } from './datelib/formatting-cmd'
export { parse as parseMarker } from './datelib/parsing'

export { registerEventSourceDef } from './structs/event-source'

export { default as PointerDragging, PointerDragEvent } from './dnd/PointerDragging'
export { default as ElementDragging } from './dnd/ElementDragging'

export { default as Draggable } from './interactions-external/ExternalDraggable'
export { default as ThirdPartyDraggable } from './interactions-external/ThirdPartyDraggable'

export { Hit } from './interactions/HitDragging'
export { dateSelectionJoinTransformer } from './interactions/DateSelecting'

export { formatDate, formatRange } from './formatting-api'

export { globalDefaults, globalHooks } from './options'

export { registerRecurringType, ParsedRecurring } from './structs/recurring-event'

export { createPlugin, PluginDef, PluginDefInput, ViewPropsTransformer, ViewContainerModifier } from './plugin-system'
export { reducerFunc, Action, CalendarState } from './reducers/types'
export { CalendarComponentProps } from './CalendarComponent'

export { default as DayHeader } from './common/DayHeader'
export { computeFallbackHeaderFormat, renderDateCell } from './common/table-utils'

export { default as OffsetTracker } from './common/OffsetTracker'

export { default as DaySeries } from './common/DaySeries'

export { EventInteractionState } from './interactions/event-interaction-state'
export { EventRenderRange, sliceEventStore, hasBgRendering } from './component/event-rendering'

export { default as DayTable, DayTableSeg, DayTableCell } from './common/DayTable'

export { default as Slicer, SlicedProps } from './common/slicing-utils'

export { EventMutation } from './structs/event-mutation'
export { Constraint, ConstraintInput, AllowFunc, isPropsValid } from './validation'
export { default as EventApi } from './api/EventApi'
