import { BaseOptions, BaseOptionsRefined, RawOptionsFromRefiners, RefinedOptionsFromRefiners } from '@fullcalendar/core/protected-api'
import { DateProfileGeneratorClass } from './DateProfileGenerator'
import { CalendarApi } from './api/CalendarApi'
import { CalendarController } from './CalendarController'
import { EventApi } from './api/EventApi'
import {
  AllDayHeaderInfo,
  AllowFunc,
  BusinessHoursInput,
  ButtonInput,
  ClassNameGenerator,
  ConstraintInput,
  CssDimValue,
  ContentGenerator,
  CustomRenderingHandler,
  DateInput,
  DateRangeInput,
  DateSelectInfo,
  DatesSetInfo,
  DateUnselectInfo,
  DayLaneInfo,
  DidMountHandler,
  EventAddInfo, EventChangeInfo,
  EventClickInfo,
  EventDisplayInfo,
  EventHoveringInfo,
  EventInput, EventInputTransformer,
  EventRemoveInfo,
  EventSourceInput,
  FormatterInput,
  LocaleInput,
  LocaleSingularArg,
  MoreLinkAction,
  MoreLinkInfo,
  NowIndicatorHeaderInfo,
  NowIndicatorLineInfo,
  OverlapFunc,
  SlotHeaderInfo,
  SlotLaneInfo,
  ToolbarInput,
  ViewComponentType,
  ViewDisplayInfo,
  WeekNumberCalculation,
  InlineWeekNumberInfo,
  WeekNumberHeaderInfo,
  WillUnmountHandler,
  ButtonInfo,
  ButtonGroupInfo,
  ToolbarElementInput,
  ToolbarSectionInfo,
  ToolbarInfo,
  ButtonDisplay,
  DayHeaderInfo,
  DayHeaderDividerInfo,
  DayCellInfo,
  PluginInput,
} from './api/structs'
import { TableDisplayInfo, TableHeaderInfo, TableBodyInfo } from './common/TableAndSubsections'
import { refineClassName, refineClassNameGenerator } from './common/render-hook'
import { CalendarDisplayInfo } from './calendar-root'
import { createDuration, DateFormatter, Duration } from '@full-ui/headless-calendar'
import { createFormatter } from './datelib/formatting'
import { parseFieldSpecs } from './util/misc'
import { isMaybePropsEqualShallow, isMaybePropsEqualDepth1 } from './util/object'
import { isMaybeArraysEqual } from './util/array'
import { ListDayInfo, ListDayEventsInfo, ListDayHeaderInfo, ListDayHeaderInnerInfo } from './list/structs'
import { NoEventsInfo } from './list/components/ListView'
import { SingleMonthInfo, SingleMonthHeaderInfo } from './multimonth/structs'
import { DateClickInfo } from './interaction-plugin/interactions/DateClicking'
import { EventDragStartInfo, EventDragStopInfo } from './interaction-plugin/interactions/EventDragging'
import { EventDropInfo } from './event-crud'
import { EventResizeStartInfo, EventResizeStopInfo, EventResizeDoneInfo } from './interaction-plugin/interactions/EventResizing'
import { DropInfo, EventReceiveInfo, EventLeaveInfo } from './interaction-plugin/utils'
import { ViewContentInfo } from './component-util/View'

// base options
// ------------

export const BASE_OPTION_REFINERS = {
  navLinkDayClick: identity as Identity<string | ((this: CalendarApi, date: Date, jsEvent: UIEvent) => void)>,
  navLinkWeekClick: identity as Identity<string | ((this: CalendarApi, weekStart: Date, jsEvent: UIEvent) => void)>,
  duration: createDuration,

  buttons: identity as Identity<
    Partial<{ // done this way to workaround newer TS claiming invalid
      today: ButtonInput
      prev: ButtonInput
      next: ButtonInput
      prevYear: ButtonInput
      nextYear: ButtonInput
      year: ButtonInput
      month: ButtonInput
      week: ButtonInput
      day: ButtonInput
      [buttonName: string]: ButtonInput
    }>
  >,
  toolbarElements: identity as Identity<{
    [elementName: string]: ToolbarElementInput
  }>,
  prevText: String,
  nextText: String,
  prevYearText: String,
  nextYearText: String,
  todayText: String,
  yearText: String,
  monthText: String,
  weekTextLong: String,
  weekTextShort: String,
  dayText: String,
  listText: identity as Identity<string | false>,
  todayHint: identity as Identity<string | ((currentUnitText: string, currentUnit: string) => string)>,
  prevHint: identity as Identity<string | ((currentUnitText: string, currentUnit: string) => string)>,
  nextHint: identity as Identity<string | ((currentUnitText: string, currentUnit: string) => string)>,
  // TODO: make type for hint input

  buttonDisplay: identity as Identity<ButtonDisplay>,
  buttonGroupClass: refineClassNameGenerator as Identity<ClassNameGenerator<ButtonGroupInfo>>,
  buttonClass: refineClassNameGenerator as Identity<ClassNameGenerator<ButtonInfo>>,

  defaultAllDayEventDuration: createDuration,
  defaultTimedEventDuration: createDuration,
  nextDayThreshold: createDuration,
  scrollTime: createDuration,
  scrollTimeReset: Boolean,
  slotMinTime: createDuration,
  slotMaxTime: createDuration,
  popoverFormat: createFormatter,
  slotDuration: createDuration,
  snapDuration: createDuration,
  headerToolbar: identity as Identity<ToolbarInput | false>,
  footerToolbar: identity as Identity<ToolbarInput | false>,
  forceEventDuration: Boolean,

  // TODO: move to timegrid
  dayLaneClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayLaneInfo>>,
  dayLaneInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayLaneInfo>>,
  dayLaneDidMount: identity as Identity<DidMountHandler<DayLaneInfo>>,
  dayLaneWillUnmount: identity as Identity<WillUnmountHandler<DayLaneInfo>>,

  initialView: String,
  aspectRatio: Number,
  weekends: Boolean,

  weekNumberCalculation: identity as Identity<WeekNumberCalculation>,
  weekNumbers: Boolean,

  weekNumberHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<WeekNumberHeaderInfo>>,
  weekNumberHeaderInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<WeekNumberHeaderInfo>>,
  weekNumberHeaderContent: identity as Identity<ContentGenerator<WeekNumberHeaderInfo>>,
  weekNumberHeaderDidMount: identity as Identity<DidMountHandler<WeekNumberHeaderInfo>>,
  weekNumberHeaderWillUnmount: identity as Identity<WillUnmountHandler<WeekNumberHeaderInfo>>,

  inlineWeekNumberClass: refineClassNameGenerator as Identity<ClassNameGenerator<InlineWeekNumberInfo>>,
  inlineWeekNumberContent: identity as Identity<ContentGenerator<InlineWeekNumberInfo>>,
  inlineWeekNumberDidMount: identity as Identity<DidMountHandler<InlineWeekNumberInfo>>,
  inlineWeekNumberWillUnmount: identity as Identity<WillUnmountHandler<InlineWeekNumberInfo>>,

  editable: Boolean,

  controller: identity as Identity<CalendarController>,

  nowIndicator: Boolean,
  nowIndicatorSnap: identity as Identity<boolean | 'auto'>,

  nowIndicatorHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<NowIndicatorHeaderInfo>>,
  nowIndicatorHeaderContent: identity as Identity<ContentGenerator<NowIndicatorHeaderInfo>>,
  nowIndicatorHeaderDidMount: identity as Identity<DidMountHandler<NowIndicatorHeaderInfo>>,
  nowIndicatorHeaderWillUnmount: identity as Identity<WillUnmountHandler<NowIndicatorHeaderInfo>>,

  nowIndicatorDotClass: refineClassName,

  nowIndicatorLineClass: refineClassNameGenerator as Identity<ClassNameGenerator<NowIndicatorLineInfo>>,
  nowIndicatorLineContent: identity as Identity<ContentGenerator<NowIndicatorLineInfo>>,
  nowIndicatorLineDidMount: identity as Identity<DidMountHandler<NowIndicatorLineInfo>>,
  nowIndicatorLineWillUnmount: identity as Identity<WillUnmountHandler<NowIndicatorLineInfo>>,

  showNonCurrentDates: Boolean,
  lazyFetching: Boolean,
  startParam: String,
  endParam: String,
  timeZoneParam: String,
  timeZone: String,
  locales: identity as Identity<LocaleInput[]>,
  locale: identity as Identity<LocaleSingularArg>,
  dragRevertDuration: Number,
  dragScroll: Boolean,
  allDayMaintainDuration: Boolean,
  unselectAuto: Boolean,
  dropAccept: identity as Identity<string | ((this: CalendarApi, draggable: any) => boolean)>, // TODO: type draggable
  eventOrder: parseFieldSpecs,
  eventOrderStrict: Boolean,
  eventSlicing: Boolean, // default: true
  eventPrintLayout: String as Identity<'auto' | 'stack' | 'grid'>,

  longPressDelay: Number,
  eventDragMinDistance: Number,
  expandRows: Boolean,
  height: identity as Identity<CssDimValue>,
  contentHeight: identity as Identity<CssDimValue>,
  direction: String as Identity<'ltr' | 'rtl'>,
  colorScheme: String as Identity<'light' | 'dark' | string | undefined>,
  weekNumberFormat: createFormatter,
  eventResizableFromStart: Boolean,
  displayEventTime: Boolean,
  displayEventEnd: Boolean,
  progressiveEventRendering: Boolean,
  businessHours: identity as Identity<BusinessHoursInput>,
  initialDate: identity as Identity<DateInput>,
  now: identity as Identity<DateInput | ((this: CalendarApi) => DateInput)>,
  eventDataTransform: identity as Identity<EventInputTransformer>,
  tableHeaderSticky: identity as Identity<boolean | 'auto'>,
  footerScrollbarSticky: identity as Identity<boolean | 'auto'>,
  defaultAllDay: Boolean,
  eventSourceFailure: identity as Identity<(this: CalendarApi, error: any) => void>,
  eventSourceSuccess: identity as Identity<(this: CalendarApi, eventsInput: EventInput[], response?: Response) => EventInput[] | void>,

  eventDisplay: String, // TODO: give more specific
  eventStartEditable: Boolean,
  eventDurationEditable: Boolean,
  eventOverlap: identity as Identity<boolean | OverlapFunc>,
  eventConstraint: identity as Identity<ConstraintInput>,
  eventAllow: identity as Identity<AllowFunc>,
  eventColor: String,
  eventContrastColor: String,
  eventDidMount: identity as Identity<DidMountHandler<EventDisplayInfo>>,
  eventWillUnmount: identity as Identity<WillUnmountHandler<EventDisplayInfo>>,
  eventContent: identity as Identity<ContentGenerator<EventDisplayInfo>>,

  eventClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  eventInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  eventTimeClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ event: EventApi, isNarrow: boolean, isShort: boolean }>>,
  eventTitleClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ event: EventApi, isNarrow: boolean, isShort: boolean }>>,
  eventBeforeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  eventAfterClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  //
  listItemEventClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  listItemEventInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  listItemEventTimeClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ event: EventApi, isNarrow: boolean, isShort: boolean }>>,
  listItemEventTitleClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ event: EventApi, isNarrow: boolean, isShort: boolean, timeText: string }>>,
  listItemEventBeforeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  listItemEventAfterClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  //
  blockEventClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  blockEventInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  blockEventTimeClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ event: EventApi, isNarrow: boolean, isShort: boolean }>>,
  blockEventTitleClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ event: EventApi, isNarrow: boolean, isShort: boolean }>>,
  blockEventBeforeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  blockEventAfterClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  //
  rowEventClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  rowEventInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  rowEventTimeClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ event: EventApi, isNarrow: boolean, isShort: boolean }>>,
  rowEventTitleClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ event: EventApi, isNarrow: boolean, isShort: boolean }>>,
  rowEventTitleSticky: Boolean,
  rowEventBeforeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  rowEventBeforeContent: identity as Identity<ContentGenerator<EventDisplayInfo>>,
  rowEventAfterClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  rowEventAfterContent: identity as Identity<ContentGenerator<EventDisplayInfo>>,
  //
  columnEventClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  columnEventInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  columnEventTimeClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ event: EventApi, isNarrow: boolean, isShort: boolean }>>,
  columnEventTitleClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ event: EventApi, isNarrow: boolean, isShort: boolean }>>,
  columnEventTitleSticky: Boolean,
  columnEventBeforeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  columnEventAfterClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  //
  backgroundEventClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  backgroundEventDidMount: identity as Identity<DidMountHandler<EventDisplayInfo>>,
  backgroundEventWillUnmount: identity as Identity<WillUnmountHandler<EventDisplayInfo>>,
  backgroundEventContent: identity as Identity<ContentGenerator<EventDisplayInfo>>,
  backgroundEventInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,
  backgroundEventTitleClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ event: EventApi, isNarrow: boolean, isShort: boolean }>>,
  backgroundEventColor: String,

  selectConstraint: identity as Identity<ConstraintInput>,
  selectOverlap: identity as Identity<boolean | OverlapFunc>,
  selectAllow: identity as Identity<AllowFunc>,

  droppable: Boolean,
  unselectCancel: String,

  slotHeaderFormat: identity as Identity<FormatterInput | FormatterInput[]>,

  slotLaneClass: refineClassNameGenerator as Identity<ClassNameGenerator<SlotLaneInfo>>,
  slotLaneDidMount: identity as Identity<DidMountHandler<SlotLaneInfo>>,
  slotLaneWillUnmount: identity as Identity<WillUnmountHandler<SlotLaneInfo>>,

  slotHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<SlotHeaderInfo>>,
  slotHeaderInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<SlotHeaderInfo>>,
  slotHeaderContent: identity as Identity<ContentGenerator<SlotHeaderInfo>>,
  slotHeaderDidMount: identity as Identity<DidMountHandler<SlotHeaderInfo>>,
  slotHeaderWillUnmount: identity as Identity<WillUnmountHandler<SlotHeaderInfo>>,
  slotHeaderAlign: identity as Identity<'start' | 'center' | 'end' | ((info: { level: number, isTime: boolean }) => 'start' | 'center' | 'end')>,
  slotHeaderSticky: identity as Identity<boolean | number | string>,

  slotHeaderRowClass: refineClassName,
  slotHeaderDividerClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ inTableHeader: boolean, options: { dayMinWidth: number | undefined } }>>,

  dayMaxEvents: identity as Identity<boolean | number>,
  dayMaxEventRows: identity as Identity<boolean | number>,
  dayMinWidth: Number,
  slotHeaderInterval: createDuration,

  // in core because more-popover needs it
  dayHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayHeaderInfo>>,
  dayHeaderInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayHeaderInfo>>,
  dayHeaderContent: identity as Identity<ContentGenerator<DayHeaderInfo>>,
  dayHeaderDidMount: identity as Identity<DidMountHandler<DayHeaderInfo>>,
  dayHeaderWillUnmount: identity as Identity<WillUnmountHandler<DayHeaderInfo>>,
  dayHeaderAlign: identity as Identity<'start' | 'center' | 'end' | ((info: { level: number, inPopover: boolean, isNarrow: boolean }) => 'start' | 'center' | 'end')>,
  // stickiness for cell-inner-contents laterally. experimental settings
  _dayHeaderSticky: identity as Identity<boolean | number | string>,

  dayHeaderRowClass: refineClassName,

  dayHeaderDividerClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayHeaderDividerInfo>>,

  dayRowClass: refineClassName,

  dayCellDidMount: identity as Identity<DidMountHandler<DayCellInfo>>,
  dayCellWillUnmount: identity as Identity<WillUnmountHandler<DayCellInfo>>,
  dayCellClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayCellInfo>>,
  dayCellInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayCellInfo>>,

  dayCellTopContent: identity as Identity<ContentGenerator<DayCellInfo>>,
  dayCellTopClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayCellInfo>>,
  dayCellTopInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayCellInfo>>,
  dayCellBottomClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayCellInfo>>,

  allDaySlot: Boolean,
  allDayText: String,
  allDayHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<AllDayHeaderInfo>>,
  allDayHeaderInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<AllDayHeaderInfo>>,
  allDayHeaderContent: identity as Identity<ContentGenerator<AllDayHeaderInfo>>,
  allDayHeaderDidMount: identity as Identity<DidMountHandler<AllDayHeaderInfo>>,
  allDayHeaderWillUnmount: identity as Identity<WillUnmountHandler<AllDayHeaderInfo>>,

  timedText: String,

  slotMinWidth: Number,
  slotMinHeight: Number,
  navLinks: Boolean,
  eventTimeFormat: createFormatter,
  rerenderDelay: Number, // TODO: move to vanilla right? nah keep here
  moreLinkText: identity as Identity<string | ((this: CalendarApi, num: number) => string)>, // this not enforced :( check others too
  moreLinkHint: identity as Identity<string | ((this: CalendarApi, num: number) => string)>,
  selectMinDistance: Number,
  selectable: Boolean,
  selectLongPressDelay: Number,
  eventLongPressDelay: Number,

  selectMirror: Boolean,
  eventMaxStack: Number,
  eventMinHeight: Number,
  eventMinWidth: Number,
  eventShortHeight: Number,
  slotEventOverlap: Boolean,
  firstDay: Number,
  dayCount: Number,
  dateAlignment: String,
  dateIncrement: createDuration,
  hiddenDays: identity as Identity<number[]>,
  fixedWeekCount: Boolean,
  validRange: identity as Identity<DateRangeInput | ((this: CalendarApi, nowDate: Date) => DateRangeInput)>, // `this` works?
  visibleRange: identity as Identity<DateRangeInput | ((this: CalendarApi, currentDate: Date) => DateRangeInput)>, // `this` works?
  titleFormat: identity as Identity<FormatterInput>,

  eventInteractive: Boolean,

  // only used by list-view, but languages define the value, so we need it in base options
  noEventsText: String,

  viewHint: identity as Identity<string | ((viewButtonText: string, viewName: string) => string)>,
  viewChangeHint: String, // for the tab container
  navLinkHint: identity as Identity<string | ((dateText: string, date: Date) => string)>,
  closeHint: String,
  eventsHint: String,

  headingLevel: Number,

  moreLinkClick: identity as Identity<MoreLinkAction>,
  moreLinkContent: identity as Identity<ContentGenerator<MoreLinkInfo>>,
  moreLinkDidMount: identity as Identity<DidMountHandler<MoreLinkInfo>>,
  moreLinkWillUnmount: identity as Identity<WillUnmountHandler<MoreLinkInfo>>,
  moreLinkClass: refineClassNameGenerator as Identity<ClassNameGenerator<MoreLinkInfo>>,
  moreLinkInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<MoreLinkInfo>>,
  //
  rowMoreLinkClass: refineClassNameGenerator as Identity<ClassNameGenerator<MoreLinkInfo>>,
  rowMoreLinkInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<MoreLinkInfo>>,
  //
  columnMoreLinkClass: refineClassNameGenerator as Identity<ClassNameGenerator<MoreLinkInfo>>,
  columnMoreLinkInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<MoreLinkInfo>>,

  navLinkClass: refineClassName,

  monthStartFormat: createFormatter,
  dayCellFormat: createFormatter,

  // for connectors
  // (can't be part of plugin system b/c must be provided at runtime)
  handleCustomRendering: identity as Identity<CustomRenderingHandler<any>>,
  customRenderingMetaMap: identity as Identity<{ [optionName: string]: any }>,
  customRenderingReplaces: Boolean,

  popoverClass: refineClassName,
  popoverCloseClass: refineClassName,
  popoverCloseContent: identity as Identity<ContentGenerator<{}>>,

  dayNarrowWidth: Number,

  borderless: Boolean,
  borderlessX: Boolean,
  borderlessTop: Boolean,
  borderlessBottom: Boolean,

  fillerClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ inTableHeader: boolean }>>,

  headerToolbarClass: refineClassNameGenerator as Identity<ClassNameGenerator<ToolbarInfo>>,
  footerToolbarClass: refineClassNameGenerator as Identity<ClassNameGenerator<ToolbarInfo>>,
  toolbarClass: refineClassNameGenerator as Identity<ClassNameGenerator<ToolbarInfo>>,
  toolbarSectionClass: refineClassNameGenerator as Identity<ClassNameGenerator<ToolbarSectionInfo>>,
  toolbarTitleClass: refineClassName,

  tableClass: refineClassNameGenerator as Identity<ClassNameGenerator<TableDisplayInfo>>,
  tableHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<TableHeaderInfo>>,
  tableBodyClass: refineClassNameGenerator as Identity<ClassNameGenerator<TableBodyInfo>>,

  nonBusinessHoursClass: refineClassName,
  highlightClass: refineClassName,

  // daygrid-only
  dayHeaders: Boolean,
  dayHeaderFormat: createFormatter,

  // timegrid-only
  allDayDividerClass: refineClassName,

  // list-only
  listDaysClass: refineClassName,  // rename this?
  listDayClass: refineClassNameGenerator as Identity<ClassNameGenerator<ListDayInfo>>,
  //
  listDayFormat: createFalsableFormatter, // defaults specified in list plugins
  listDayAltFormat: createFalsableFormatter, // "
  //
  listDayHeaderDidMount: identity as Identity<DidMountHandler<ListDayHeaderInfo>>,
  listDayHeaderWillUnmount: identity as Identity<WillUnmountHandler<ListDayHeaderInfo>>,
  listDayHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<ListDayHeaderInfo>>,
  listDayHeaderInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<ListDayHeaderInnerInfo>>,
  listDayHeaderContent: identity as Identity<ContentGenerator<ListDayHeaderInnerInfo>>,
  //
  listDayBodyClass: refineClassNameGenerator as Identity<ClassNameGenerator<ListDayEventsInfo>>,
  //
  noEventsClass: refineClassNameGenerator as Identity<ClassNameGenerator<NoEventsInfo>>,
  noEventsInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<NoEventsInfo>>,
  noEventsContent: identity as Identity<ContentGenerator<NoEventsInfo>>,
  noEventsDidMount: identity as Identity<DidMountHandler<NoEventsInfo>>,
  noEventsWillUnmount: identity as Identity<WillUnmountHandler<NoEventsInfo>>,
  // noEventsText is defined in base options

  // multimonth-only
  multiMonthMaxColumns: Number,
  //
  singleMonthMinWidth: Number,
  singleMonthTitleFormat: createFormatter,
  singleMonthDidMount: identity as Identity<DidMountHandler<SingleMonthInfo>>,
  singleMonthWillUnmount: identity as Identity<WillUnmountHandler<SingleMonthInfo>>,
  singleMonthClass: refineClassNameGenerator as Identity<ClassNameGenerator<SingleMonthInfo>>,
  singleMonthHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<SingleMonthHeaderInfo>>,
  singleMonthHeaderInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<SingleMonthHeaderInfo>>,
}

type BaseOptionRefiners = typeof BASE_OPTION_REFINERS

declare module '@fullcalendar/core/protected-api' {
  interface BaseOptions extends RawOptionsFromRefiners<BaseOptionRefiners> {}
  interface BaseOptionsRefined extends RefinedOptionsFromRefiners<BaseOptionRefiners> {}
}

// do NOT give a type here. need `typeof BASE_OPTION_DEFAULTS` to give real results.
// raw values.
export const BASE_OPTION_DEFAULTS = {
  buttonDisplay: 'auto',
  eventDisplay: 'auto',
  defaultTimedEventDuration: '01:00:00',
  defaultAllDayEventDuration: { day: 1 },
  forceEventDuration: false,
  nextDayThreshold: '00:00:00',
  initialView: '',
  aspectRatio: 1.35,
  weekends: true,
  weekNumbers: false,
  weekNumberCalculation: 'local' as WeekNumberCalculation,
  editable: false,
  nowIndicator: false,
  scrollTime: '06:00:00',
  scrollTimeReset: true,
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
  dragRevertDuration: 500,
  dragScroll: true,
  allDayMaintainDuration: false,
  unselectAuto: true,
  dropAccept: '*',
  eventOrder: 'start,-duration,allDay,title',
  eventPrintLayout: 'auto',
  popoverFormat: { month: 'long', day: 'numeric', year: 'numeric' },
  longPressDelay: 1000,
  eventDragMinDistance: 5, // only applies to mouse
  expandRows: false,
  navLinks: false,
  selectable: false,
  eventMinHeight: 15,
  eventMinWidth: 30,
  eventShortHeight: 30,
  monthStartFormat: { month: 'long', day: 'numeric' },
  dayCellFormat: { day: 'numeric', omitTrailing: true },
  headingLevel: 2, // like H2
  outerBorder: true,
  dayNarrowWidth: 80,
  eventOverlap: true,
  slotHeaderAlign: 'start',
  slotHeaderSticky: true,
  dayHeaderAlign: 'start',
  _dayHeaderSticky: true,
  rowEventTitleSticky: true,
  columnEventTitleSticky: true,
  nowIndicatorSnap: 'auto',

  // daygrid-only
  dayHeaders: true,
}

// calendar listeners
// ------------------

export const CALENDAR_LISTENER_REFINERS = {
  datesSet: identity as Identity<(info: DatesSetInfo) => void>,
  eventsSet: identity as Identity<(events: EventApi[]) => void>,
  eventAdd: identity as Identity<(info: EventAddInfo) => void>,
  eventChange: identity as Identity<(info: EventChangeInfo) => void>,
  eventRemove: identity as Identity<(info: EventRemoveInfo) => void>,
  eventClick: identity as Identity<(info: EventClickInfo) => void>, // TODO: resource for scheduler????
  eventMouseEnter: identity as Identity<(info: EventHoveringInfo) => void>,
  eventMouseLeave: identity as Identity<(info: EventHoveringInfo) => void>,
  select: identity as Identity<(info: DateSelectInfo) => void>, // resource for scheduler????
  unselect: identity as Identity<(info: DateUnselectInfo) => void>,
  loading: identity as Identity<(isLoading: boolean) => void>,

  // internal
  _unmount: identity as Identity<() => void>,
  _beforeprint: identity as Identity<() => void>,
  _afterprint: identity as Identity<() => void>,
  _noDateSelect: identity as Identity<() => void>,
  _noEventDrop: identity as Identity<() => void>,
  _noEventResize: identity as Identity<() => void>,
  _timeScrollRequest: identity as Identity<(time: Duration) => void>,

  // interaction-plugin-only
  dateClick: identity as Identity<(info: DateClickInfo) => void>,
  eventDragStart: identity as Identity<(info: EventDragStartInfo) => void>,
  eventDragStop: identity as Identity<(info: EventDragStopInfo) => void>,
  eventDrop: identity as Identity<(info: EventDropInfo) => void>,
  eventResizeStart: identity as Identity<(info: EventResizeStartInfo) => void>,
  eventResizeStop: identity as Identity<(info: EventResizeStopInfo) => void>,
  eventResize: identity as Identity<(info: EventResizeDoneInfo) => void>,
  drop: identity as Identity<(info: DropInfo) => void>,
  eventReceive: identity as Identity<(info: EventReceiveInfo) => void>,
  eventLeave: identity as Identity<(info: EventLeaveInfo) => void>,
}

type CalendarListenerRefiners = typeof CALENDAR_LISTENER_REFINERS

export interface CalendarListeners extends RawOptionsFromRefiners<CalendarListenerRefiners> {
  // for ambient extending
}

export interface CalendarListenersRefined extends RefinedOptionsFromRefiners<CalendarListenerRefiners> {
  // for ambient extending
}

// calendar-only options (not for view-specific)
// ---------------------------------------------

export const CALENDAR_ONLY_OPTION_REFINERS = { // does not include base nor calendar listeners
  class: refineClassNameGenerator as Identity<ClassNameGenerator<CalendarDisplayInfo>>,
  className: refineClassNameGenerator as Identity<ClassNameGenerator<CalendarDisplayInfo>>,

  viewClass: refineClassNameGenerator as Identity<ClassNameGenerator<ViewDisplayInfo>>,
  viewDidMount: identity as Identity<DidMountHandler<ViewDisplayInfo>>,
  viewWillUnmount: identity as Identity<WillUnmountHandler<ViewDisplayInfo>>,

  views: identity as Identity<{ [viewId: string]: ViewOptions }>,
  plugins: identity as Identity<PluginInput[]>,
  initialEvents: identity as Identity<EventSourceInput>,
  events: identity as Identity<EventSourceInput>,
  eventSources: identity as Identity<EventSourceInput[]>,
}

type CalendarOnlyOptionRefiners = typeof CALENDAR_ONLY_OPTION_REFINERS
type CalendarOnlyOptions = RawOptionsFromRefiners<CalendarOnlyOptionRefiners>
type CalendarOnlyOptionsRefined = RefinedOptionsFromRefiners<CalendarOnlyOptionRefiners>

// view-specific options
// ---------------------

export const VIEW_ONLY_OPTION_REFINERS = {
  type: String,
  component: identity as Identity<ViewComponentType>,

  class: refineClassNameGenerator as Identity<ClassNameGenerator<ViewDisplayInfo>>,
  className: refineClassNameGenerator as Identity<ClassNameGenerator<ViewDisplayInfo>>,
  content: identity as Identity<ContentGenerator<ViewContentInfo>>,
  didMount: identity as Identity<DidMountHandler<ViewDisplayInfo>>,
  willUnmount: identity as Identity<WillUnmountHandler<ViewDisplayInfo>>,

  // internal only
  buttonTextKey: String,
  dateProfileGeneratorClass: identity as Identity<DateProfileGeneratorClass>,
  usesMinMaxTime: Boolean,
  disallowAmbigTitle: Boolean,
}

type ViewOnlyRefiners = typeof VIEW_ONLY_OPTION_REFINERS
type ViewOnlyOptions = RawOptionsFromRefiners<ViewOnlyRefiners>
type ViewOnlyOptionsRefined = RefinedOptionsFromRefiners<ViewOnlyRefiners>

export type ViewOptions =
  BaseOptions &
  CalendarListeners &
  ViewOnlyOptions

export type ViewOptionsRefined =
  BaseOptionsRefined &
  CalendarListenersRefined &
  ViewOnlyOptionsRefined

// top-level calendar options
// --------------------------

export type CalendarOptions =
  BaseOptions &
  CalendarListeners &
  CalendarOnlyOptions

export type CalendarOptionsRefined =
  BaseOptionsRefined &
  CalendarListenersRefined &
  CalendarOnlyOptionsRefined

export const COMPLEX_OPTION_COMPARATORS: {
  [optionName in keyof CalendarOptions]: (a: CalendarOptions[optionName], b: CalendarOptions[optionName]) => boolean
} = {
  // Unfortunately always need 'maybe' to handle undefined inital value, because of CalendarDataManager
  dateIncrement: isMaybePropsEqualShallow,
  headerToolbar: isMaybePropsEqualShallow,
  footerToolbar: isMaybePropsEqualShallow,
  buttons: isMaybePropsEqualDepth1,
  plugins: isMaybeArraysEqual,
  events: isMaybeArraysEqual,
  eventSources: isMaybeArraysEqual,
  ['resources' as any]: isMaybeArraysEqual,
}

// util funcs
// ----------------------------------------------------------------------------------------------------

export function refineProps<Refiners extends GenericRefiners, Raw extends RawOptionsFromRefiners<Refiners>>(
  input: Raw,
  refiners: Refiners,
): {
  refined: RefinedOptionsFromRefiners<Refiners>,
  extra: Dictionary,
} {
  let refined = {} as any
  let extra = {} as any

  for (let propName in refiners) {
    if (propName in input) {
      refined[propName] = refiners[propName](input[propName], propName)
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
  [propName: string]: (input: any, propName: string) => any
}

export type GenericListenerRefiners = {
  [listenerName: string]: Identity<(this: CalendarApi, ...args: any[]) => void>
}

export type DefaultedRefinedOptions<RefinedOptions extends Dictionary, DefaultKey extends keyof RefinedOptions> =
  Required<Pick<RefinedOptions, DefaultKey>> &
  Partial<Omit<RefinedOptions, DefaultKey>>

// lang utils
// ----------------------------------------------------------------------------------------------------

export type Dictionary = Record<string, any>

export type Identity<T = any> = (raw: T) => T

export function identity<T>(raw: T): T {
  return raw
}

function createFalsableFormatter(input: FormatterInput | false): DateFormatter {
  return input === false ? null : createFormatter(input)
}
