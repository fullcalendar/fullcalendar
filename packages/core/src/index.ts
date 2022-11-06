import './index.css'

// exports
// --------------------------------------------------------------------------------------------------

export const version: string = '<%= version %>' // important to type it, so .d.ts has generic string

export { Calendar } from './Calendar.js'

// TODO: audit all exports. will not need many after combining core+common

// explicit API
export { EventSourceApi } from './api/EventSourceApi.js'
export { EventApi, buildEventApis } from './api/EventApi.js'
export { CalendarApi } from './CalendarApi.js'
export type { FormatDateOptions, FormatRangeOptions } from './formatting-api.js'
export { formatDate, formatRange } from './formatting-api.js'
export { ViewApi } from './ViewApi.js'
export * from './api-type-deps.js'

// things for plugins. everything else is exported in api-type-deps
export type {
  Identity, Dictionary,
  BaseOptionRefiners, BaseOptionsRefined, CalendarOptionRefiners, CalendarOptionsRefined,
  ViewOptionRefiners, ViewOptionsRefined, RawOptionsFromRefiners, RefinedOptionsFromRefiners,
  CalendarListenerRefiners,
} from './options.js'
export { BASE_OPTION_DEFAULTS, BASE_OPTION_REFINERS, identity,  refineProps } from './options.js'

export type { EventDef, EventDefHash } from './structs/event-def.js'
export type { EventInstance, EventInstanceHash } from './structs/event-instance.js'
export { createEventInstance } from './structs/event-instance.js'
export type { EventInput, EventRefined, EventTuple, EventRefiners } from './structs/event-parse.js'
export { parseEventDef, refineEventDef } from './structs/event-parse.js'
export type { BusinessHoursInput } from './structs/business-hours.js'
export { parseBusinessHours } from './structs/business-hours.js'

export type { OrderSpec } from './util/misc.js'
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
} from './util/misc.js'

export {
  computeVisibleDayRange,
  isMultiDayRange,
  diffDates,
} from './util/date.js'

export {
  removeExact,
  isArraysEqual,
} from './util/array.js'

export type { MemoizeHashFunc, MemoiseArrayFunc } from './util/memoize.js'
export { memoize, memoizeObjArg, memoizeArraylike, memoizeHashlike } from './util/memoize.js'

export type { Rect, Point } from './util/geom.js'
export {
  intersectRects,
  pointInsideRect,
  constrainPoint,
  getRectCenter, diffPoints,
  translateRect,
} from './util/geom.js'

export { mapHash, filterHash, isPropsEqual, compareObjs, buildHashFromArray, collectFromHash, getUnequalProps } from './util/object.js'

export {
  findElements,
  findDirectChildren,
  removeElement,
  applyStyle,
  applyStyleProp,
  elementMatches,
  elementClosest,
  getElRoot,
  getEventTargetViaRoot,
  getUniqueDomId,
} from './util/dom-manip.js'
export { parseClassNames } from './util/html.js'

export { getCanVGrowWithinCell } from './util/table-styling.js'

export type { EventStore } from './structs/event-store.js'
export {
  filterEventStoreDefs,
  createEmptyEventStore,
  mergeEventStores,
  getRelevantEvents,
  eventTupleToStore,
} from './structs/event-store.js'
export type { EventUiHash, EventUi } from './component/event-ui.js'
export { combineEventUis, createEventUi } from './component/event-ui.js'
export type { SplittableProps } from './component/event-splitting.js'
export { Splitter } from './component/event-splitting.js'
export type { DateMeta } from './component/date-rendering.js'
export { getDayClassNames, getDateMeta, getSlotClassNames } from './component/date-rendering.js'
export { buildNavLinkAttrs } from './common/nav-link.js'

export {
  preventDefault,
  listenBySelector,
  whenTransitionDone,
  createAriaClickAttrs,
} from './util/dom-event.js'

export {
  computeInnerRect,
  computeEdges,
  computeHeightAndMargins,
  getClippingParents,
  computeRect,
} from './util/dom-geom.js'

export { unpromisify } from './util/promise.js'

export { Emitter } from './common/Emitter.js'
export type { DateRange } from './datelib/date-range.js'
export { rangeContainsMarker, intersectRanges, rangesEqual, rangesIntersect, rangeContainsRange } from './datelib/date-range.js'
export { PositionCache } from './common/PositionCache.js'
export { ScrollController, ElementScrollController, WindowScrollController } from './common/scroll-controller.js'
export { Theme } from './theme/Theme.js'
export type { ViewContext } from './ViewContext.js'
export { ViewContextType } from './ViewContext.js'
export type { Seg, EventSegUiInteractionState } from './component/DateComponent.js'
export { DateComponent } from './component/DateComponent.js'
export type { CalendarData } from './reducers/data-types.js'
export { CalendarDataManager } from './reducers/CalendarDataManager.js'
export type { CalendarDataProviderProps } from './component/CalendarDataProvider.js'
export { CalendarDataProvider } from './component/CalendarDataProvider.js'
export type { ViewProps } from './View.js'
export { sliceEvents } from './View.js'

export type { DateProfile } from './DateProfileGenerator.js'
export { DateProfileGenerator } from './DateProfileGenerator.js'
export type { ViewDef } from './structs/view-def.js'
export type { ViewSpec } from './structs/view-spec.js'
export type { DateSpan, DateSpanApi, DatePointApi } from './structs/date-span.js'
export { isDateSpansEqual } from './structs/date-span.js'

export type { DateMarker } from './datelib/marker.js'
export {
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
} from './datelib/marker.js'
export type { Duration } from './datelib/duration.js'
export {
  createDuration,
  asCleanDays, multiplyDuration, addDurations,
  asRoughMinutes, asRoughSeconds, asRoughMs,
  wholeDivideDurations, greatestDurationDenominator,
} from './datelib/duration.js'
export type { DateMarkerMeta } from './datelib/env.js'
export { DateEnv } from './datelib/env.js'

export type { FormatterInput } from './datelib/formatting.js'
export { createFormatter } from './datelib/formatting.js'
export type { DateFormatter, VerboseFormattingArg } from './datelib/DateFormatter.js'
export {
  formatIsoTimeString,
  formatDayString,
  buildIsoString,
} from './datelib/formatting-utils.js'
export { NamedTimeZoneImpl } from './datelib/timezone.js'
export { parse as parseMarker } from './datelib/parsing.js'
export type { LocaleInput } from './datelib/locale.js'

export type { EventSourceDef } from './structs/event-source-def.js'
export type { EventSource, EventSourceHash } from './structs/event-source.js'
export type { EventSourceRefiners, EventSourceRefined } from './structs/event-source-parse.js'

export type { SegSpan, SegRect, SegEntry, SegInsertion, SegEntryGroup } from './seg-hierarchy.js'
export {
  SegHierarchy, buildEntryKey, getEntrySpanEnd, binarySearch, groupIntersectingEntries,
  joinSpans, intersectSpans,
} from './seg-hierarchy.js'

export type { InteractionSettings, InteractionSettingsStore } from './interactions/interaction.js'
export {
  Interaction,
  interactionSettingsToStore,
  interactionSettingsStore,
} from './interactions/interaction.js'
export type { PointerDragEvent } from './interactions/pointer.js'
export type { Hit } from './interactions/hit.js'
export type { dateSelectionJoinTransformer } from './interactions/date-selecting.js'
export type { eventDragMutationMassager, EventDropTransformers } from './interactions/event-dragging.js'
export { ElementDragging } from './interactions/ElementDragging.js'

export { config } from './global-config.js'
export { globalLocales } from './global-locales.js'

export type { RecurringType, ParsedRecurring } from './structs/recurring-event.js'

export type { DragMetaInput, DragMeta } from './structs/drag-meta.js'
export { parseDragMeta } from './structs/drag-meta.js'

export type { PluginDef, PluginDefInput, ViewPropsTransformer, ViewContainerAppend } from './plugin-system-struct.js'
export { createPlugin } from './plugin-system.js'
export type { Action } from './reducers/Action.js'
export type { CalendarContext } from './CalendarContext.js'
export type { CalendarContentProps } from './CalendarContent.js'
export { CalendarContent } from './CalendarContent.js'
export { CalendarRoot } from './CalendarRoot.js'

export { DayHeader } from './common/DayHeader.js'
export { computeFallbackHeaderFormat } from './common/table-utils.js'
export { TableDateCell } from './common/TableDateCell.js'
export { TableDowCell } from './common/TableDowCell.js'

export { DaySeriesModel } from './common/DaySeriesModel.js'

export type { EventInteractionState } from './interactions/event-interaction-state.js'
export type { EventRenderRange, EventContentArg } from './component/event-rendering.js'
export {
  sliceEventStore, hasBgRendering, setElSeg, getElSeg,
  computeSegDraggable, computeSegStartResizable, computeSegEndResizable,
  getEventClassNames, buildSegTimeText,
  buildSegCompareObj, sortEventSegs,
  getSegMeta, buildEventRangeKey,
  getSegAnchorAttrs,
} from './component/event-rendering.js'

export type { DayTableSeg, DayTableCell } from './common/DayTableModel.js'
export { DayTableModel } from './common/DayTableModel.js'

export type { SlicedProps } from './common/slicing-utils.js'
export { Slicer } from './common/slicing-utils.js'

export type { EventMutation } from './structs/event-mutation.js'
export { applyMutationToEventStore } from './structs/event-mutation.js'
export type { Constraint, ConstraintInput, AllowFunc } from './structs/constraint.js'
export { isPropsValid, isInteractionValid, isDateSelectionValid } from './validation.js'

export { requestJson } from './util/requestJson.js'

export { BaseComponent, setRef } from './vdom-util.js'
export { DelayedRunner } from './util/DelayedRunner.js'

export type {
  ScrollGridProps,
  ScrollGridSectionConfig,
  ColGroupConfig,
  ScrollGridImpl,
  ScrollGridChunkConfig,
} from './scrollgrid/ScrollGridImpl.js'
export type { SimpleScrollGridSection } from './scrollgrid/SimpleScrollGrid.js'
export { SimpleScrollGrid } from './scrollgrid/SimpleScrollGrid.js'
export type {
  CssDimValue, ScrollerLike, SectionConfig, ColProps, ChunkConfig, ChunkContentCallbackArgs,
  ChunkConfigRowContent, ChunkConfigContent,
} from './scrollgrid/util.js'
export {
  hasShrinkWidth, renderMicroColGroup,
  getScrollGridClassNames, getSectionClassNames, getSectionHasLiquidHeight, getAllowYScrolling, renderChunkContent, computeShrinkWidth,
  sanitizeShrinkWidth,
  isColPropsEqual,
  renderScrollShim,
  getStickyFooterScrollbar,
  getStickyHeaderDates,
} from './scrollgrid/util.js'
export type { ScrollerProps, OverflowValue } from './scrollgrid/Scroller.js'
export { Scroller } from './scrollgrid/Scroller.js'
export { getScrollbarWidths } from './util/scrollbar-width.js'
export { RefMap } from './util/RefMap.js'
export { getIsRtlScrollbarOnLeft } from './util/scrollbar-side.js'

export { NowTimer } from './NowTimer.js'
export type { ScrollRequest } from './ScrollResponder.js'
export { ScrollResponder } from './ScrollResponder.js'
export { globalPlugins } from './global-plugins.js'
export type {
  CustomContentGenerator, DidMountHandler, WillUnmountHandler, MountArg,
} from './common/render-hook.js'
export type { StandardEventProps } from './common/StandardEvent.js'
export { StandardEvent } from './common/StandardEvent.js'
export type { NowIndicatorRootProps } from './common/NowIndicatorRoot.js'
export { NowIndicatorRoot } from './common/NowIndicatorRoot.js'

export type { DayCellRootProps, DayCellContentArg } from './common/DayCellRoot.js'
export { DayCellRoot, hasCustomDayCellContent } from './common/DayCellRoot.js'
export type {  MinimalEventProps, EventContainerProps } from './common/EventRoot.js'
export { EventContainer } from './common/EventRoot.js'
export type { BgEventProps } from './common/bg-fill.js'
export { renderFill, BgEvent } from './common/bg-fill.js'
export type { WeekNumberRootProps } from './common/WeekNumberRoot.js'
export { WeekNumberRoot } from './common/WeekNumberRoot.js'
export type { MoreLinkRootProps, MoreLinkContentArg, MoreLinkMountArg } from './common/MoreLinkRoot.js'
export { MoreLinkRoot, computeEarliestSegStart } from './common/MoreLinkRoot.js'

export type { ViewRootProps } from './common/ViewRoot.js'
export { ViewRoot } from './common/ViewRoot.js'
export type { DatePointTransform, DateSpanTransform, DateSelectionApi } from './calendar-utils.js'
export { triggerDateSelect, getDefaultEventEnd } from './calendar-utils.js'

export { injectStyles } from './styleUtils.js'

export type { ContentInjectorProps, ElProps } from './content-inject/ContentInjector.js'
export { ContentInjector } from './content-inject/ContentInjector.js'
export type { ContentContainerProps, InnerContainerFunc } from './content-inject/ContentContainer.js'
export { ContentContainer } from './content-inject/ContentContainer.js'
