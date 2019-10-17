
// exports
// --------------------------------------------------------------------------------------------------

export const version = '<%= version %>'

// types
export { OptionsInput } from './types/input-types'
export {
  EventInput, EventDef, EventDefHash, EventInstance, EventInstanceHash,
  parseEventDef, createEventInstance, EventTuple
} from './structs/event'
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
  computeVisibleDayRange,
  refineProps,
  matchCellWidths, uncompensateScroll, compensateScroll, subtractInnerElHeight,
  isMultiDayRange,
  distributeHeight,
  undistributeHeight,
  preventSelection, allowSelection, preventContextMenu, allowContextMenu,
  compareNumbers, enableCursor, disableCursor,
  diffDates
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
  intersectRects,
  Rect, pointInsideRect,
  constrainPoint,
  getRectCenter, diffPoints, Point,
  translateRect
} from './util/geom'

export { mapHash, filterHash, isPropsEqual } from './util/object'

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
  elementClosest,
  forceClassName
} from './util/dom-manip'

export { EventStore, filterEventStoreDefs, createEmptyEventStore, mergeEventStores, getRelevantEvents, eventTupleToStore } from './structs/event-store'
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
  getClippingParents,
  computeClippingRect,
  computeRect
} from './util/dom-geom'

export { unpromisify } from './util/promise'

export { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
export { DateRange, rangeContainsMarker, intersectRanges, rangesEqual, rangesIntersect, rangeContainsRange } from './datelib/date-range'
export { default as Mixin } from './common/Mixin'
export { default as PositionCache } from './common/PositionCache'
export { default as ScrollComponent, ScrollbarWidths } from './common/ScrollComponent'
export { ScrollController, ElementScrollController, WindowScrollController } from './common/scroll-controller'
export { default as Theme } from './theme/Theme'
export { default as Component, ComponentContext } from './component/Component'
export { default as DateComponent, Seg, EventSegUiInteractionState } from './component/DateComponent'
export { default as Calendar, DatePointTransform, DateSpanTransform, DateSelectionApi } from './Calendar'
export { default as View, ViewProps } from './View'
export { default as FgEventRenderer, buildSegCompareObj } from './component/renderers/FgEventRenderer'
export { default as FillRenderer } from './component/renderers/FillRenderer'

export { default as DateProfileGenerator, DateProfile } from './DateProfileGenerator'
export { ViewDef } from './structs/view-def'
export { ViewSpec } from './structs/view-spec'
export { DateSpan, DateSpanApi, DatePointApi, isDateSpansEqual } from './structs/date-span'

export { DateMarker, addDays, startOfDay, addMs, addWeeks, diffWeeks, diffWholeWeeks, diffWholeDays, diffDayAndTime, diffDays, isValidDate } from './datelib/marker'
export {
  Duration, createDuration,
  isSingleDay, multiplyDuration, addDurations,
  asRoughMinutes, asRoughSeconds, asRoughMs,
  wholeDivideDurations, greatestDurationDenominator
} from './datelib/duration'
export { DateEnv, DateMarkerMeta } from './datelib/env'

export {
  DateFormatter,
  createFormatter,
  VerboseFormattingArg,
  formatIsoTimeString
} from './datelib/formatting'
export { NamedTimeZoneImpl } from './datelib/timezone'
export { parse as parseMarker } from './datelib/parsing'

export { EventSourceDef, EventSource, EventSourceHash } from './structs/event-source'

export { Interaction, InteractionSettings, interactionSettingsToStore, interactionSettingsStore, InteractionSettingsStore } from './interactions/interaction'
export { PointerDragEvent } from './interactions/pointer'
export { Hit } from './interactions/hit'
export { dateSelectionJoinTransformer } from './interactions/date-selecting'
export { eventDragMutationMassager, EventDropTransformers } from './interactions/event-dragging'
export { EventResizeJoinTransforms } from './interactions/event-resizing'
export { default as ElementDragging } from './interactions/ElementDragging'

export { formatDate, formatRange } from './formatting-api'

export { globalDefaults, config } from './options'

export { RecurringType, ParsedRecurring } from './structs/recurring-event'

export { DragMetaInput, DragMeta, parseDragMeta } from './structs/drag-meta'

export { createPlugin, PluginDef, PluginDefInput, ViewPropsTransformer, ViewContainerModifier } from './plugin-system'
export { reducerFunc, Action, CalendarState } from './reducers/types'
export { CalendarComponentProps } from './CalendarComponent'

export { default as DayHeader } from './common/DayHeader'
export { computeFallbackHeaderFormat, renderDateCell } from './common/table-utils'

export { default as DaySeries } from './common/DaySeries'

export { EventInteractionState } from './interactions/event-interaction-state'
export { EventRenderRange, sliceEventStore, hasBgRendering, getElSeg, computeEventDraggable, computeEventStartResizable, computeEventEndResizable } from './component/event-rendering'

export { default as DayTable, DayTableSeg, DayTableCell } from './common/DayTable'

export { default as Slicer, SlicedProps } from './common/slicing-utils'

export { EventMutation, applyMutationToEventStore } from './structs/event-mutation'
export { Constraint, ConstraintInput, AllowFunc, isPropsValid, isInteractionValid } from './validation'
export { default as EventApi } from './api/EventApi'

export { default as requestJson } from './util/requestJson'
