
// exports
// --------------------------------------------------------------------------------------------------

export const version = '<%= version %>'

// types
export {
  OptionsInput, ButtonIconsInput, ButtonTextCompoundInput, CellInfo, CustomButtonInput,
  DropInfo, EventHandlerArg, EventHandlerArgs, EventHandlerName, EventSegment,
  OptionsInputBase, ToolbarInput, ViewOptionsInput
} from './types/input-types'
export {
  EventInput, EventDef, EventDefHash, EventInstance, EventInstanceHash,
  parseEventDef, createEventInstance, EventTuple, EventDateInput, EventNonDateInput,
  EventRenderingChoice, eventDefParserFunc, parseEvent, DATE_PROPS, NON_DATE_PROPS
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
  diffDates,
  computeAlignedDayRange,
  firstDefined,
  GenericHash
} from './util/misc'

export {
  htmlEscape,
  cssToStr,
  ClassNameInput,
  attrsToStr,
  parseClassName
} from './util/html'

export {
  removeExact,
  isArraysEqual,
  removeMatching
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

export { mapHash, filterHash, isPropsEqual, arrayToHash, hashValuesToArray, mergeProps } from './util/object'

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
  forceClassName,
  ElementContent,
  htmlToElements
} from './util/dom-manip'

export {
  EventStore, filterEventStoreDefs, createEmptyEventStore, mergeEventStores, getRelevantEvents,
  eventTupleToStore, expandRecurring, parseEvents, transformRawEvents
} from './structs/event-store'
export { default as executeEventSourceAction } from './reducers/eventSources'
export { default as executeEventStoreAction, excludeInstances } from './reducers/eventStore'
export { EventUiHash, EventUi, processScopedUiProps, combineEventUis, processUnscopedUiProps, UnscopedEventUiInput, UNSCOPED_EVENT_UI_PROPS } from './component/event-ui'
export { default as Splitter, SplittableProps } from './component/event-splitting'
export { buildGotoAnchorHtml, getAllDayHtml, getDayClasses } from './component/date-rendering'

export {
  preventDefault,
  listenBySelector,
  whenTransitionDone,
  listenToHoverBySelector
} from './util/dom-event'

export {
  computeInnerRect,
  computeEdges,
  computeHeightAndMargins,
  getClippingParents,
  computeClippingRect,
  computeRect,
  computeVMargins,
  EdgeInfo
} from './util/dom-geom'

export { unpromisify } from './util/promise'

export { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
export {
  DateRange, rangeContainsMarker, intersectRanges, rangesEqual, rangesIntersect, rangeContainsRange,
  DateRangeInput, OpenDateRange, constrainMarkerToRange, invertRanges, parseRange
} from './datelib/date-range'
export { default as Mixin } from './common/Mixin'
export { default as PositionCache } from './common/PositionCache'
export { default as ScrollComponent, ScrollbarWidths } from './common/ScrollComponent'
export { ScrollController, ElementScrollController, WindowScrollController } from './common/scroll-controller'
export { default as Theme, ThemeClass } from './theme/Theme'
export { default as StandardTheme } from './theme/StandardTheme'
export { default as Component, ComponentContext, EqualityFuncHash } from './component/Component'
export { default as DateComponent, Seg, EventSegUiInteractionState, DateComponentHash } from './component/DateComponent'
export {
  default as Calendar, DatePointTransform, DateSpanTransform, DateSelectionApi, CalendarInteraction, CalendarInteractionClass,
  DateClickApi, OptionChangeHandler, OptionChangeHandlerMap
} from './Calendar'
export { default as View, ViewProps } from './View'
export { default as FgEventRenderer, buildSegCompareObj } from './component/renderers/FgEventRenderer'
export { default as FillRenderer } from './component/renderers/FillRenderer'

export { default as DateProfileGenerator, DateProfile, isDateProfilesEqual } from './DateProfileGenerator'
export { ViewDef, ViewDefHash, compileViewDefs } from './structs/view-def'
export { ViewSpec, ViewSpecHash, buildViewSpecs } from './structs/view-spec'
export {
  ViewClass, ViewConfig, ViewConfigHash, ViewConfigInput,
  ViewConfigInputHash, ViewConfigObjectInput, parseViewConfigs
} from './structs/view-config'
export {
  DateSpan, DateSpanApi, DatePointApi, isDateSpansEqual, DateSpanInput, OpenDateSpan, OpenDateSpanInput, buildDatePointApi,
  buildDateSpanApi, fabricateEventRange, parseDateSpan, parseOpenDateSpan
} from './structs/date-span'

export {
  DateMarker, addDays, startOfDay, addMs, addWeeks, diffWeeks, diffWholeWeeks, diffWholeDays, diffDayAndTime, diffDays,
  isValidDate, DAY_IDS, arrayToLocalDate, arrayToUtcDate, dateToLocalArray, dateToUtcArray,diffHours, diffMinutes, diffSeconds,
  startOfHour, startOfMinute, startOfSecond, timeAsMs, weekOfYear
} from './datelib/marker'
export {
  Duration, createDuration,
  isSingleDay, multiplyDuration, addDurations,
  asRoughMinutes, asRoughSeconds, asRoughMs,
  wholeDivideDurations, greatestDurationDenominator,
  DurationInput, DurationObjectInput, asRoughDays,
  asRoughHours, asRoughMonths, asRoughYears, durationsEqual,
  getWeeksFromInput, subtractDurations
} from './datelib/duration'
export { DateEnv, DateMarkerMeta, DateEnvSettings, DateInput } from './datelib/env'

export {
  DateFormatter,
  createFormatter,
  VerboseFormattingArg,
  formatIsoTimeString,
  DateFormattingContext,
  ExpandedZonedMarker,
  FormatterInput,
  ZonedMarker,
  buildIsoString,
  createVerboseFormattingArg,
  formatTimeZoneOffset
} from './datelib/formatting'
export { CmdFormatter, CmdFormatterFunc } from './datelib/formatting-cmd'
export { FuncFormatter, FuncFormatterFunc } from './datelib/formatting-func'
export { NativeFormatter } from './datelib/formatting-native'
export {
  Locale, LocaleCodeArg, RawLocaleMap, RawLocaleInfo, RawLocale,
  LocaleSingularArg, buildLocale, parseRawLocales
} from './datelib/locale'
export { CalendarSystem, createCalendarSystem, registerCalendarSystem } from './datelib/calendar-system'
export { NamedTimeZoneImpl, NamedTimeZoneImplClass } from './datelib/timezone'
export { parse as parseMarker } from './datelib/parsing'

export {
  EventSourceDef, EventSource, EventSourceHash, EventInputTransformer, EventSourceError, EventSourceErrorResponseHandler,
  EventSourceFetcher, EventSourceInput, EventSourceSuccessResponseHandler, ExtendedEventSourceInput, doesSourceNeedRange,
  parseEventSource
} from './structs/event-source'
export { EventSourceFunc } from './event-sources/func-event-source'


export {
  Interaction, InteractionSettings, interactionSettingsToStore, interactionSettingsStore, InteractionSettingsStore,
  InteractionClass, InteractionSettingsInput, parseInteractionSettings
} from './interactions/interaction'
export { PointerDragEvent } from './interactions/pointer'
export { Hit } from './interactions/hit'
export { dateSelectionJoinTransformer } from './interactions/date-selecting'
export { eventDragMutationMassager, EventDropTransformers, eventIsDraggableTransformer } from './interactions/event-dragging'
export { EventResizeJoinTransforms } from './interactions/event-resizing'
export { default as ElementDragging, ElementDraggingClass } from './interactions/ElementDragging'
export { default as EventClicking } from './interactions/EventClicking'
export { ExternalDefTransform } from './interactions/external-element-dragging'
export { default as EventHovering } from './interactions/EventHovering'

export { formatDate, formatRange } from './formatting-api'

export { globalDefaults, config, mergeOptions, refinePluginDefs, rtlDefaults } from './options'

export { RecurringType, ParsedRecurring, expandRecurringRanges, parseRecurring } from './structs/recurring-event'

export { DragMetaInput, DragMeta, parseDragMeta } from './structs/drag-meta'

export {
  createPlugin, PluginDef, PluginDefInput, ViewPropsTransformer, ViewContainerModifier, PluginHooks,
  PluginSystem, ViewPropsTransformerClass
} from './plugin-system'
export { reducerFunc, Action, CalendarState } from './reducers/types'
export { CalendarComponentProps } from './CalendarComponent'

export { default as DayHeader, DayTableHeaderProps } from './common/DayHeader'
export { computeFallbackHeaderFormat, renderDateCell } from './common/table-utils'

export { default as DaySeries, DaySeriesSeg } from './common/DaySeries'

export { EventInteractionState } from './interactions/event-interaction-state'
export {
  EventRenderRange, sliceEventStore, hasBgRendering, getElSeg, computeEventDraggable, computeEventStartResizable,
  computeEventEndResizable, compileEventUi, compileEventUis, filterSegsViaEls, triggerRenderedSegs, triggerWillRemoveSegs
} from './component/event-rendering'

export { default as DayTable, DayTableSeg, DayTableCell } from './common/DayTable'

export { default as Slicer, SlicedProps, SliceableProps } from './common/slicing-utils'

export { EventMutation, applyMutationToEventStore, eventDefMutationApplier } from './structs/event-mutation'
export {
  Constraint, ConstraintInput, AllowFunc, isPropsValid, isInteractionValid, OverlapFunc,
  isDateSelectionValid, isPropsValidTester, normalizeConstraint
} from './validation'
export { default as EventApi } from './api/EventApi'
export { default as EventSourceApi } from './api/EventSourceApi'

export { default as requestJson } from './util/requestJson'
export { getIsRtlScrollbarOnLeft, sanitizeScrollbarWidth } from './util/scrollbars'
