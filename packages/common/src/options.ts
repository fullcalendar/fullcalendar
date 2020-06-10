import { createDuration } from './datelib/duration'
import { mergeProps } from './util/object'
import { createFormatter } from './datelib/formatting'
import { parseFieldSpecs } from './util/misc'
import { EventMeta } from './component/event-rendering'
import { DateProfileGeneratorClass } from './DateProfileGenerator'

// public
import {
  CssDimValue,
  DateInput,
  DateRangeInput,
  BusinessHoursInput,
  EventSourceInput,
  ViewApi,
  LocaleSingularArg, LocaleInput,
  EventInput, EventInputTransformer,
  OverlapFunc, ConstraintInput, AllowFunc,
  PluginDef,
  ViewComponentType, ViewHookProps,
  ClassNamesGenerator, CustomContentGenerator, DidMountHandler, WillUnmountHandler,
  NowIndicatorHookProps,
  WeekNumberHookProps,
  SlotLaneHookProps, SlotLabelHookProps, AllDayHookProps, DayHeaderHookProps,
  DayCellHookProps,
  ViewRootHookProps,
  EventClickArg,
  EventHoveringArg,
  DateSelectArg, DateUnselectArg,
  CalendarApi,
  VUIEvent,
  WeekNumberCalculation,
  FormatterInput,
  ToolbarInput, CustomButtonInput, ButtonIconsInput, ButtonTextCompoundInput,
  EventsWillUpdateArg
} from './api-type-deps'


// base options
// ------------

export const BASE_OPTION_REFINERS = {
  navLinkDayClick: identity as Identity<string | ((this: CalendarApi, date: Date, jsEvent: VUIEvent) => void)>,
  navLinkWeekClick: identity as Identity<string | ((this: CalendarApi, weekStart: Date, jsEvent: VUIEvent) => void)>,
  duration: createDuration,
  bootstrapFontAwesome: identity as Identity<ButtonIconsInput | false>, // TODO: move to bootstrap plugin
  buttonIcons: identity as Identity<ButtonIconsInput | false>,
  customButtons: identity as Identity<{ [name: string]: CustomButtonInput }>,
  defaultAllDayEventDuration: createDuration,
  defaultTimedEventDuration: createDuration,
  nextDayThreshold: createDuration,
  scrollTime: createDuration,
  slotMinTime: createDuration,
  slotMaxTime: createDuration,
  dayPopoverFormat: createFormatter,
  slotDuration: createDuration,
  snapDuration: createDuration,
  headerToolbar: identity as Identity<ToolbarInput | false>,
  footerToolbar: identity as Identity<ToolbarInput | false>,
  defaultRangeSeparator: String,
  titleRangeSeparator: String,
  forceEventDuration: Boolean,

  dayHeaders: Boolean,
  dayHeaderFormat: createFormatter,
  dayHeaderClassNames: identity as Identity<ClassNamesGenerator<DayHeaderHookProps>>,
  dayHeaderContent: identity as Identity<CustomContentGenerator<DayHeaderHookProps>>,
  dayHeaderDidMount: identity as Identity<DidMountHandler<DayHeaderHookProps>>,
  dayHeaderWillUnmount: identity as Identity<WillUnmountHandler<DayHeaderHookProps>>,

  dayCellClassNames: identity as Identity<ClassNamesGenerator<DayCellHookProps>>,
  dayCellContent: identity as Identity<CustomContentGenerator<DayCellHookProps>>,
  dayCellDidMount: identity as Identity<DidMountHandler<DayCellHookProps>>,
  dayCellWillUnmount: identity as Identity<WillUnmountHandler<DayCellHookProps>>,

  initialView: String,
  aspectRatio: Number,
  weekends: Boolean,

  weekNumberCalculation: identity as Identity<WeekNumberCalculation>,
  weekNumbers: Boolean,
  weekNumberClassNames: identity as Identity<ClassNamesGenerator<WeekNumberHookProps>>,
  weekNumberContent: identity as Identity<CustomContentGenerator<WeekNumberHookProps>>,
  weekNumberDidMount: identity as Identity<DidMountHandler<WeekNumberHookProps>>,
  weekNumberWillUnmount: identity as Identity<WillUnmountHandler<WeekNumberHookProps>>,

  editable: Boolean,

  viewClassNames: identity as Identity<ClassNamesGenerator<ViewRootHookProps>>,
  viewDidMount: identity as Identity<DidMountHandler<ViewRootHookProps>>,
  viewWillUnmount: identity as Identity<WillUnmountHandler<ViewRootHookProps>>,

  nowIndicator: Boolean,
  nowIndicatorClassNames: identity as Identity<ClassNamesGenerator<NowIndicatorHookProps>>,
  nowIndicatorContent: identity as Identity<CustomContentGenerator<NowIndicatorHookProps>>,
  nowIndicatorDidMount: identity as Identity<DidMountHandler<NowIndicatorHookProps>>,
  nowIndicatorWillUnmount: identity as Identity<WillUnmountHandler<NowIndicatorHookProps>>,

  showNonCurrentDates: Boolean,
  lazyFetching: Boolean,
  startParam: String,
  endParam: String,
  timeZoneParam: String,
  timeZone: String,
  locales: identity as Identity<LocaleInput[]>,
  locale: identity as Identity<LocaleSingularArg>,
  themeSystem: String as Identity<'standard' | string>,
  dragRevertDuration: Number,
  dragScroll: Boolean,
  allDayMaintainDuration: Boolean,
  unselectAuto: Boolean,
  dropAccept: identity as Identity<string | ((this: CalendarApi, draggable: any) => boolean)>, // TODO: type draggable
  eventOrder: parseFieldSpecs,

  handleWindowResize: Boolean,
  windowResizeDelay: Number,
  longPressDelay: Number,
  eventDragMinDistance: Number,
  expandRows: Boolean,
  height: identity as Identity<CssDimValue>,
  contentHeight: identity as Identity<CssDimValue>,
  direction: String as Identity<'ltr' | 'rtl'>,
  weekNumberFormat: createFormatter,
  eventResizableFromStart: Boolean,
  displayEventTime: Boolean,
  displayEventEnd: Boolean,
  weekText: String,
  progressiveEventRendering: Boolean,
  businessHours: identity as Identity<BusinessHoursInput>,
  initialDate: identity as Identity<DateInput>,
  now: identity as Identity<DateInput | ((this: CalendarApi) => DateInput)>,
  eventDataTransform: identity as Identity<EventInputTransformer>,
  stickyHeaderDates: identity as Identity<boolean | 'auto'>,
  stickyFooterScrollbar: identity as Identity<boolean | 'auto'>,
  viewHeight: identity as Identity<CssDimValue>,
  defaultAllDay: Boolean,
  eventSourceFailure: identity as Identity<(this: CalendarApi, error: any) => void>,
  eventSourceSuccess: identity as Identity<(this: CalendarApi, eventsInput: EventInput[], xhr?: XMLHttpRequest) => EventInput[] | void>,
  eventsWillUpdate: identity as Identity<(arg: EventsWillUpdateArg) => void | boolean>,

  eventDisplay: String, // TODO: give more specific
  eventStartEditable: Boolean,
  eventDurationEditable: Boolean,
  eventOverlap: identity as Identity<boolean | OverlapFunc>,
  eventConstraint: identity as Identity<ConstraintInput>,
  eventAllow: identity as Identity<AllowFunc>,
  eventBackgroundColor: String,
  eventBorderColor: String,
  eventTextColor: String,
  eventColor: String,
  eventClassNames: identity as Identity<ClassNamesGenerator<EventMeta>>,
  eventContent: identity as Identity<CustomContentGenerator<EventMeta>>,
  eventDidMount: identity as Identity<DidMountHandler<EventMeta>>,
  eventWillUnmount: identity as Identity<WillUnmountHandler<EventMeta>>,

  selectConstraint: identity as Identity<ConstraintInput>,
  selectOverlap: identity as Identity<boolean | OverlapFunc>,
  selectAllow: identity as Identity<AllowFunc>,

  droppable: Boolean,
  unselectCancel: String,

  slotLabelFormat: identity as Identity<FormatterInput | FormatterInput[]>,

  slotLaneClassNames: identity as Identity<ClassNamesGenerator<SlotLaneHookProps>>,
  slotLaneContent: identity as Identity<CustomContentGenerator<SlotLaneHookProps>>,
  slotLaneDidMount: identity as Identity<DidMountHandler<SlotLaneHookProps>>,
  slotLaneWillUnmount: identity as Identity<WillUnmountHandler<SlotLaneHookProps>>,

  slotLabelClassNames: identity as Identity<ClassNamesGenerator<SlotLabelHookProps>>,
  slotLabelContent: identity as Identity<CustomContentGenerator<SlotLabelHookProps>>,
  slotLabelDidMount: identity as Identity<DidMountHandler<SlotLabelHookProps>>,
  slotLabelWillUnmount: identity as Identity<WillUnmountHandler<SlotLabelHookProps>>,

  dayMaxEvents: identity as Identity<boolean | number>,
  dayMaxEventRows: identity as Identity<boolean | number>,
  dayMinWidth: Number,
  slotLabelInterval: createDuration,

  allDayText: String,
  allDayClassNames: identity as Identity<ClassNamesGenerator<AllDayHookProps>>,
  allDayContent: identity as Identity<CustomContentGenerator<AllDayHookProps>>,
  allDayDidMount: identity as Identity<DidMountHandler<AllDayHookProps>>,
  allDayWillUnmount: identity as Identity<WillUnmountHandler<AllDayHookProps>>,

  slotMinWidth: Number, // move to timeline?
  navLinks: Boolean,
  eventTimeFormat: createFormatter,
  rerenderDelay: Number, // TODO: move to @fullcalendar/core right? nah keep here
  moreLinkText: identity as Identity<string | ((this: CalendarApi, num: number) => string)>, // this not enforced :( check others too
  selectMinDistance: Number,
  selectable: Boolean,
  selectLongPressDelay: Number,
  eventLongPressDelay: Number,

  selectMirror: Boolean,
  eventMinHeight: Number, // TODO: kill this setting
  slotEventOverlap: Boolean,
  plugins: identity as Identity<PluginDef[]>,
  firstDay: Number,
  dayCount: Number,
  dateAlignment: String,
  dateIncrement: createDuration,
  hiddenDays: identity as Identity<number[]>,
  monthMode: Boolean,
  fixedWeekCount: Boolean,
  validRange: identity as Identity<DateRangeInput | ((this: CalendarApi, nowDate: Date) => DateRangeInput)>, // `this` works?
  visibleRange: identity as Identity<DateRangeInput | ((this: CalendarApi, currentDate: Date) => DateRangeInput)>, // `this` works?
  titleFormat: identity as Identity<FormatterInput>, // DONT parse just yet. we need to inject titleSeparator

  // only used by list-view, but languages define the value, so we need it in base options
  noEventsText: String
}

type BuiltInBaseOptionRefiners = typeof BASE_OPTION_REFINERS

export interface BaseOptionRefiners extends BuiltInBaseOptionRefiners {
  // for ambient-extending
}

export type BaseOptions = RawOptionsFromRefiners< // as RawOptions
  Required<BaseOptionRefiners> // Required is a hack for "Index signature is missing"
>

// do NOT give a type here. need `typeof BASE_OPTION_DEFAULTS` to give real results.
// raw values.
export const BASE_OPTION_DEFAULTS = {
  eventDisplay: 'auto',
  defaultRangeSeparator: ' - ',
  titleRangeSeparator: ' \u2013 ', // en dash
  defaultTimedEventDuration: '01:00:00',
  defaultAllDayEventDuration: { day: 1 },
  forceEventDuration: false,
  nextDayThreshold: '00:00:00',
  dayHeaders: true,
  initialView: '',
  aspectRatio: 1.35,
  headerToolbar: {
    start: 'title',
    center: '',
    end: 'today prev,next'
  },
  weekends: true,
  weekNumbers: false,
  weekNumberCalculation: 'local' as WeekNumberCalculation,
  editable: false,
  nowIndicator: false,
  scrollTime: '06:00:00',
  slotMinTime: '00:00:00',
  slotMaxTime: '24:00:00',
  showNonCurrentDates: true,
  lazyFetching: true,
  startParam: 'start',
  endParam: 'end',
  timeZoneParam: 'timeZone',
  timeZone: 'local', // TODO: throw error if given falsy value?
  locales: [],
  locale: '', // blank values means it will compute based off locales[]
  themeSystem: 'standard',
  dragRevertDuration: 500,
  dragScroll: true,
  allDayMaintainDuration: false,
  unselectAuto: true,
  dropAccept: '*',
  eventOrder: 'start,-duration,allDay,title',
  dayPopoverFormat: { month: 'long', day: 'numeric', year: 'numeric' },
  handleWindowResize: true,
  windowResizeDelay: 100, // milliseconds before an updateSize happens
  longPressDelay: 1000,
  eventDragMinDistance: 5, // only applies to mouse
  expandRows: false,
  navLinks: false,
  selectable: false
}

export type BaseOptionsRefined = DefaultedRefinedOptions<
  RefinedOptionsFromRefiners<Required<BaseOptionRefiners>>, // Required is a hack for "Index signature is missing"
  keyof typeof BASE_OPTION_DEFAULTS
>


// calendar listeners
// ------------------

export const CALENDAR_LISTENER_REFINERS = {
  datesDidUpdate: identity as Identity<(arg: { view: ViewApi }) => void>,
  windowResize: identity as Identity<(arg: { view: ViewApi }) => void>,
  eventClick: identity as Identity<(arg: EventClickArg) => void>, // TODO: resource for scheduler????
  eventMouseEnter: identity as Identity<(arg: EventHoveringArg) => void>,
  eventMouseLeave: identity as Identity<(arg: EventHoveringArg) => void>,
  select: identity as Identity<(arg: DateSelectArg) => void>, // resource for scheduler????
  unselect: identity as Identity<(arg: DateUnselectArg) => void>,
  loading: identity as Identity<(isLoading: boolean) => void>,

  // internal
  _unmount: identity as Identity<() => void>,
  _beforeprint: identity as Identity<() => void>,
  _afterprint: identity as Identity<() => void>,
  _noEventDrop: identity as Identity<() => void>,
  _noEventResize: identity as Identity<() => void>,
  _resize: identity as Identity<(forced: boolean) => void>,
  _scrollRequest: identity as Identity<(arg: any) => void>
}

type BuiltInCalendarListenerRefiners = typeof CALENDAR_LISTENER_REFINERS

export interface CalendarListenerRefiners extends BuiltInCalendarListenerRefiners {
  // for ambient extending
}

type CalendarListenersLoose = RefinedOptionsFromRefiners<Required<CalendarListenerRefiners>> // Required hack
export type CalendarListeners = Required<CalendarListenersLoose> // much more convenient for Emitters and whatnot


// calendar-specific options
// -------------------------

export const CALENDAR_OPTION_REFINERS = { // does not include base nor calendar listeners
  buttonText: identity as Identity<ButtonTextCompoundInput>,
  views: identity as Identity<{ [viewId: string]: ViewOptions }>,
  plugins: identity as Identity<PluginDef[]>,
  events: identity as Identity<EventSourceInput>,
  eventSources: identity as Identity<EventSourceInput[]>
}

type BuiltInCalendarOptionRefiners = typeof CALENDAR_OPTION_REFINERS

export interface CalendarOptionRefiners extends BuiltInCalendarOptionRefiners {
  // for ambient-extending
}

export type CalendarOptions =
  BaseOptions &
  CalendarListenersLoose &
  RawOptionsFromRefiners<Required<CalendarOptionRefiners>> // Required hack https://github.com/microsoft/TypeScript/issues/15300

export type CalendarOptionsRefined =
  BaseOptionsRefined &
  CalendarListenersLoose &
  RefinedOptionsFromRefiners<Required<CalendarOptionRefiners>> // Required hack

const COMPLEX_CALENDAR_OPTIONS: (keyof CalendarOptions)[] = [
  'headerToolbar',
  'footerToolbar',
  'buttonText',
  'buttonIcons'
]



// view-specific options
// ---------------------

export const VIEW_OPTION_REFINERS = {
  type: String,
  component: identity as Identity<ViewComponentType>,
  buttonText: String,
  buttonTextKey: String, // internal only
  dateProfileGeneratorClass: identity as Identity<DateProfileGeneratorClass>,
  usesMinMaxTime: Boolean, // internal only
  classNames: identity as Identity<ClassNamesGenerator<ViewHookProps>>,
  content: identity as Identity<CustomContentGenerator<ViewHookProps>>,
  didMount: identity as Identity<DidMountHandler<ViewHookProps>>,
  willUnmount: identity as Identity<WillUnmountHandler<ViewHookProps>>
}

type BuiltInViewOptionRefiners = typeof VIEW_OPTION_REFINERS

export interface ViewOptionRefiners extends BuiltInViewOptionRefiners {
  // for ambient-extending
}

export type ViewOptions =
  BaseOptions &
  CalendarListenersLoose &
  RawOptionsFromRefiners<Required<ViewOptionRefiners>> // Required hack

export type ViewOptionsRefined =
  BaseOptionsRefined &
  CalendarListenersLoose &
  RefinedOptionsFromRefiners<Required<ViewOptionRefiners>> // Required hack



// util funcs
// ----------------------------------------------------------------------------------------------------


export function mergeRawOptions(optionSets: Dictionary[]) {
  return mergeProps(optionSets, COMPLEX_CALENDAR_OPTIONS)
}


export function refineProps<Refiners extends GenericRefiners, Raw extends RawOptionsFromRefiners<Refiners>>(input: Raw, refiners: Refiners): { refined: RefinedOptionsFromRefiners<Refiners>, extra: Dictionary } {
  let refined = {} as any
  let extra = {} as any

  for (let propName in refiners) {
    if (propName in input) {
      refined[propName] = refiners[propName](input[propName])
    }
  }

  for (let propName in input) {
    if (!(propName in refiners)) {
      extra[propName] = input[propName]
    }
  }

  return { refined, extra }
}



// definition utils
// ----------------------------------------------------------------------------------------------------


export type GenericRefiners = {
  [propName: string]: (input: any) => any
}

export type GenericListenerRefiners = {
  [listenerName: string]: Identity<(this: CalendarApi, ...args: any[]) => void>
}

export type RawOptionsFromRefiners<Refiners extends GenericRefiners> = {
  [Prop in keyof Refiners]?: // all optional
    Refiners[Prop] extends ((input: infer RawType) => infer RefinedType)
      ? (any extends RawType ? RefinedType : RawType) // if input type `any`, use output (for Boolean/Number/String)
      : never
}

export type RefinedOptionsFromRefiners<Refiners extends GenericRefiners> = {
  [Prop in keyof Refiners]?: // all optional
    Refiners[Prop] extends ((input: any) => infer RefinedType) ? RefinedType : never
}

export type DefaultedRefinedOptions<RefinedOptions extends Dictionary, DefaultKey extends keyof RefinedOptions> =
  Required<Pick<RefinedOptions, DefaultKey>> &
  Partial<Omit<RefinedOptions, DefaultKey>>


export type Dictionary = Record<string, any>

export type Identity<T = any> = (raw: T) => T

export function identity<T>(raw: T): T {
  return raw
}
