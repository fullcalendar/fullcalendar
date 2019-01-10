
export const version = '<%= version %>'

// When introducing internal API incompatibilities (where fullcalendar plugins would break),
// the minor version of the calendar should be upped (ex: 2.7.2 -> 2.8.0)
// and the below integer should be incremented.
export const internalApiVersion = 12

export {
  BusinessHoursInput,
  EventOptionsBase,
  OptionsInput,
  OptionsInputBase,
  RangeInput,
  ToolbarInput,
  ViewOptionsInput,
  ButtonIconsInput,
  ButtonTextCompoundInput,
  CellInfo,
  EventObjectInput
} from './types/input-types'

export {
  applyAll,
  debounce,
  isInt,
  htmlEscape,
  cssToStr,
  proxy,
  capitaliseFirstLetter,
  getOuterRect,
  getClientRect,
  getContentRect,
  getScrollbarWidths,
  preventDefault,
  parseFieldSpecs,
  compareByFieldSpecs,
  compareByFieldSpec,
  flexibleCompare,
  computeGreatestUnit,
  divideRangeByDuration,
  divideDurationByDuration,
  multiplyDuration,
  durationHasTime,
  log,
  warn,
  removeExact,
  intersectRects,
  allowSelection,
  attrsToStr,
  compareNumbers,
  compensateScroll,
  computeDurationGreatestUnit,
  constrainPoint,
  copyOwnProps,
  diffByUnit,
  diffDay,
  diffDayTime,
  diffPoints,
  disableCursor,
  distributeHeight,
  enableCursor,
  firstDefined,
  getEvIsTouch,
  getEvX,
  getEvY,
  getRectCenter,
  getScrollParent,
  hasOwnProp,
  isArraysEqual,
  isNativeDate,
  isPrimaryMouseButton,
  isTimeString,
  matchCellWidths,
  mergeProps,
  preventSelection,
  removeMatching,
  stripHtmlEntities,
  subtractInnerElHeight,
  uncompensateScroll,
  undistributeHeight,
  dayIDs,
  unitsDesc
} from './util'

export {
  formatDate,
  formatRange,
  queryMostGranularFormatUnit
} from './date-formatting'

export {
  datepickerLocale,
  locale,
  getMomentLocaleData,
  populateInstanceComputableOptions
} from './locale'

export {
  eventDefsToEventInstances,
  eventFootprintToComponentFootprint,
  eventInstanceToEventRange,
  eventInstanceToUnzonedRange,
  eventRangeToEventFootprint
} from './models/event/util'

export { default as moment } from './moment-ext'
export { default as EmitterMixin, EmitterInterface } from './common/EmitterMixin'
export { default as ListenerMixin, ListenerInterface } from './common/ListenerMixin'
export { default as Model } from './common/Model'
export { default as Constraints } from './Constraints'
export { default as DateProfileGenerator } from './DateProfileGenerator'
export { default as UnzonedRange } from './models/UnzonedRange'
export { default as ComponentFootprint } from './models/ComponentFootprint'
export { default as BusinessHourGenerator } from './models/BusinessHourGenerator'
export { default as EventPeriod } from './models/EventPeriod'
export { default as EventManager } from './models/EventManager'
export { default as EventDef } from './models/event/EventDef'
export { default as EventDefMutation } from './models/event/EventDefMutation'
export { default as EventDefParser } from './models/event/EventDefParser'
export { default as EventInstance } from './models/event/EventInstance'
export { default as EventRange } from './models/event/EventRange'
export { default as RecurringEventDef } from './models/event/RecurringEventDef'
export { default as SingleEventDef } from './models/event/SingleEventDef'
export { default as EventDefDateMutation } from './models/event/EventDefDateMutation'
export { default as EventDateProfile } from './models/event/EventDateProfile'
export { default as EventSourceParser } from './models/event-source/EventSourceParser'
export { default as EventSource } from './models/event-source/EventSource'
export { defineThemeSystem, getThemeSystemClass } from './theme/ThemeRegistry'
export { default as EventInstanceGroup } from './models/event/EventInstanceGroup'
export { default as ArrayEventSource } from './models/event-source/ArrayEventSource'
export { default as FuncEventSource } from './models/event-source/FuncEventSource'
export { default as JsonFeedEventSource } from './models/event-source/JsonFeedEventSource'
export { default as EventFootprint } from './models/event/EventFootprint'
export { default as Class } from './common/Class'
export { default as Mixin } from './common/Mixin'
export { default as CoordCache } from './common/CoordCache'
export { default as Iterator } from './common/Iterator'
export { default as DragListener } from './common/DragListener'
export { default as HitDragListener } from './common/HitDragListener'
export { default as MouseFollower } from './common/MouseFollower'
export { default as ParsableModelMixin, ParsableModelInterface } from './common/ParsableModelMixin'
export { default as Popover } from './common/Popover'
export { default as Promise } from './common/Promise'
export { default as TaskQueue } from './common/TaskQueue'
export { default as RenderQueue } from './common/RenderQueue'
export { default as Scroller } from './common/Scroller'
export { default as Theme } from './theme/Theme'
export { default as Component } from './component/Component'
export { default as DateComponent } from './component/DateComponent'
export { default as InteractiveDateComponent } from './component/InteractiveDateComponent'
export { default as Calendar } from './Calendar'
export { default as View } from './View'
export { defineView, getViewConfig } from './ViewRegistry'
export { default as DayTableMixin } from './component/DayTableMixin'
export { default as BusinessHourRenderer } from './component/renderers/BusinessHourRenderer'
export { default as EventRenderer } from './component/renderers/EventRenderer'
export { default as FillRenderer } from './component/renderers/FillRenderer'
export { default as HelperRenderer } from './component/renderers/HelperRenderer'
export { default as ExternalDropping } from './component/interactions/ExternalDropping'
export { default as EventResizing } from './component/interactions/EventResizing'
export { default as EventPointing } from './component/interactions/EventPointing'
export { default as EventDragging } from './component/interactions/EventDragging'
export { default as DateSelecting } from './component/interactions/DateSelecting'
export { default as DateClicking } from './component/interactions/DateClicking'
export { default as Interaction } from './component/interactions/Interaction'
export { default as StandardInteractionsMixin } from './component/interactions/StandardInteractionsMixin'
export { default as AgendaView } from './agenda/AgendaView'
export { default as TimeGrid } from './agenda/TimeGrid'
export { default as TimeGridEventRenderer } from './agenda/TimeGridEventRenderer'
export { default as TimeGridFillRenderer } from './agenda/TimeGridFillRenderer'
export { default as TimeGridHelperRenderer } from './agenda/TimeGridHelperRenderer'
export { default as DayGrid } from './basic/DayGrid'
export { default as DayGridEventRenderer } from './basic/DayGridEventRenderer'
export { default as DayGridFillRenderer } from './basic/DayGridFillRenderer'
export { default as DayGridHelperRenderer } from './basic/DayGridHelperRenderer'
export { default as BasicView } from './basic/BasicView'
export { default as BasicViewDateProfileGenerator } from './basic/BasicViewDateProfileGenerator'
export { default as MonthView } from './basic/MonthView'
export { default as MonthViewDateProfileGenerator } from './basic/MonthViewDateProfileGenerator'
export { default as ListView } from './list/ListView'
export { default as ListEventPointing } from './list/ListEventPointing'
export { default as ListEventRenderer } from './list/ListEventRenderer'
