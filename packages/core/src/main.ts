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
  computeSmallestCellWidth,
  OrderSpec
} from './util/misc'

export {
  removeExact,
  isArraysEqual
} from './util/array'

export { memoize, memoizeArraylike, memoizeHashlike } from './util/memoize'

export {
  intersectRects,
  Rect, pointInsideRect,
  constrainPoint,
  getRectCenter, diffPoints, Point,
  translateRect
} from './util/geom'

export { mapHash, filterHash, isPropsEqual, compareObjs, buildHashFromArray, collectFromHash } from './util/object'

export {
  findElements,
  findDirectChildren,
  htmlToElement,
  removeElement,
  applyStyle,
  applyStyleProp,
  elementMatches,
  elementClosest
} from './util/dom-manip'

export { EventStore, filterEventStoreDefs, createEmptyEventStore, mergeEventStores, getRelevantEvents, eventTupleToStore } from './structs/event-store'
export { EventUiHash, EventUi, processScopedUiProps, combineEventUis } from './component/event-ui'
export { default as Splitter, SplittableProps } from './component/event-splitting'
export { getDayClassNames, getDateMeta, DateMeta, getSlotClassNames } from './component/date-rendering'
export { buildNavLinkData } from './common/nav-link'

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
export { default as View, ViewProps } from './View'
export { default as ViewApi } from './ViewApi'

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
  formatIsoTimeString,
  formatDayString
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

export { createPlugin, PluginDef, PluginDefInput, ViewPropsTransformer, ViewContainerAppend } from './plugin-system'
export { reducerFunc, Action, CalendarState } from './reducers/types'
export { CalendarComponentProps } from './CalendarComponent'

export { default as DayHeader } from './common/DayHeader'
export { computeFallbackHeaderFormat } from './common/table-utils'
export { default as TableDateCell } from './common/TableDateCell'

export { default as DaySeries } from './common/DaySeriesModel'

export { EventInteractionState } from './interactions/event-interaction-state'
export {
  EventRenderRange, sliceEventStore, hasBgRendering, setElSeg, getElSeg,
  computeSegDraggable, computeSegStartResizable, computeSegEndResizable,
  getEventClassNames, buildSegTimeText,
  buildSegCompareObj, sortEventSegs,
  getSegMeta, EventMeta
} from './component/event-rendering'

export { default as DayTableModel, DayTableSeg, DayTableCell } from './common/DayTableModel'

export { default as Slicer, SlicedProps } from './common/slicing-utils'

export { EventMutation, applyMutationToEventStore } from './structs/event-mutation'
export { Constraint, ConstraintInput, AllowFunc, isPropsValid, isInteractionValid } from './validation'
export { default as EventApi } from './api/EventApi'

export { default as requestJson } from './util/requestJson'

export * from './vdom'
export { BaseComponent, setRef } from './vdom-util'
export { DelayedRunner } from './util/runner'

export { ScrollGridProps, ScrollGridSectionConfig, ColGroupConfig, ScrollGridImpl } from './scrollgrid/ScrollGridImpl'
export { default as SimpleScrollGrid, SimpleScrollGridSection } from './scrollgrid/SimpleScrollGrid'
export {
  CssDimValue, ScrollerLike, SectionConfig, ColProps, ChunkConfig, hasShrinkWidth, renderMicroColGroup,
  getScrollGridClassNames, getSectionClassNames, getDoesSectionVGrow, getAllowYScrolling, renderChunkContent, computeShrinkWidth,
  ChunkContentCallbackArgs,
  CLIENT_HEIGHT_WIGGLE,
  sanitizeShrinkWidth,
  ChunkConfigRowContent, ChunkConfigContent,
  isColPropsEqual
} from './scrollgrid/util'
export { getCanVGrowWithinCell} from './scrollgrid/table-styling'
export { default as Scroller, ScrollerProps, OverflowValue } from './scrollgrid/Scroller'
export { getScrollbarWidths } from './util/scrollbar-width'
export { default as RefMap } from './util/RefMap'
export { getIsRtlScrollbarOnLeft } from './util/scrollbar-side'

export { default as NowTimer } from './NowTimer'
export { default as ScrollResponder, ScrollRequest } from './ScrollResponder'
export { globalPlugins } from './global-plugins'
export { RenderHook, RenderHookProps, RenderHookPropsChildren } from './common/render-hook'
export { default as StandardEvent, StandardEventProps } from './common/StandardEvent'

export { DayCellRoot, DayCellRootProps, DayCellDynamicProps } from './common/DayCellRoot'
export { EventRoot, MinimalEventProps } from './common/EventRoot'
export { WeekNumberRoot, WeekNumberRootProps } from './common/WeekNumberRoot'

export { ViewRoot, ViewRootProps } from './common/ViewRoot'
