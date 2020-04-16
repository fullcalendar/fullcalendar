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

export { mapHash, filterHash, isPropsEqual, compareObjs, buildHashFromArray, collectFromHash, getUnequalProps } from './util/object'

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
export { Splitter, SplittableProps } from './component/event-splitting'
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

export { EmitterMixin } from './common/EmitterMixin'
export { DateRange, rangeContainsMarker, intersectRanges, rangesEqual, rangesIntersect, rangeContainsRange } from './datelib/date-range'
export { PositionCache } from './common/PositionCache'
export { ScrollController, ElementScrollController, WindowScrollController } from './common/scroll-controller'
export { Theme } from './theme/Theme'
export { ComponentContext, ComponentContextType } from './component/ComponentContext'
export { DateComponent, Seg, EventSegUiInteractionState } from './component/DateComponent'
export { Calendar, DatePointTransform, DateSpanTransform, DateSelectionApi } from './Calendar'
export { ViewProps, sliceEvents } from './View'
export { ViewApi } from './ViewApi'

export { DateProfileGenerator, DateProfile } from './DateProfileGenerator'
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
export { ElementDragging } from './interactions/ElementDragging'

export { formatDate, formatRange } from './formatting-api'

export { globalDefaults, config } from './options'

export { RecurringType, ParsedRecurring } from './structs/recurring-event'

export { DragMetaInput, DragMeta, parseDragMeta } from './structs/drag-meta'

export { createPlugin, PluginDef, PluginDefInput, ViewPropsTransformer, ViewContainerAppend } from './plugin-system'
export { reducerFunc, Action, CalendarState } from './reducers/types'
export { CalendarComponentProps } from './CalendarComponent'

export { DayHeader } from './common/DayHeader'
export { computeFallbackHeaderFormat } from './common/table-utils'
export { TableDateCell, TableDowCell, DateHeaderCellHookProps } from './common/TableDateCell'

export { DaySeriesModel } from './common/DaySeriesModel'

export { EventInteractionState } from './interactions/event-interaction-state'
export {
  EventRenderRange, sliceEventStore, hasBgRendering, setElSeg, getElSeg,
  computeSegDraggable, computeSegStartResizable, computeSegEndResizable,
  getEventClassNames, buildSegTimeText,
  buildSegCompareObj, sortEventSegs,
  getSegMeta, EventMeta
} from './component/event-rendering'

export { DayTableModel, DayTableSeg, DayTableCell } from './common/DayTableModel'

export { Slicer, SlicedProps } from './common/slicing-utils'

export { EventMutation, applyMutationToEventStore } from './structs/event-mutation'
export { Constraint, ConstraintInput, AllowFunc, isPropsValid, isInteractionValid } from './validation'
export { EventApi } from './api/EventApi'

export { requestJson } from './util/requestJson'

export * from './vdom'
export { BaseComponent, setRef } from './vdom-util'
export { DelayedRunner } from './util/runner'

export { ScrollGridProps, ScrollGridSectionConfig, ColGroupConfig, ScrollGridImpl } from './scrollgrid/ScrollGridImpl'
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
  getStickyHeaderDates
} from './scrollgrid/util'
export { Scroller, ScrollerProps, OverflowValue } from './scrollgrid/Scroller'
export { getScrollbarWidths } from './util/scrollbar-width'
export { RefMap } from './util/RefMap'
export { getIsRtlScrollbarOnLeft } from './util/scrollbar-side'

export { NowTimer } from './NowTimer'
export { ScrollResponder, ScrollRequest } from './ScrollResponder'
export { globalPlugins } from './global-plugins'
export { RenderHook, RenderHookProps, RenderHookPropsChildren, MountHook, MountHookProps, buildHookClassNameGenerator, ContentHook } from './common/render-hook'
export { StandardEvent, StandardEventProps } from './common/StandardEvent'
export { NowIndicatorRoot, NowIndicatorRootProps } from './common/NowIndicatorRoot'

export { DayCellRoot, DayCellRootProps, DayCellContent, DayCellContentProps, DayCellHookProps } from './common/DayCellRoot'
export { EventRoot, MinimalEventProps } from './common/EventRoot'
export { renderFill, BgEvent, BgEventProps } from './common/bg-fill'
export { WeekNumberRoot, WeekNumberRootProps } from './common/WeekNumberRoot'

export { ViewRoot, ViewRootProps } from './common/ViewRoot'
