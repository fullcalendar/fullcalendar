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
export { formatDate, formatRange, FormatDateOptions, FormatRangeOptions } from './formatting-api.js'
export { ViewApi } from './ViewApi.js'
export * from './api-type-deps.js'

export { // things for plugins. everything else is exported in api-type-deps
  BASE_OPTION_DEFAULTS, BASE_OPTION_REFINERS, identity, Identity, Dictionary, refineProps,
  BaseOptionRefiners, BaseOptionsRefined, CalendarOptionRefiners, CalendarOptionsRefined,
  ViewOptionRefiners, ViewOptionsRefined, RawOptionsFromRefiners, RefinedOptionsFromRefiners,
  CalendarListenerRefiners,
} from './options.js'

export { EventDef, EventDefHash } from './structs/event-def.js'
export { EventInstance, EventInstanceHash, createEventInstance } from './structs/event-instance.js'
export { EventInput, EventRefined, parseEventDef, EventTuple, EventRefiners, refineEventDef } from './structs/event-parse.js'
export { BusinessHoursInput, parseBusinessHours } from './structs/business-hours.js'

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

export { memoize, memoizeObjArg, memoizeArraylike, memoizeHashlike, MemoizeHashFunc, MemoiseArrayFunc } from './util/memoize.js'

export {
  intersectRects,
  Rect, pointInsideRect,
  constrainPoint,
  getRectCenter, diffPoints, Point,
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

export {
  EventStore,
  filterEventStoreDefs,
  createEmptyEventStore,
  mergeEventStores,
  getRelevantEvents,
  eventTupleToStore,
} from './structs/event-store.js'
export { EventUiHash, EventUi, combineEventUis, createEventUi } from './component/event-ui.js'
export { Splitter, SplittableProps } from './component/event-splitting.js'
export { getDayClassNames, getDateMeta, DateMeta, getSlotClassNames } from './component/date-rendering.js'
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
export { DateRange, rangeContainsMarker, intersectRanges, rangesEqual, rangesIntersect, rangeContainsRange } from './datelib/date-range.js'
export { PositionCache } from './common/PositionCache.js'
export { ScrollController, ElementScrollController, WindowScrollController } from './common/scroll-controller.js'
export { Theme } from './theme/Theme.js'
export { ViewContext, ViewContextType } from './ViewContext.js'
export { DateComponent, Seg, EventSegUiInteractionState } from './component/DateComponent.js'
export { CalendarData } from './reducers/data-types.js'
export { CalendarDataManager } from './reducers/CalendarDataManager.js'
export { CalendarDataProvider, CalendarDataProviderProps } from './component/CalendarDataProvider.js'
export { ViewProps, sliceEvents } from './View.js'

export { DateProfileGenerator, DateProfile } from './DateProfileGenerator.js'
export { ViewDef } from './structs/view-def.js'
export { ViewSpec } from './structs/view-spec.js'
export { DateSpan, DateSpanApi, DatePointApi, isDateSpansEqual } from './structs/date-span.js'

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
} from './datelib/marker.js'
export {
  Duration, createDuration,
  asCleanDays, multiplyDuration, addDurations,
  asRoughMinutes, asRoughSeconds, asRoughMs,
  wholeDivideDurations, greatestDurationDenominator,
} from './datelib/duration.js'
export { DateEnv, DateMarkerMeta } from './datelib/env.js'

export {
  createFormatter,
  FormatterInput,
} from './datelib/formatting.js'
export {
  DateFormatter,
  VerboseFormattingArg,
} from './datelib/DateFormatter.js'
export {
  formatIsoTimeString,
  formatDayString,
  buildIsoString,
} from './datelib/formatting-utils.js'
export { NamedTimeZoneImpl } from './datelib/timezone.js'
export { parse as parseMarker } from './datelib/parsing.js'
export { LocaleInput } from './datelib/locale.js'

export { EventSourceDef } from './structs/event-source-def.js'
export { EventSource, EventSourceHash } from './structs/event-source.js'
export { EventSourceRefiners, EventSourceRefined } from './structs/event-source-parse.js'

export {
  SegSpan, SegRect, SegHierarchy, SegEntry, SegInsertion, buildEntryKey,
  getEntrySpanEnd, binarySearch, SegEntryGroup, groupIntersectingEntries,
  joinSpans, intersectSpans,
} from './seg-hierarchy.js'

export {
  Interaction,
  InteractionSettings,
  interactionSettingsToStore,
  interactionSettingsStore,
  InteractionSettingsStore,
} from './interactions/interaction.js'
export { PointerDragEvent } from './interactions/pointer.js'
export { Hit } from './interactions/hit.js'
export { dateSelectionJoinTransformer } from './interactions/date-selecting.js'
export { eventDragMutationMassager, EventDropTransformers } from './interactions/event-dragging.js'
export { ElementDragging } from './interactions/ElementDragging.js'

export { config } from './global-config.js'
export { globalLocales } from './global-locales.js'

export { RecurringType, ParsedRecurring } from './structs/recurring-event.js'

export { DragMetaInput, DragMeta, parseDragMeta } from './structs/drag-meta.js'

export { PluginDef, PluginDefInput, ViewPropsTransformer, ViewContainerAppend } from './plugin-system-struct.js'
export { createPlugin } from './plugin-system.js'
export { Action } from './reducers/Action.js'
export { CalendarContext } from './CalendarContext.js'
export { CalendarContentProps, CalendarContent } from './CalendarContent.js'
export { CalendarRoot } from './CalendarRoot.js'

export { DayHeader } from './common/DayHeader.js'
export { computeFallbackHeaderFormat } from './common/table-utils.js'
export { TableDateCell } from './common/TableDateCell.js'
export { TableDowCell } from './common/TableDowCell.js'

export { DaySeriesModel } from './common/DaySeriesModel.js'

export { EventInteractionState } from './interactions/event-interaction-state.js'
export {
  EventRenderRange, sliceEventStore, hasBgRendering, setElSeg, getElSeg,
  computeSegDraggable, computeSegStartResizable, computeSegEndResizable,
  getEventClassNames, buildSegTimeText,
  buildSegCompareObj, sortEventSegs,
  getSegMeta, EventContentArg, buildEventRangeKey,
  getSegAnchorAttrs,
} from './component/event-rendering.js'

export { DayTableModel, DayTableSeg, DayTableCell } from './common/DayTableModel.js'

export { Slicer, SlicedProps } from './common/slicing-utils.js'

export { EventMutation, applyMutationToEventStore } from './structs/event-mutation.js'
export { Constraint, ConstraintInput, AllowFunc } from './structs/constraint.js'
export { isPropsValid, isInteractionValid, isDateSelectionValid } from './validation.js'

export { requestJson } from './util/requestJson.js'

export { BaseComponent, setRef } from './vdom-util.js'
export { DelayedRunner } from './util/DelayedRunner.js'

export {
  ScrollGridProps,
  ScrollGridSectionConfig,
  ColGroupConfig,
  ScrollGridImpl,
  ScrollGridChunkConfig,
} from './scrollgrid/ScrollGridImpl.js'
export { SimpleScrollGrid, SimpleScrollGridSection } from './scrollgrid/SimpleScrollGrid.js'
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
} from './scrollgrid/util.js'
export { Scroller, ScrollerProps, OverflowValue } from './scrollgrid/Scroller.js'
export { getScrollbarWidths } from './util/scrollbar-width.js'
export { RefMap } from './util/RefMap.js'
export { getIsRtlScrollbarOnLeft } from './util/scrollbar-side.js'

export { NowTimer } from './NowTimer.js'
export { ScrollResponder, ScrollRequest } from './ScrollResponder.js'
export { globalPlugins } from './global-plugins.js'
export {
  RenderHook, RenderHookProps, RenderHookPropsChildren, MountHook, MountHookProps, buildClassNameNormalizer, ContentHook,
  CustomContentRenderContext, ClassNamesGenerator, CustomContentGenerator, DidMountHandler, WillUnmountHandler, MountArg,
} from './common/render-hook.js'
export { StandardEvent, StandardEventProps } from './common/StandardEvent.js'
export { NowIndicatorRoot, NowIndicatorRootProps } from './common/NowIndicatorRoot.js'

export { DayCellRoot, DayCellRootProps, DayCellContentArg } from './common/DayCellRoot.js'
export { DayCellContent, DayCellContentProps } from './common/DayCellContent.js'
export { EventRoot, MinimalEventProps } from './common/EventRoot.js'
export { renderFill, BgEvent, BgEventProps } from './common/bg-fill.js'
export { WeekNumberRoot, WeekNumberRootProps } from './common/WeekNumberRoot.js'
export { MoreLinkRoot, MoreLinkRootProps, MoreLinkContentArg, MoreLinkMountArg, computeEarliestSegStart } from './common/MoreLinkRoot.js'

export { ViewRoot, ViewRootProps } from './common/ViewRoot.js'
export { triggerDateSelect, DatePointTransform, DateSpanTransform, DateSelectionApi, getDefaultEventEnd } from './calendar-utils.js'

export { injectStyles } from './styleUtils.js'
