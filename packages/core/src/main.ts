import './main.scss'

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
  padStart,
  isInt,
  capitaliseFirstLetter,
  parseFieldSpecs,
  compareByFieldSpecs,
  compareByFieldSpec,
  flexibleCompare,
  computeVisibleDayRange,
  refineProps,
  isMultiDayRange,
  preventSelection, allowSelection, preventContextMenu, allowContextMenu,
  compareNumbers, enableCursor, disableCursor,
  diffDates,
  guid,
  computeSmallestCellWidth
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
  findDirectChildren,
  htmlToElement,
  htmlToElements,
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
export { getDayClasses } from './component/date-rendering'
export { default as GotoAnchor } from './component/GotoAnchor'

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
  computeRect
} from './util/dom-geom'

export { unpromisify } from './util/promise'

export { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
export { DateRange, rangeContainsMarker, intersectRanges, rangesEqual, rangesIntersect, rangeContainsRange } from './datelib/date-range'
export { default as Mixin } from './common/Mixin'
export { default as PositionCache } from './common/PositionCache'
export { ScrollController, ElementScrollController, WindowScrollController } from './common/scroll-controller'
export { default as Theme } from './theme/Theme'
export { default as ComponentContext, ComponentContextType } from './component/ComponentContext'
export { default as DateComponent, Seg, EventSegUiInteractionState } from './component/DateComponent'
export { default as Calendar, DatePointTransform, DateSpanTransform, DateSelectionApi } from './Calendar'
export { default as View, ViewProps, getViewClassNames } from './View'
export { default as ViewApi } from './ViewApi'
export { default as FgEventRenderer, buildSegCompareObj, BaseFgEventRendererProps, sortEventSegs } from './component/renderers/FgEventRenderer'
export { default as FillRenderer, BaseFillRendererProps } from './component/renderers/FillRenderer'

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
export { computeFallbackHeaderFormat } from './common/table-utils'
export { default as TableDateCell } from './common/TableDateCell'

export { default as DaySeries } from './common/DaySeriesModel'

export { EventInteractionState } from './interactions/event-interaction-state'
export { EventRenderRange, sliceEventStore, hasBgRendering, getElSeg, computeEventDraggable, computeEventStartResizable, computeEventEndResizable } from './component/event-rendering'

export { default as DayTableModel, DayTableSeg, DayTableCell } from './common/DayTableModel'

export { default as Slicer, SlicedProps } from './common/slicing-utils'

export { EventMutation, applyMutationToEventStore } from './structs/event-mutation'
export { Constraint, ConstraintInput, AllowFunc, isPropsValid, isInteractionValid } from './validation'
export { default as EventApi } from './api/EventApi'

export { default as requestJson } from './util/requestJson'

export * from './vdom'
export { subrenderer, SubRenderer, BaseComponent, setRef, renderVNodes, buildMapSubRenderer, componentNeedsResize } from './vdom-util'
export { DelayedRunner } from './util/runner'

export { default as SimpleScrollGrid, SimpleScrollGridSection } from './scrollgrid/SimpleScrollGrid'
export {
  CssDimValue, ScrollerLike, SectionConfig, ColProps, ChunkConfig, hasShrinkWidth, renderMicroColGroup,
  getScrollGridClassNames, getSectionClassNames, getChunkVGrow, getNeedsYScrolling, renderChunkContent, computeForceScrollbars, computeShrinkWidth,
  getChunkClassNames, ChunkContentCallbackArgs,
  computeScrollerClientWidths, computeScrollerClientHeights,
  sanitizeShrinkWidth,
  ChunkConfigRowContent, ChunkConfigContent
} from './scrollgrid/util'
export { default as Scroller, ScrollerProps, OverflowValue } from './scrollgrid/Scroller'
export { getScrollbarWidths } from './util/scrollbar-width'
export { default as RefMap } from './util/RefMap'
export { getIsRtlScrollbarOnLeft } from './util/scrollbar-side'

export { default as NowTimer, NowTimerCallback } from './NowTimer'
export { default as ScrollResponder, ScrollRequest } from './ScrollResponder'
export { globalPlugins } from './global-plugins'
