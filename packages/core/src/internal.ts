import './index.css'

export {
  Identity, Dictionary,
  BaseOptionRefiners, BaseOptionsRefined,
  ViewOptionsRefined, RawOptionsFromRefiners, RefinedOptionsFromRefiners,
  CalendarListenerRefiners,
  BASE_OPTION_DEFAULTS, identity, refineProps,
} from './options.js'

export type { EventDef, EventDefHash } from './structs/event-def.js'
export type { EventInstance, EventInstanceHash } from './structs/event-instance.js'
export { createEventInstance } from './structs/event-instance.js'
export type { EventRefined, EventTuple, EventRefiners } from './structs/event-parse.js'
export { parseEventDef, refineEventDef } from './structs/event-parse.js'
export { parseBusinessHours } from './structs/business-hours.js'

export type { OrderSpec } from './util/misc.js'
export {
  padStart,
  isInt,
  parseFieldSpecs,
  compareByFieldSpecs,
  flexibleCompare,
  preventSelection, allowSelection, preventContextMenu, allowContextMenu,
  compareNumbers, enableCursor, disableCursor,
  guid,
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

export { mapHash, filterHash, isPropsEqual, compareObjs, collectFromHash } from './util/object.js'

export {
  findElements,
  findDirectChildren,
  removeElement,
  applyStyle,
  elementMatches,
  elementClosest,
  getEventTargetViaRoot,
  getUniqueDomId,
} from './util/dom-manip.js'
export { parseClassNames } from './util/html.js'

export { getCanVGrowWithinCell } from './util/table-styling.js'

export type { EventStore } from './structs/event-store.js'
export {
  createEmptyEventStore,
  mergeEventStores,
  getRelevantEvents,
  eventTupleToStore,
} from './structs/event-store.js'
export type { EventUiHash, EventUi } from './component/event-ui.js'
export { combineEventUis, createEventUi } from './component/event-ui.js'
export type { SplittableProps } from './component/event-splitting.js'
export { Splitter } from './component/event-splitting.js'
export { getDayClassNames, getDateMeta, getSlotClassNames } from './component/date-rendering.js'
export { buildNavLinkAttrs } from './common/nav-link.js'

export {
  preventDefault,
  whenTransitionDone,
} from './util/dom-event.js'

export {
  computeInnerRect,
  computeEdges,
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
export type { ViewProps } from './View.js'

export type { DateProfile } from './DateProfileGenerator.js'
export { DateProfileGenerator } from './DateProfileGenerator.js'
export type { ViewSpec } from './structs/view-spec.js'
export type { DateSpan } from './structs/date-span.js'
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
export {
  createDuration,
  asCleanDays, multiplyDuration, addDurations,
  asRoughMinutes, asRoughSeconds, asRoughMs,
  wholeDivideDurations, greatestDurationDenominator,
} from './datelib/duration.js'
export { DateEnv } from './datelib/env.js'

export { createFormatter } from './datelib/formatting.js'
export type { DateFormatter, VerboseFormattingArg } from './datelib/DateFormatter.js'
export {
  formatIsoTimeString,
  formatDayString,
  buildIsoString,
  formatIsoMonthStr,
} from './datelib/formatting-utils.js'
export { NamedTimeZoneImpl } from './datelib/timezone.js'
export { parse as parseMarker } from './datelib/parsing.js'

export type { EventSourceDef } from './structs/event-source-def.js'
export type { EventSourceRefined } from './structs/event-source-parse.js'
export { EventSourceRefiners } from './structs/event-source-parse.js'

export type { SegSpan, SegRect, SegEntry, SegInsertion, SegEntryGroup } from './seg-hierarchy.js'
export {
  SegHierarchy, buildEntryKey, getEntrySpanEnd, binarySearch, groupIntersectingEntries,
  intersectSpans,
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

export type { RecurringType } from './structs/recurring-event.js'

export type { DragMetaInput, DragMeta } from './structs/drag-meta.js'
export { parseDragMeta } from './structs/drag-meta.js'

export type { ViewPropsTransformer, PluginDef } from './plugin-system-struct.js'
export type { Action } from './reducers/Action.js'
export type { CalendarContext } from './CalendarContext.js'
export type { CalendarContentProps } from './CalendarContent.js'
export { CalendarRoot } from './CalendarRoot.js'

export { DayHeader } from './common/DayHeader.js'
export { computeFallbackHeaderFormat } from './common/table-utils.js'
export { TableDateCell } from './common/TableDateCell.js'
export { TableDowCell } from './common/TableDowCell.js'

export { DaySeriesModel } from './common/DaySeriesModel.js'

export type { EventInteractionState } from './interactions/event-interaction-state.js'
export {
  sliceEventStore, hasBgRendering, getElSeg,
  buildSegTimeText,
  sortEventSegs,
  getSegMeta, buildEventRangeKey,
  getSegAnchorAttrs,
} from './component/event-rendering.js'

export type { DayTableCell } from './common/DayTableModel.js'
export { DayTableModel } from './common/DayTableModel.js'

export type { SlicedProps } from './common/slicing-utils.js'
export { Slicer } from './common/slicing-utils.js'

export type { EventMutation } from './structs/event-mutation.js'
export { applyMutationToEventStore } from './structs/event-mutation.js'
export type { Constraint } from './structs/constraint.js'
export { isPropsValid, isInteractionValid, isDateSelectionValid } from './validation.js'

export { requestJson } from './util/requestJson.js'

export { BaseComponent, setRef } from './vdom-util.js'
export { DelayedRunner } from './util/DelayedRunner.js'

export type {
  ScrollGridProps,
  ScrollGridSectionConfig,
  ColGroupConfig,
  ScrollGridChunkConfig,
} from './scrollgrid/ScrollGridImpl.js'
export type { SimpleScrollGridSection } from './scrollgrid/SimpleScrollGrid.js'
export { SimpleScrollGrid } from './scrollgrid/SimpleScrollGrid.js'
export type {
  ScrollerLike, ColProps, ChunkContentCallbackArgs,
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
export type {  OverflowValue } from './scrollgrid/Scroller.js'
export { Scroller } from './scrollgrid/Scroller.js'
export { getScrollbarWidths } from './util/scrollbar-width.js'
export { RefMap } from './util/RefMap.js'
export { getIsRtlScrollbarOnLeft } from './util/scrollbar-side.js'

export { NowTimer } from './NowTimer.js'
export type { ScrollRequest } from './ScrollResponder.js'
export { ScrollResponder } from './ScrollResponder.js'
export type {
  CustomContentGenerator, DidMountHandler, WillUnmountHandler, MountArg,
} from './common/render-hook.js'
export { StandardEvent } from './common/StandardEvent.js'
export { NowIndicatorContainer } from './common/NowIndicatorContainer.js'

export { DayCellContainer, hasCustomDayCellContent } from './common/DayCellContainer.js'
export type { MinimalEventProps } from './common/EventContainer.js'
export { EventContainer } from './common/EventContainer.js'
export { renderFill, BgEvent } from './common/bg-fill.js'
export { WeekNumberContainerProps, WeekNumberContainer } from './common/WeekNumberContainer.js'
export { MoreLinkContainer, computeEarliestSegStart } from './common/MoreLinkContainer.js'

export type { ViewContainerProps } from './common/ViewContainer.js'
export { ViewContainer } from './common/ViewContainer.js'
export type { DatePointTransform, DateSpanTransform } from './calendar-utils.js'
export { triggerDateSelect, getDefaultEventEnd } from './calendar-utils.js'

export { injectStyles } from './styleUtils.js'

export { CalendarImpl } from './api/CalendarImpl.js'
export { EventImpl, buildEventApis } from './api/EventImpl.js'

export type { ElProps } from './content-inject/ContentInjector.js'
export { buildElAttrs } from './content-inject/ContentInjector.js'
export type { InnerContainerFunc } from './content-inject/ContentContainer.js'
export { ContentContainer } from './content-inject/ContentContainer.js'
export type { CustomRendering } from './content-inject/CustomRenderingStore.js'
export { CustomRenderingStore } from './content-inject/CustomRenderingStore.js'
