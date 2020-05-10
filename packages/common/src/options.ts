import { createDuration, Duration } from './datelib/duration'
import { mergeProps } from './util/object'
import { ToolbarInput } from './toolbar-parse'
import { createFormatter, FormatterInput } from './datelib/formatting'
import { parseFieldSpecs } from './util/misc'
import { CssDimValue } from './scrollgrid/util'
import { DateInput } from './datelib/env'
import { DateRangeInput } from './datelib/date-range'
import { BusinessHoursInput } from './structs/business-hours'
import { ViewApi } from './ViewApi'
import { LocaleSingularArg, RawLocale } from './datelib/locale'
import { OverlapFunc, ConstraintInput, AllowFunc } from './structs/constraint'
import { EventApi } from './api/EventApi'
import { EventInputTransformer } from './structs/event-parse'
import { PluginDef } from './plugin-system-struct'
import { EventSourceInput } from './structs/event-source-parse'
import { ViewComponentType, ViewHookProps } from './structs/view-config'
import { EventMeta } from './component/event-rendering'
import { ClassNameGenerator, CustomContentGenerator, DidMountHandler, WillUnmountHandler } from './common/render-hook'
import { NowIndicatorHookProps } from './common/NowIndicatorRoot'
import { WeekNumberHookProps } from './common/WeekNumberRoot'
import { DateMeta } from './component/date-rendering'
import { DayCellHookProps } from './common/DayCellRoot'
import { ViewRootHookProps } from './common/ViewRoot'


// base options
// ------------

export const BASE_OPTION_REFINERS = {
  navLinkDayClick: identity as Identity<string | ((date: Date, jsEvent: Event) => void)>,
  navLinkWeekClick: identity as Identity<string | ((weekStart: Date, jsEvent: Event) => void)>,
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
  dayHeaderClassNames: identity as Identity<ClassNameGenerator<DayHeaderHookProps>>,
  dayHeaderContent: identity as Identity<CustomContentGenerator<DayHeaderHookProps>>,
  dayHeaderDidMount: identity as Identity<DidMountHandler<DayHeaderHookProps>>,
  dayHeaderWillUnmount: identity as Identity<WillUnmountHandler<DayHeaderHookProps>>,

  dayCellClassNames: identity as Identity<ClassNameGenerator<DayCellHookProps>>,
  dayCellContent: identity as Identity<CustomContentGenerator<DayCellHookProps>>,
  dayCellDidMount: identity as Identity<DidMountHandler<DayCellHookProps>>,
  dayCellWillUnmount: identity as Identity<WillUnmountHandler<DayCellHookProps>>,

  initialView: String,
  aspectRatio: Number,
  weekends: Boolean,

  weekNumberCalculation: identity as Identity<WeekNumberCalculation>,
  weekNumbers: Boolean,
  weekNumberClassNames: identity as Identity<ClassNameGenerator<WeekNumberHookProps>>,
  weekNumberContent: identity as Identity<CustomContentGenerator<WeekNumberHookProps>>,
  weekNumberDidMount: identity as Identity<DidMountHandler<WeekNumberHookProps>>,
  weekNumberWillUnmount: identity as Identity<WillUnmountHandler<WeekNumberHookProps>>,

  editable: Boolean,

  viewClassNames: identity as Identity<ClassNameGenerator<ViewRootHookProps>>,
  viewDidMount: identity as Identity<DidMountHandler<ViewRootHookProps>>,
  viewWillUnmount: identity as Identity<WillUnmountHandler<ViewRootHookProps>>,

  nowIndicator: Boolean,
  nowIndicatorClassNames: identity as Identity<ClassNameGenerator<NowIndicatorHookProps>>,
  nowIndicatorContent: identity as Identity<CustomContentGenerator<NowIndicatorHookProps>>,
  nowIndicatorDidMount: identity as Identity<DidMountHandler<NowIndicatorHookProps>>,
  nowIndicatorWillUnmount: identity as Identity<WillUnmountHandler<NowIndicatorHookProps>>,

  showNonCurrentDates: Boolean,
  lazyFetching: Boolean,
  startParam: String,
  endParam: String,
  timeZoneParam: String,
  timeZone: String,
  locales: identity as Identity<RawLocale[]>,
  locale: identity as Identity<LocaleSingularArg>,
  themeSystem: String as Identity<'standard' | string>,
  dragRevertDuration: Number,
  dragScroll: Boolean,
  allDayMaintainDuration: Boolean,
  unselectAuto: Boolean,
  dropAccept: identity as Identity<string | ((draggable: any) => boolean)>, // TODO: type draggable
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
  businessHours: identity as Identity<BusinessHoursInput>, // ???
  initialDate: identity as Identity<DateInput>,
  now: identity as Identity<DateInput | (() => DateInput)>,
  eventDataTransform: identity as Identity<EventInputTransformer>,
  stickyHeaderDates: identity as Identity<boolean | 'auto'>,
  stickyFooterScrollbar: identity as Identity<boolean | 'auto'>,
  viewHeight: identity as Identity<CssDimValue>,
  defaultAllDay: Boolean,
  eventSourceFailure: identity as Identity<any>, // TODO: should be Listeners?
  eventSourceSuccess: identity as Identity<any>, //

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
  eventClassNames: identity as Identity<ClassNameGenerator<EventMeta>>,
  eventContent: identity as Identity<CustomContentGenerator<EventMeta>>,
  eventDidMount: identity as Identity<DidMountHandler<EventMeta>>,
  eventWillUnmount: identity as Identity<WillUnmountHandler<EventMeta>>,

  selectConstraint: identity as Identity<ConstraintInput>,
  selectOverlap: identity as Identity<boolean | OverlapFunc>,
  selectAllow: identity as Identity<AllowFunc>,

  droppable: Boolean,
  unselectCancel: String,

  slotLabelFormat: createFormatter,

  slotLaneClassNames: identity as Identity<ClassNameGenerator<SlotLaneHookProps>>,
  slotLaneContent: identity as Identity<CustomContentGenerator<SlotLaneHookProps>>,
  slotLaneDidMount: identity as Identity<DidMountHandler<SlotLaneHookProps>>,
  slotLaneWillUnmount: identity as Identity<WillUnmountHandler<SlotLaneHookProps>>,

  slotLabelClassNames: identity as Identity<ClassNameGenerator<SlotLabelHookProps>>,
  slotLabelContent: identity as Identity<CustomContentGenerator<SlotLabelHookProps>>,
  slotLabelDidMount: identity as Identity<DidMountHandler<SlotLabelHookProps>>,
  slotLabelWillUnmount: identity as Identity<WillUnmountHandler<SlotLabelHookProps>>,

  dayMaxEvents: identity as Identity<boolean | number>,
  dayMaxEventRows: identity as Identity<boolean | number>,
  dayMinWidth: Number,
  slotLabelInterval: createDuration,

  allDayText: String,
  allDayClassNames: identity as Identity<ClassNameGenerator<AllDayHookProps>>,
  allDayContent: identity as Identity<CustomContentGenerator<AllDayHookProps>>,
  allDayDidMount: identity as Identity<DidMountHandler<AllDayHookProps>>,
  allDayWillUnmount: identity as Identity<WillUnmountHandler<AllDayHookProps>>,

  slotMinWidth: Number, // move to timeline?
  navLinks: Boolean,
  eventTimeFormat: createFormatter,
  rerenderDelay: Number, // TODO: move to @fullcalendar/core right? nah keep here
  moreLinkText: identity as Identity<string | ((num: number) => string)>,
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
  validRange: identity as Identity<DateRangeInput | ((nowDate: Date) => DateRangeInput)>,
  visibleRange: identity as Identity<DateRangeInput | ((currentDate: Date) => DateRangeInput)>,
  titleFormat: identity as Identity<FormatterInput>, // DONT parse just yet. we need to inject titleSeparator
}

type BuiltInBaseOptionRefiners = typeof BASE_OPTION_REFINERS

export interface BaseOptionRefiners extends BuiltInBaseOptionRefiners {
  // for ambient-extending
}

export type RawBaseOptions = RawOptionsFromRefiners< // as RawOptions
  Required<BaseOptionRefiners> // Required is a hack for "Index signature is missing"
>

export const RAW_BASE_DEFAULTS = { // do NOT give a type here. need `typeof RAW_BASE_DEFAULTS` to give real results
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
  selectable: false,
  firstDay: 0
}

export type RefinedBaseOptions = DefaultedRefinedOptions<
  RefinedOptionsFromRefiners<Required<BaseOptionRefiners>>, // Required is a hack for "Index signature is missing"
  keyof typeof RAW_BASE_DEFAULTS
>


// calendar-specific options
// -------------------------

export const CALENDAR_OPTION_REFINERS = { // does not include base
  buttonText: identity as Identity<ButtonTextCompoundInput>,
  views: identity as Identity<{ [viewId: string]: RawViewOptions }>,
  plugins: identity as Identity<PluginDef[]>,
  events: identity as Identity<EventSourceInput>,
  eventSources: identity as Identity<EventSourceInput[]>,

  windowResize: identity as Identity<
    (view: ViewApi) => void
  >,

  _destroy: identity as Identity<() => void>,
  _init: identity as Identity<() => void>,
  _noEventDrop: identity as Identity<() => void>,
  _noEventResize: identity as Identity<() => void>,
  _resize: identity as Identity<(forced: boolean) => void>,
  _scrollRequest: identity as Identity<(arg: any) => void>,

  // TODO: move a lot of these to interaction plugin?
  dateClick: identity as Identity< // resource for Scheduler
    (arg: { date: Date, dateStr: string, allDay: boolean, resource?: any, dayEl: HTMLElement, jsEvent: MouseEvent, view: ViewApi }) => void
  >,
  eventClick: identity as Identity<
    (arg: { el: HTMLElement, event: EventApi, jsEvent: MouseEvent, view: ViewApi }) => boolean | void
  >,
  eventMouseEnter: identity as Identity<
    (arg: { el: HTMLElement, event: EventApi, jsEvent: MouseEvent, view: ViewApi }) => void
  >,
  eventMouseLeave: identity as Identity<
    (arg: { el: HTMLElement, event: EventApi, jsEvent: MouseEvent, view: ViewApi }) => void
  >,
  select: identity as Identity< // resource for Scheduler
    (arg: { start: Date, end: Date, startStr: string, endStr: string, allDay: boolean, resource?: any, jsEvent: MouseEvent, view: ViewApi }) => void
  >,
  unselect: identity as Identity<
    (arg: { view: ViewApi, jsEvent: Event }) => void
  >,
  loading: identity as Identity<
    (isLoading: boolean) => void
  >,
  eventDragStart: identity as Identity<
    (arg: { event: EventApi, el: HTMLElement, jsEvent: MouseEvent, view: ViewApi }) => void
  >,
  eventDragStop: identity as Identity<
    (arg: { event: EventApi, el: HTMLElement, jsEvent: MouseEvent, view: ViewApi }) => void
  >,
  eventDrop: identity as Identity<
    (arg: { el: HTMLElement, event: EventApi, oldEvent: EventApi, delta: Duration, revert: () => void, jsEvent: Event, view: ViewApi }) => void
  >,
  eventResizeStart: identity as Identity<
    (arg: { el: HTMLElement, event: EventApi, jsEvent: MouseEvent, view: ViewApi }) => void
  >,
  eventResizeStop: identity as Identity<
    (arg: { el: HTMLElement, event: EventApi, jsEvent: MouseEvent, view: ViewApi }) => void
  >,
  eventResize: identity as Identity<
    (arg: { el: HTMLElement, startDelta: Duration, endDelta: Duration, prevEvent: EventApi, event: EventApi, revert: () => void, jsEvent: Event, view: ViewApi }) => void
  >,
  drop: identity as Identity<
    (arg: { date: Date, dateStr: string, allDay: boolean, draggedEl: HTMLElement, jsEvent: MouseEvent, view: ViewApi }) => void
  >,
  eventReceive: identity as Identity<
    (arg: { event: EventApi, draggedEl: HTMLElement, view: ViewApi }) => void
  >,
  eventLeave: identity as Identity<
    (arg: { draggedEl: HTMLElement, event: EventApi, view: ViewApi }) => void
  >
}

type BuiltInCalendarOptionRefiners = typeof CALENDAR_OPTION_REFINERS

export interface CalendarOptionRefiners extends BuiltInCalendarOptionRefiners {
  // for ambient-extending
}

export type RawCalendarOptions = RawBaseOptions & RawOptionsFromRefiners<Required<CalendarOptionRefiners>> // aaaaa https://github.com/microsoft/TypeScript/issues/15300
export type RefinedCalendarOptions = RefinedBaseOptions & RefinedOptionsFromRefiners<Required<CalendarOptionRefiners>> // aaaaaa
export type CalendarListeners = FilteredPropValues<RefinedCalendarOptions, (...args: any[]) => void>

const COMPLEX_CALENDAR_OPTIONS: (keyof RawCalendarOptions)[] = [
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
  dateProfileGeneratorClass: identity as Identity<any>, // internal only
  usesMinMaxTime: Boolean, // internal only
  classNames: identity as Identity<ClassNameGenerator<ViewHookProps>>,
  content: identity as Identity<CustomContentGenerator<ViewHookProps>>,
  didMount: identity as Identity<DidMountHandler<ViewHookProps>>,
  willUnmount: identity as Identity<WillUnmountHandler<ViewHookProps>>
}

type BuiltInViewOptionRefiners = typeof VIEW_OPTION_REFINERS

export interface ViewOptionRefiners extends BuiltInViewOptionRefiners {
  // for ambient-extending
}

export type RawViewOptions = RawBaseOptions & RawOptionsFromRefiners<typeof VIEW_OPTION_REFINERS>
export type RefinedViewOptions = RefinedBaseOptions & RefinedOptionsFromRefiners<typeof VIEW_OPTION_REFINERS>



// util funcs
// ----------------------------------------------------------------------------------------------------


export function mergeRawOptions(optionSets: GenericObject[]) {
  return mergeProps(optionSets, COMPLEX_CALENDAR_OPTIONS)
}



// definition utils
// ----------------------------------------------------------------------------------------------------


export type GenericRefiners = {
  [propName: string]: (input: any) => any
}

type RawOptionsFromRefiners<Refiners extends GenericRefiners> = {
  [Prop in keyof Refiners]?: // all optional
    Refiners[Prop] extends ((input: infer RawType) => infer RefinedType)
      ? (any extends RawType ? RefinedType : RawType) // if input type `any`, use output (for Boolean/Number/String)
      : never
}

type RefinedOptionsFromRefiners<Refiners extends GenericRefiners> = {
  [Prop in keyof Refiners]?: // all optional
    Refiners[Prop] extends ((input: any) => infer RefinedType) ? RefinedType : never
}

type DefaultedRefinedOptions<RefinedOptions extends GenericObject, DefaultKey extends keyof RefinedOptions> =
  Required<Pick<RefinedOptions, DefaultKey>> &
  Partial<Omit<RefinedOptions, DefaultKey>>



type GenericObject = { [prop: string]: any } // TODO: Partial<{}>

// https://stackoverflow.com/a/49397693/96342
type FilteredPropKeys<T, Match> = ({ [P in keyof T]: T[P] extends Match ? P : never })[keyof T]
type FilteredPropValues<T, Match> = Pick<T, FilteredPropKeys<T, Match>>

export type Identity<T = any> = (raw: T) => T

export function identity<T>(raw: T): T {
  return raw
}



// random crap we need to put into other files
// -------------------------------------------

export interface SlotLaneHookProps extends Partial<DateMeta> { // TODO: move?
  time?: Duration
  date?: Date
  view: ViewApi
  // this interface is for date-specific slots AND time-general slots. make an OR?
}

export interface SlotLabelHookProps { // TODO: move?
  time: Duration
  date: Date
  view: ViewApi
  text: string
}

export interface AllDayHookProps {
  text: string
  view: ViewApi
}

export interface CustomButtonInput {
  text: string
  icon?: string
  themeIcon?: string
  bootstrapFontAwesome?: string,
  click(element: HTMLElement): void
}

export interface ButtonIconsInput {
  prev?: string
  next?: string
  prevYear?: string
  nextYear?: string
}

export interface ButtonTextCompoundInput {
  prev?: string
  next?: string
  prevYear?: string // derive these somehow?
  nextYear?: string
  today?: string
  month?: string
  week?: string
  day?: string
  [viewId: string]: string | undefined // needed b/c of other optional types ... make extendable???
}

export type WeekNumberCalculation = 'local' | 'ISO' | ((m: Date) => number)

export interface DayHeaderHookProps extends DateMeta {
  date: Date
  view: ViewApi
  text: string
  [otherProp: string]: any
}
