import './main.css'

// exports
// --------------------------------------------------------------------------------------------------

export const version: string = '<%= version %>' // important to type it, so .d.ts has generic string

// explicit API
export { EventSourceApi } from './api/EventSourceApi'
export { EventApi, buildEventApis } from './api/EventApi'
export { CalendarApi } from './CalendarApi'
export { formatDate, formatRange, FormatDateOptions, FormatRangeOptions } from './formatting-api'
export { ViewApi } from './ViewApi'
export * from './api-type-deps'

export { // things for plugins. everything else is exported in api-type-deps
  BASE_OPTION_DEFAULTS, BASE_OPTION_REFINERS, identity, Identity, Dictionary, refineProps,
  BaseOptionRefiners, BaseOptionsRefined, CalendarOptionRefiners, CalendarOptionsRefined,
  ViewOptionRefiners, ViewOptionsRefined, RawOptionsFromRefiners, RefinedOptionsFromRefiners,
  CalendarListenerRefiners,
} from './options'

export { EventDef, EventDefHash } from './structs/event-def'
export { EventInstance, EventInstanceHash, createEventInstance } from './structs/event-instance'
export { EventInput, EventRefined, parseEventDef, EventTuple, EventRefiners, refineEventDef } from './structs/event-parse'
export { BusinessHoursInput, parseBusinessHours } from './structs/business-hours'

export {
  padStart,
  isInt,
  parseFieldSpecs,
  compareByFieldSpecs,
  compareByFieldSpec,
  flexibleCompare,
  preventSelection, allowSelection, preventContextMenu, allowContextMenu,
  compareNumbers, enableCursor, disableCursor,
  guid,
  computeSmallestCellWidth,
  OrderSpec,
} from './util/misc'

export {
  computeVisibleDayRange,
  isMultiDayRange,
  diffDates,
} from './util/date'

export {
  removeExact,
  isArraysEqual,
} from './util/array'

export { memoize, memoizeObjArg, memoizeArraylike, memoizeHashlike } from './util/memoize'

export {
  intersectRects,
  Rect, pointInsideRect,
  constrainPoint,
  getRectCenter, diffPoints, Point,
  translateRect,
} from './util/geom'

export { mapHash, filterHash, isPropsEqual, compareObjs, buildHashFromArray, collectFromHash, getUnequalProps } from './util/object'

export {
  findElements,
  findDirectChildren,
  removeElement,
  applyStyle,
  applyStyleProp,
  elementMatches,
  elementClosest,
} from './util/dom-manip'
export { parseClassNames } from './util/html'

export { getCanVGrowWithinCell } from './util/table-styling'

export {
  EventStore,
  filterEventStoreDefs,
  createEmptyEventStore,
  mergeEventStores,
  getRelevantEvents,
  eventTupleToStore,
} from './structs/event-store'
export { EventUiHash, EventUi, combineEventUis, createEventUi } from './component/event-ui'
export { Splitter, SplittableProps } from './component/event-splitting'
export { getDayClassNames, getDateMeta, DateMeta, getSlotClassNames } from './component/date-rendering'
export { buildNavLinkData } from './common/nav-link'

export {
  preventDefault,
  listenBySelector,
  whenTransitionDone,
} from './util/dom-event'

export {
  computeInnerRect,
  computeEdges,
  computeHeightAndMargins,
  getClippingParents,
  computeRect,
} from './util/dom-geom'

export { unpromisify } from './util/promise'

export { Emitter } from './common/Emitter'
export { DateRange, rangeContainsMarker, intersectRanges, rangesEqual, rangesIntersect, rangeContainsRange } from './datelib/date-range'
export { PositionCache } from './common/PositionCache'
export { ScrollController, ElementScrollController, WindowScrollController } from './common/scroll-controller'
export { Theme } from './theme/Theme'
export { ViewContext, ViewContextType } from './ViewContext'
export { DateComponent, Seg, EventSegUiInteractionState } from './component/DateComponent'
export { CalendarData } from './reducers/data-types'
export { CalendarDataManager } from './reducers/CalendarDataManager'
export { CalendarDataProvider, CalendarDataProviderProps } from './component/CalendarDataProvider'
export { ViewProps, sliceEvents } from './View'

export { DateProfileGenerator, DateProfile } from './DateProfileGenerator'
export { ViewDef } from './structs/view-def'
export { ViewSpec } from './structs/view-spec'
export { DateSpan, DateSpanApi, DatePointApi, isDateSpansEqual } from './structs/date-span'

export {
  DateMarker,
  addDays,
  startOfDay,
  addMs,
  addWeeks,
  diffWeeks,
  diffWholeWeeks,
  diffWholeDays,
  diffDayAndTime,
  diffDays,
  isValidDate,
} from './datelib/marker'
export {
  Duration, createDuration,
  asCleanDays, multiplyDuration, addDurations,
  asRoughMinutes, asRoughSeconds, asRoughMs,
  wholeDivideDurations, greatestDurationDenominator,
} from './datelib/duration'
export { DateEnv, DateMarkerMeta } from './datelib/env'

export {
  createFormatter,
  FormatterInput,
} from './datelib/formatting'
export {
  DateFormatter,
  VerboseFormattingArg,
} from './datelib/DateFormatter'
export {
  formatIsoTimeString,
  formatDayString,
  buildIsoString,
} from './datelib/formatting-utils'
export { NamedTimeZoneImpl } from './datelib/timezone'
export { parse as parseMarker } from './datelib/parsing'
export { LocaleInput } from './datelib/locale'

export { EventSourceDef } from './structs/event-source-def'
export { EventSource, EventSourceHash } from './structs/event-source'
export { EventSourceRefiners, EventSourceRefined } from './structs/event-source-parse'

export {
  SegSpan, SegRect, SegHierarchy, SegEntry, SegInsertion, buildEntryKey,
  getEntrySpanEnd, binarySearch, SegEntryGroup, groupIntersectingEntries,
  joinSpans, intersectSpans,
} from './seg-hierarchy'

export {
  Interaction,
  InteractionSettings,
  interactionSettingsToStore,
  interactionSettingsStore,
  InteractionSettingsStore,
} from './interactions/interaction'
export { PointerDragEvent } from './interactions/pointer'
export { Hit } from './interactions/hit'
export { dateSelectionJoinTransformer } from './interactions/date-selecting'
export { eventDragMutationMassager, EventDropTransformers } from './interactions/event-dragging'
export { ElementDragging } from './interactions/ElementDragging'

export { config } from './global-config'
export { globalLocales } from './global-locales'

export { RecurringType, ParsedRecurring } from './structs/recurring-event'

export { DragMetaInput, DragMeta, parseDragMeta } from './structs/drag-meta'

export { PluginDef, PluginDefInput, ViewPropsTransformer, ViewContainerAppend } from './plugin-system-struct'
export { createPlugin } from './plugin-system'
export { Action } from './reducers/Action'
export { CalendarContext } from './CalendarContext'
export { CalendarContentProps, CalendarContent } from './CalendarContent'
export { CalendarRoot } from './CalendarRoot'

export { DayHeader } from './common/DayHeader'
export { computeFallbackHeaderFormat } from './common/table-utils'
export { TableDateCell } from './common/TableDateCell'
export { TableDowCell } from './common/TableDowCell'

export { DaySeriesModel } from './common/DaySeriesModel'

export { EventInteractionState } from './interactions/event-interaction-state'
export {
  EventRenderRange, sliceEventStore, hasBgRendering, setElSeg, getElSeg,
  computeSegDraggable, computeSegStartResizable, computeSegEndResizable,
  getEventClassNames, buildSegTimeText,
  buildSegCompareObj, sortEventSegs,
  getSegMeta, EventContentArg, buildEventRangeKey,
} from './component/event-rendering'

export { DayTableModel, DayTableSeg, DayTableCell } from './common/DayTableModel'

export { Slicer, SlicedProps } from './common/slicing-utils'

export { EventMutation, applyMutationToEventStore } from './structs/event-mutation'
export { Constraint, ConstraintInput, AllowFunc } from './structs/constraint'
export { isPropsValid, isInteractionValid, isDateSelectionValid } from './validation'

export { requestJson } from './util/requestJson'

export * from './vdom'
export { BaseComponent, setRef } from './vdom-util'
export { DelayedRunner } from './util/DelayedRunner'

export {
  ScrollGridProps,
  ScrollGridSectionConfig,
  ColGroupConfig,
  ScrollGridImpl,
  ScrollGridChunkConfig,
} from './scrollgrid/ScrollGridImpl'
export { SimpleScrollGrid, SimpleScrollGridSection } from './scrollgrid/SimpleScrollGrid'
export {
  CssDimValue, ScrollerLike, SectionConfig, ColProps, ChunkConfig, hasShrinkWidth, renderMicroColGroup,
  getScrollGridClassNames, getSectionClassNames, getSectionHasLiquidHeight, getAllowYScrolling, renderChunkContent, computeShrinkWidth,
  ChunkContentCallbackArgs,
  sanitizeShrinkWidth,
  ChunkConfigRowContent, ChunkConfigContent,
  isColPropsEqual,
  renderScrollShim,
  getStickyFooterScrollbar,
  getStickyHeaderDates,
} from './scrollgrid/util'
export { Scroller, ScrollerProps, OverflowValue } from './scrollgrid/Scroller'
export { getScrollbarWidths } from './util/scrollbar-width'
export { RefMap } from './util/RefMap'
export { getIsRtlScrollbarOnLeft } from './util/scrollbar-side'

export { NowTimer } from './NowTimer'
export { ScrollResponder, ScrollRequest } from './ScrollResponder'
export { globalPlugins } from './global-plugins'
export {
  RenderHook, RenderHookProps, RenderHookPropsChildren, MountHook, MountHookProps, buildClassNameNormalizer, ContentHook,
  CustomContentRenderContext, ClassNamesGenerator, CustomContentGenerator, DidMountHandler, WillUnmountHandler, MountArg,
} from './common/render-hook'
export { StandardEvent, StandardEventProps } from './common/StandardEvent'
export { NowIndicatorRoot, NowIndicatorRootProps } from './common/NowIndicatorRoot'

export { DayCellRoot, DayCellRootProps, DayCellContentArg } from './common/DayCellRoot'
export { DayCellContent, DayCellContentProps } from './common/DayCellContent'
export { EventRoot, MinimalEventProps } from './common/EventRoot'
export { renderFill, BgEvent, BgEventProps } from './common/bg-fill'
export { WeekNumberRoot, WeekNumberRootProps } from './common/WeekNumberRoot'
export { MoreLinkRoot, MoreLinkRootProps, MoreLinkContentArg, MoreLinkMountArg, computeEarliestSegStart } from './common/MoreLinkRoot'

export { ViewRoot, ViewRootProps } from './common/ViewRoot'
export { triggerDateSelect, DatePointTransform, DateSpanTransform, DateSelectionApi, getDefaultEventEnd } from './calendar-utils'
