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
  EventTextInfo,
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
import { isMaybePropsEqualShallow, isMaybePropsEqualDepth1, isMaybeDateRangeInputsEqual } from './util/object'
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
  /**
   * What happens when the user clicks a day nav link: the name of a view to open, or a function
   * receiving the date and native event. By default, the calendar switches to a day view, preferring
   * one that has a toolbar button.
   * @see https://fullcalendar.io/docs/navLinkDayClick
   */
  navLinkDayClick: identity as Identity<string | ((this: CalendarApi, date: Date, jsEvent: UIEvent) => void)>,

  /**
   * What happens when the user clicks a week nav link (a week number): the name of a view to open, or
   * a function receiving the week's start date and native event. By default, the calendar switches to
   * a week view, preferring one that has a toolbar button.
   * @see https://fullcalendar.io/docs/navLinkWeekClick
   */
  navLinkWeekClick: identity as Identity<string | ((this: CalendarApi, weekStart: Date, jsEvent: UIEvent) => void)>,

  /**
   * The exact length of a view's date range, as a Duration such as `{ days: 4 }`. Mainly used to
   * define custom views.
   * @see https://fullcalendar.io/docs/duration
   */
  duration: createDuration,

  /**
   * Custom toolbar buttons, plus overrides for the built-in ones (`today`, `prev`, `next`, view
   * buttons, and so on), keyed by name. Each entry can set the button's text, hint, click handler,
   * icon, and display mode; reference the names in `headerToolbar` or `footerToolbar`.
   * @see https://fullcalendar.io/docs/buttons
   */
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

  /**
   * Custom toolbar elements keyed by name, each a content injection input. Reference the names in
   * `headerToolbar` or `footerToolbar` alongside buttons and `title`.
   * @see https://fullcalendar.io/docs/toolbarElements
   */
  toolbarElements: identity as Identity<{
    [elementName: string]: ToolbarElementInput
  }>,

  /**
   * Text for the toolbar's `prev` button. Defined by the locale; only visible when the button
   * displays text (see `buttonDisplay`).
   */
  prevText: String,

  /**
   * Text for the toolbar's `next` button. Defined by the locale; only visible when the button
   * displays text (see `buttonDisplay`).
   */
  nextText: String,

  /**
   * Text for the toolbar's `prevYear` button. Defined by the locale; only visible when the button
   * displays text (see `buttonDisplay`).
   */
  prevYearText: String,

  /**
   * Text for the toolbar's `nextYear` button. Defined by the locale; only visible when the button
   * displays text (see `buttonDisplay`).
   */
  nextYearText: String,

  /**
   * Text for the toolbar's `today` button. Defined by the locale; only visible when the button
   * displays text (see `buttonDisplay`).
   */
  todayText: String,

  /**
   * Text for the word "year", used for buttons of year-long views and in navigation button hints.
   * Defined by the locale.
   */
  yearText: String,

  /**
   * Text for the word "month", used for buttons of month-long views and in navigation button hints.
   * Defined by the locale.
   */
  monthText: String,

  /**
   * Text for the word "week", used for buttons of week-long views, navigation button hints, and week
   * numbers formatted with `week: 'long'`. Defined by the locale.
   * @see https://fullcalendar.io/docs/weekTextLong
   */
  weekTextLong: String,

  /**
   * The short label for week numbers, such as "W", used when week numbers are formatted with
   * `week: 'short'` or `week: 'narrow'`. Defined by the locale.
   * @see https://fullcalendar.io/docs/weekTextShort
   */
  weekTextShort: String,

  /**
   * Text for the word "day", used for buttons of day-long views and in navigation button hints.
   * Defined by the locale.
   */
  dayText: String,

  /**
   * Text for the toolbar buttons of list views. If `false`, list view buttons use the text of their
   * duration's unit, such as "Week". Defined by the locale.
   */
  listText: identity as Identity<string | false>,

  /**
   * The accessible label for the `today` button. A string where `$0` is replaced by the current
   * unit's text (such as "month"), or a function receiving that text and the unit name. Defined by
   * the locale.
   */
  todayHint: identity as Identity<string | ((currentUnitText: string, currentUnit: string) => string)>,

  /**
   * The accessible label for the `prev` button, and for `prevYear` (with "year" as the text). A
   * string where `$0` is replaced by the current unit's text (such as "month"), or a function
   * receiving that text and the unit name. Defined by the locale.
   */
  prevHint: identity as Identity<string | ((currentUnitText: string, currentUnit: string) => string)>,

  /**
   * The accessible label for the `next` button, and for `nextYear` (with "year" as the text). A
   * string where `$0` is replaced by the current unit's text (such as "month"), or a function
   * receiving that text and the unit name. Defined by the locale.
   */
  nextHint: identity as Identity<string | ((currentUnitText: string, currentUnit: string) => string)>,

  // TODO: make type for hint input

  /**
   * Whether toolbar buttons show an icon, text, or both: `'auto'` (the default; an icon if the theme
   * provides one, otherwise text), `'icon'`, `'text'`, `'icon-text'`, or `'text-icon'`. Individual
   * buttons can override this via `buttons`.
   * @see https://fullcalendar.io/docs/buttonDisplay
   */
  buttonDisplay: identity as Identity<ButtonDisplay>,

  /**
   * Class names for buttons joined with commas in the toolbar setting (e.g. "prev,next"), shown as
   * one group. A string, or a function that receives `ButtonGroupInfo` and returns one.
   * @see https://fullcalendar.io/docs/toolbar-render-hooks
   */
  buttonGroupClass: refineClassNameGenerator as Identity<ClassNameGenerator<ButtonGroupInfo>>,

  /**
   * Class names for a single toolbar button, such as prev, next, today or a view name. A string, or a
   * function that receives `ButtonInfo` and returns one.
   * @see https://fullcalendar.io/docs/toolbar-render-hooks
   */
  buttonClass: refineClassNameGenerator as Identity<ClassNameGenerator<ButtonInfo>>,

  /**
   * The duration assumed for all-day events that have no `end`. The event's actual `end` stays unset
   * unless `forceEventDuration` is `true`.
   * @see https://fullcalendar.io/docs/defaultAllDayEventDuration
   */
  defaultAllDayEventDuration: createDuration,

  /**
   * The duration assumed for timed events that have no `end`. The event's actual `end` stays unset
   * unless `forceEventDuration` is `true`.
   * @see https://fullcalendar.io/docs/defaultTimedEventDuration
   */
  defaultTimedEventDuration: createDuration,

  /**
   * How far a timed event must extend into a day before it is displayed on that day, as a Duration
   * such as `'09:00'`. Applies to day-based layouts like DayGrid, list, and day-slotted timeline
   * views, not TimeGrid.
   * @see https://fullcalendar.io/docs/nextDayThreshold
   */
  nextDayThreshold: createDuration,

  /**
   * The time of day the view is initially scrolled to in time-axis views, as a Duration such as
   * `'08:00'`. Earlier times remain reachable by scrolling.
   * @see https://fullcalendar.io/docs/scrollTime
   */
  scrollTime: createDuration,

  /**
   * Whether the view scrolls back to `scrollTime` each time the date range changes.
   * @see https://fullcalendar.io/docs/scrollTimeReset
   */
  scrollTimeReset: Boolean,

  /**
   * The first time of day displayed in time-axis views, as a Duration such as `'08:00'`. Defaults to
   * midnight.
   * @see https://fullcalendar.io/docs/slotMinTime
   */
  slotMinTime: createDuration,

  /**
   * The time of day at which time-axis views end, as an exclusive Duration such as `'18:00'`.
   * Defaults to `'24:00'`.
   * @see https://fullcalendar.io/docs/slotMaxTime
   */
  slotMaxTime: createDuration,

  /**
   * The date format of the title in the "+more" event popover, as a date formatter.
   * @see https://fullcalendar.io/docs/popoverFormat
   */
  popoverFormat: createFormatter,

  /**
   * The length of each time slot in TimeGrid and timeline views, as a Duration such as `'00:15:00'`.
   * @see https://fullcalendar.io/docs/slotDuration
   */
  slotDuration: createDuration,

  /**
   * The time interval that dragged events and date selections snap to, as a Duration. Defaults to
   * `slotDuration`.
   * @see https://fullcalendar.io/docs/snapDuration
   */
  snapDuration: createDuration,

  /**
   * The buttons and title displayed above the calendar. An object whose `start`, `center`, and
   * `end` properties are strings like `'prev,next today'`. Omit or set `false` for no toolbar.
   * @see https://fullcalendar.io/docs/headerToolbar
   */
  headerToolbar: identity as Identity<ToolbarInput | false>,

  /**
   * The buttons and title displayed below the calendar. Accepts the same values as `headerToolbar`;
   * omit or set `false` for no footer toolbar.
   * @see https://fullcalendar.io/docs/footerToolbar
   */
  footerToolbar: identity as Identity<ToolbarInput | false>,

  /**
   * Whether events without an `end` get one assigned, computed from `defaultTimedEventDuration` or
   * `defaultAllDayEventDuration`.
   * @see https://fullcalendar.io/docs/forceEventDuration
   */
  forceEventDuration: Boolean,

  // TODO: move to timegrid
  /**
   * Class names for one day's vertical column of time slots, where its timed events appear. A string,
   * or a function that receives `DayLaneInfo` and returns one.
   * @see https://fullcalendar.io/docs/day-lane-render-hooks
   */
  dayLaneClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayLaneInfo>>,

  /**
   * Class names for the wrapper inside a day lane that holds its timed events. A string, or a
   * function that receives `DayLaneInfo` and returns one.
   * @see https://fullcalendar.io/docs/day-lane-render-hooks
   */
  dayLaneInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayLaneInfo>>,

  /**
   * Called right after each `dayLane` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/day-lane-render-hooks
   */
  dayLaneDidMount: identity as Identity<DidMountHandler<DayLaneInfo>>,

  /**
   * Called right before each `dayLane` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/day-lane-render-hooks
   */
  dayLaneWillUnmount: identity as Identity<WillUnmountHandler<DayLaneInfo>>,

  /**
   * The view shown when the calendar first loads, such as `'dayGridMonth'` or `'timeGridWeek'`.
   * If omitted, the default view of the first plugin that provides one is used.
   * @see https://fullcalendar.io/docs/initialView
   */
  initialView: String,

  /**
   * The width-to-height ratio of the calendar's view area, used to size the calendar when neither
   * `height` nor `contentHeight` is set. Larger numbers make a shorter calendar.
   * @see https://fullcalendar.io/docs/aspectRatio
   */
  aspectRatio: Number,

  /**
   * Whether to include Saturday and Sunday in the calendar's views.
   * @see https://fullcalendar.io/docs/weekends
   */
  weekends: Boolean,

  /**
   * How week numbers are calculated: `'local'` (the locale's method, the default), `'ISO'`, or a
   * function that receives a Date and returns a week number.
   * @see https://fullcalendar.io/docs/weekNumberCalculation
   */
  weekNumberCalculation: identity as Identity<WeekNumberCalculation>,

  /**
   * Whether to display week numbers: in each row of DayGrid views with more than one row, in the
   * corner of TimeGrid views, and as a header row in timeline views with day or hour slots.
   * @see https://fullcalendar.io/docs/weekNumbers
   */
  weekNumbers: Boolean,

  /**
   * Class names for the corner cell above the time axis that shows the week number, in TimeGrid
   * views. A string, or a function that receives `WeekNumberHeaderInfo` and returns one.
   * @see https://fullcalendar.io/docs/week-number-header-render-hooks
   */
  weekNumberHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<WeekNumberHeaderInfo>>,

  /**
   * Class names for the text wrapper inside the week-number header. A string, or a function that
   * receives `WeekNumberHeaderInfo` and returns one.
   * @see https://fullcalendar.io/docs/week-number-header-render-hooks
   */
  weekNumberHeaderInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<WeekNumberHeaderInfo>>,

  /**
   * Custom content for each `weekNumberHeader` part, injected inside it in place of its default
   * content.
   * @see https://fullcalendar.io/docs/week-number-header-render-hooks
   */
  weekNumberHeaderContent: identity as Identity<ContentGenerator<WeekNumberHeaderInfo>>,

  /**
   * Called right after each `weekNumberHeader` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/week-number-header-render-hooks
   */
  weekNumberHeaderDidMount: identity as Identity<DidMountHandler<WeekNumberHeaderInfo>>,

  /**
   * Called right before each `weekNumberHeader` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/week-number-header-render-hooks
   */
  weekNumberHeaderWillUnmount: identity as Identity<WillUnmountHandler<WeekNumberHeaderInfo>>,

  /**
   * Class names for the week number shown inside the first day cell of each row, in day grids. A
   * string, or a function that receives `InlineWeekNumberInfo` and returns one.
   * @see https://fullcalendar.io/docs/inline-week-number-render-hooks
   */
  inlineWeekNumberClass: refineClassNameGenerator as Identity<ClassNameGenerator<InlineWeekNumberInfo>>,

  /**
   * Custom content for each `inlineWeekNumber` part, injected inside it in place of its default
   * content.
   * @see https://fullcalendar.io/docs/inline-week-number-render-hooks
   */
  inlineWeekNumberContent: identity as Identity<ContentGenerator<InlineWeekNumberInfo>>,

  /**
   * Called right after each `inlineWeekNumber` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/inline-week-number-render-hooks
   */
  inlineWeekNumberDidMount: identity as Identity<DidMountHandler<InlineWeekNumberInfo>>,

  /**
   * Called right before each `inlineWeekNumber` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/inline-week-number-render-hooks
   */
  inlineWeekNumberWillUnmount: identity as Identity<WillUnmountHandler<InlineWeekNumberInfo>>,

  /**
   * Whether events can be dragged and resized. Requires the interaction plugin. Use
   * `eventStartEditable` or `eventDurationEditable` to control each separately.
   * @see https://fullcalendar.io/docs/editable
   */
  editable: Boolean,

  controller: identity as Identity<CalendarController>,

  /**
   * Whether to display a marker at the current time in TimeGrid and timeline views. It repositions
   * itself as time passes.
   * @see https://fullcalendar.io/docs/nowIndicator
   */
  nowIndicator: Boolean,

  /**
   * Whether the now indicator snaps to the start of the current time unit (such as the hour) instead
   * of tracking the exact time. `'auto'` (the default) decides based on the view's slot duration.
   */
  nowIndicatorSnap: identity as Identity<boolean | 'auto'>,

  /**
   * Class names for the marker for the current time on the time axis. A string, or a function that
   * receives `NowIndicatorHeaderInfo` and returns one.
   * @see https://fullcalendar.io/docs/now-indicator-header-render-hooks
   */
  nowIndicatorHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<NowIndicatorHeaderInfo>>,

  /**
   * Content rendered inside each `nowIndicatorHeader` part, which is otherwise empty.
   * @see https://fullcalendar.io/docs/now-indicator-header-render-hooks
   */
  nowIndicatorHeaderContent: identity as Identity<ContentGenerator<NowIndicatorHeaderInfo>>,

  /**
   * Called right after each `nowIndicatorHeader` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/now-indicator-header-render-hooks
   */
  nowIndicatorHeaderDidMount: identity as Identity<DidMountHandler<NowIndicatorHeaderInfo>>,

  /**
   * Called right before each `nowIndicatorHeader` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/now-indicator-header-render-hooks
   */
  nowIndicatorHeaderWillUnmount: identity as Identity<WillUnmountHandler<NowIndicatorHeaderInfo>>,

  /**
   * Class names for the dot on the time axis beside the current-time line. A string only; functions
   * are not accepted.
   * @see https://fullcalendar.io/docs/now-indicator-dot-render-hooks
   */
  nowIndicatorDotClass: refineClassName,

  /**
   * Class names for the line marking the current time across the slots. A string, or a function that
   * receives `NowIndicatorLineInfo` and returns one.
   * @see https://fullcalendar.io/docs/now-indicator-line-render-hooks
   */
  nowIndicatorLineClass: refineClassNameGenerator as Identity<ClassNameGenerator<NowIndicatorLineInfo>>,

  /**
   * Content rendered inside each `nowIndicatorLine` part, which is otherwise empty.
   * @see https://fullcalendar.io/docs/now-indicator-line-render-hooks
   */
  nowIndicatorLineContent: identity as Identity<ContentGenerator<NowIndicatorLineInfo>>,

  /**
   * Called right after each `nowIndicatorLine` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/now-indicator-line-render-hooks
   */
  nowIndicatorLineDidMount: identity as Identity<DidMountHandler<NowIndicatorLineInfo>>,

  /**
   * Called right before each `nowIndicatorLine` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/now-indicator-line-render-hooks
   */
  nowIndicatorLineWillUnmount: identity as Identity<WillUnmountHandler<NowIndicatorLineInfo>>,

  /**
   * In month views, whether to render the dates from the previous and next months that fill out the
   * first and last weeks. When `false`, those cells are blank and show no events.
   * @see https://fullcalendar.io/docs/showNonCurrentDates
   */
  showNonCurrentDates: Boolean,

  /**
   * Whether to fetch events only when the calendar needs dates it has not already fetched. When
   * `false`, events are refetched whenever the view or date range changes.
   * @see https://fullcalendar.io/docs/lazyFetching
   */
  lazyFetching: Boolean,

  /**
   * The name of the query parameter that JSON feed requests use for the start of the requested range.
   * Defaults to `'start'`.
   * @see https://fullcalendar.io/docs/startParam
   */
  startParam: String,

  /**
   * The name of the query parameter that JSON feed requests use for the exclusive end of the
   * requested range. Defaults to `'end'`.
   * @see https://fullcalendar.io/docs/endParam
   */
  endParam: String,

  /**
   * The name of the query parameter that JSON feed requests use for the calendar's time zone. Not
   * sent when `timeZone` is `'local'`. Defaults to `'timeZone'`.
   * @see https://fullcalendar.io/docs/timeZoneParam
   */
  timeZoneParam: String,

  /**
   * The time zone used to display and interpret dates: `'local'` (the default), `'UTC'`, or a
   * named IANA time zone such as `'America/New_York'`.
   * @see https://fullcalendar.io/docs/timeZone
   */
  timeZone: String,

  /**
   * Locale definitions to make available to the calendar, such as imported locale files. The active
   * one is chosen with `locale`.
   * @see https://fullcalendar.io/docs/locale
   */
  locales: identity as Identity<LocaleInput[]>,

  /**
   * The locale used for the calendar's text, date formats, first day of the week, and week numbering.
   * A locale code such as `'es'` (it must be loaded via `locales` or imported globally), or a locale
   * object.
   * @see https://fullcalendar.io/docs/locale
   */
  locale: identity as Identity<LocaleSingularArg>,

  /**
   * How long, in milliseconds, an event takes to animate back to its original position after an
   * unsuccessful drag.
   * @see https://fullcalendar.io/docs/dragRevertDuration
   */
  dragRevertDuration: Number,

  /**
   * Whether scroll containers automatically scroll when the pointer nears their edge while dragging
   * an event or selecting dates.
   * @see https://fullcalendar.io/docs/dragScroll
   */
  dragScroll: Boolean,

  /**
   * Whether an event keeps roughly the same duration when dragged between the all-day section and the
   * time slots. When `false`, its duration resets to `defaultAllDayEventDuration` or
   * `defaultTimedEventDuration`.
   * @see https://fullcalendar.io/docs/allDayMaintainDuration
   */
  allDayMaintainDuration: Boolean,

  /**
   * Whether clicking elsewhere on the page clears the current date selection. See also
   * `unselectCancel`.
   * @see https://fullcalendar.io/docs/unselectAuto
   */
  unselectAuto: Boolean,

  /**
   * Which external draggable elements may be dropped onto the calendar: a CSS selector, or a
   * function that receives the draggable element and returns `true` to accept it.
   * @see https://fullcalendar.io/docs/dropAccept
   */
  dropAccept: identity as Identity<string | ((this: CalendarApi, draggable: any) => boolean)>, // TODO: type draggable

  /**
   * The sort order for events that occupy the same day or time: event field names (prefix with `-`
   * for descending) as a comma-separated string or array, or a comparison function. Defaults to
   * `'start,-duration,allDay,title'`.
   * @see https://fullcalendar.io/docs/eventOrder
   */
  eventOrder: parseFieldSpecs,

  /**
   * Whether to follow `eventOrder` strictly. By default, the order is relaxed when doing so makes the
   * layout more compact.
   * @see https://fullcalendar.io/docs/eventOrderStrict
   */
  eventOrderStrict: Boolean,

  /**
   * Whether a multi-day event in a DayGrid view can be split around a "+more" link. When `false`, the
   * whole event is hidden into the "+more" link if any of its days overflows.
   * @see https://fullcalendar.io/docs/eventSlicing
   */
  eventSlicing: Boolean, // default: true

  /**
   * How events are laid out in TimeGrid views when printing: `'auto'` (the default; stacked in
   * browsers that print positioned elements poorly, such as Firefox), `'stack'`, or `'grid'`.
   * Printing requires the premium adaptive plugin.
   * @see https://fullcalendar.io/docs/eventPrintLayout
   */
  eventPrintLayout: String as Identity<'auto' | 'stack' | 'grid'>,

  /**
   * On touch devices, how long in milliseconds the user must hold down before dragging an event or
   * selecting dates. `eventLongPressDelay` and `selectLongPressDelay` override it for each case.
   * @see https://fullcalendar.io/docs/longPressDelay
   */
  longPressDelay: Number,

  /**
   * How many pixels the mouse must move before an event drag begins.
   * @see https://fullcalendar.io/docs/eventDragMinDistance
   */
  eventDragMinDistance: Number,

  /**
   * Whether the time slots of TimeGrid and resource timeline views stretch to fill the view's height
   * when they would otherwise leave empty space.
   * @see https://fullcalendar.io/docs/expandRows
   */
  expandRows: Boolean,

  /**
   * The height of the whole calendar, including toolbars: a number of pixels, `'auto'` for the
   * natural height with no scrolling, or any CSS value such as `'100%'`. If unset, the height is
   * derived from `contentHeight` or `aspectRatio`.
   * @see https://fullcalendar.io/docs/height
   */
  height: identity as Identity<CssDimValue>,

  /**
   * The height of the calendar's view area, excluding toolbars: a number of pixels, a CSS value, or
   * `'auto'` for the natural height with no scrolling. Ignored if `height` is set.
   * @see https://fullcalendar.io/docs/contentHeight
   */
  contentHeight: identity as Identity<CssDimValue>,

  /**
   * The text direction of the calendar: `'ltr'` or `'rtl'`. Defaults to the locale's direction.
   * @see https://fullcalendar.io/docs/direction
   */
  direction: String as Identity<'ltr' | 'rtl'>,

  /**
   * The calendar's color scheme, such as `'light'` or `'dark'`, applied to its root element,
   * popovers, and drag mirrors as a `data-color-scheme` attribute. If unset, the scheme is inherited
   * from an ancestor's `data-color-scheme` attribute.
   * @see https://fullcalendar.io/docs/color-palettes
   */
  colorScheme: String as Identity<'light' | 'dark' | string | undefined>,

  /**
   * The date format of week number text, as a date formatter such as `{ week: 'narrow' }`. The label
   * comes from `weekTextShort` or `weekTextLong`.
   * @see https://fullcalendar.io/docs/weekNumberFormat
   */
  weekNumberFormat: createFormatter,

  /**
   * Whether the user can resize an event from its starting edge, in addition to its ending edge.
   * @see https://fullcalendar.io/docs/eventResizableFromStart
   */
  eventResizableFromStart: Boolean,

  /**
   * Whether to display the time text of timed events. If unset, each view chooses its own default.
   * @see https://fullcalendar.io/docs/displayEventTime
   */
  displayEventTime: Boolean,

  /**
   * Whether to include the end time in an event's time text. If unset, each view chooses its own
   * default.
   * @see https://fullcalendar.io/docs/displayEventEnd
   */
  displayEventEnd: Boolean,

  /**
   * Whether to render each event source as soon as it arrives, rather than waiting for all sources to
   * finish fetching and rendering them together.
   * @see https://fullcalendar.io/docs/progressiveEventRendering
   */
  progressiveEventRendering: Boolean,

  /**
   * Highlights business hours and dims the rest. `true` uses Monday to Friday, 9am to 5pm; an object
   * or array of objects with `daysOfWeek`, `startTime`, and `endTime` sets custom hours.
   * @see https://fullcalendar.io/docs/businessHours
   */
  businessHours: identity as Identity<BusinessHoursInput>,

  /**
   * The date the calendar displays when it first loads, as anything that parses into a date, such as
   * `'2026-02-01'`. Defaults to today.
   * @see https://fullcalendar.io/docs/initialDate
   */
  initialDate: identity as Identity<DateInput>,

  /**
   * The calendar's current date and time, used for "today" highlighting and the now indicator. A
   * parsable date, or a function returning one. Defaults to the system clock.
   * @see https://fullcalendar.io/docs/now
   */
  now: identity as Identity<DateInput | ((this: CalendarApi) => DateInput)>,

  /**
   * A function that converts each raw event received from an event source into a parsable event
   * object, or returns `false` to discard it. Not called for `addEvent`.
   * @see https://fullcalendar.io/docs/eventDataTransform
   */
  eventDataTransform: identity as Identity<EventInputTransformer>,

  /**
   * Whether the view's date headers stick to the top of the viewport while the page scrolls: `true`,
   * `false`, or `'auto'` (the default; sticky when `height` or `contentHeight` is `'auto'`).
   * @see https://fullcalendar.io/docs/tableHeaderSticky
   */
  tableHeaderSticky: identity as Identity<boolean | 'auto'>,

  /**
   * Whether a view's horizontal scrollbar sticks to the bottom of the viewport while the page
   * scrolls: `true`, `false`, or `'auto'` (the default). It only sticks when `height` or
   * `contentHeight` is `'auto'`, and `'auto'` turns it on in that case.
   * @see https://fullcalendar.io/docs/footerScrollbarSticky
   */
  footerScrollbarSticky: identity as Identity<boolean | 'auto'>,

  /**
   * The `allDay` value assigned to events that do not specify one. If unset, `allDay` is guessed from
   * the event's start and end values.
   * @see https://fullcalendar.io/docs/defaultAllDay
   */
  defaultAllDay: Boolean,

  /**
   * Called when fetching from an event source fails, with an error object. For JSON feeds, the
   * error's `response` property holds the HTTP response.
   * @see https://fullcalendar.io/docs/eventSourceFailure
   */
  eventSourceFailure: identity as Identity<(this: CalendarApi, error: any) => void>,

  /**
   * Called when an event source fetch succeeds, with the raw event data and, for JSON feeds, the HTTP
   * response. It may return a new array of event inputs to use instead.
   * @see https://fullcalendar.io/docs/eventSourceSuccess
   */
  eventSourceSuccess: identity as Identity<(this: CalendarApi, eventsInput: EventInput[], response?: Response) => EventInput[] | void>,

  /**
   * The default rendering style for events: `'auto'`, `'block'`, `'list-item'`, `'background'`,
   * `'inverse-background'`, or `'none'`. Event sources and individual events can override it with
   * their `display` property.
   * @see https://fullcalendar.io/docs/eventDisplay
   */
  eventDisplay: String, // TODO: give more specific

  /**
   * Whether events can be dragged to change their start. Overrides `editable` for dragging; requires
   * the interaction plugin.
   * @see https://fullcalendar.io/docs/eventStartEditable
   */
  eventStartEditable: Boolean,

  /**
   * Whether events can be resized to change their duration. Overrides `editable` for resizing;
   * requires the interaction plugin.
   * @see https://fullcalendar.io/docs/eventDurationEditable
   */
  eventDurationEditable: Boolean,

  /**
   * Whether events being dragged or resized may overlap other events. `true`, `false`, or a function
   * that receives the stationary and moving events and returns whether that overlap is allowed.
   * @see https://fullcalendar.io/docs/eventOverlap
   */
  eventOverlap: identity as Identity<boolean | OverlapFunc>,

  /**
   * Limits where events can be dragged or resized: an event `groupId`, `'businessHours'`, or an
   * object describing a time window or date range that the event must stay within.
   * @see https://fullcalendar.io/docs/eventConstraint
   */
  eventConstraint: identity as Identity<ConstraintInput>,

  /**
   * A function that decides whether an event may be dragged or resized to a given location. It
   * receives the proposed date span and the event, and returns `true` to allow it.
   * @see https://fullcalendar.io/docs/eventAllow
   */
  eventAllow: identity as Identity<AllowFunc>,

  /**
   * The color of all foreground events, as any CSS color. Event sources and individual events can
   * override it with their `color` property.
   * @see https://fullcalendar.io/docs/eventColor
   */
  eventColor: String,

  /**
   * The color used for text and other elements drawn on top of events' color, as any CSS color. Event
   * sources and individual events can override it with their `contrastColor` property.
   * @see https://fullcalendar.io/docs/eventContrastColor
   */
  eventContrastColor: String,

  /**
   * Called right after each `event` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/event-render-hooks
   */
  eventDidMount: identity as Identity<DidMountHandler<EventDisplayInfo>>,

  /**
   * Called right before each `event` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/event-render-hooks
   */
  eventWillUnmount: identity as Identity<WillUnmountHandler<EventDisplayInfo>>,

  /**
   * Custom content for each event, rendered as the content of its `eventInner` element in place of
   * the default time and title.
   * @see https://fullcalendar.io/docs/event-render-hooks
   */
  eventContent: identity as Identity<ContentGenerator<EventDisplayInfo>>,

  /**
   * Class names for every foreground event, in any view. More specific options also apply:
   * `blockEventClass` plus `rowEventClass` or `columnEventClass` for block events, or
   * `listItemEventClass` for list-item events. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/event-render-hooks
   */
  eventClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for the wrapper around an event's time and title. A string, or a function that
   * receives `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/event-render-hooks
   */
  eventInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for an event's time text. A string, or a function that receives `EventTextInfo` and
   * returns one.
   * @see https://fullcalendar.io/docs/event-render-hooks
   */
  eventTimeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventTextInfo>>,

  /**
   * Class names for an event's title text. A string, or a function that receives `EventTextInfo` and
   * returns one.
   * @see https://fullcalendar.io/docs/event-render-hooks
   */
  eventTitleClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventTextInfo>>,

  /**
   * Class names for an element before an event's content, used for decoration and as the start
   * resize handle. Rendered only when it has class names, or content from `rowEventBeforeContent` in
   * row events. A string, or a function that receives `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/event-render-hooks
   */
  eventBeforeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for an element after an event's content, used for decoration and as the end resize
   * handle. Rendered only when it has class names, or content from `rowEventAfterContent` in row
   * events. A string, or a function that receives `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/event-render-hooks
   */
  eventAfterClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  //
  /**
   * Class names for a bullet-point event with a colored dot: single-day timed events in DayGrid
   * views (or any event with `display: 'list-item'`), and every event in list views. A string, or a
   * function that receives `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/list-item-event-render-hooks
   */
  listItemEventClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for the content wrapper of a list item event. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/list-item-event-render-hooks
   */
  listItemEventInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for the time text of a list item event. A string, or a function that receives
   * `EventTextInfo` and returns one.
   * @see https://fullcalendar.io/docs/list-item-event-render-hooks
   */
  listItemEventTimeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventTextInfo>>,

  /**
   * Class names for the title text of a list item event. A string, or a function that receives
   * `EventTextInfo` and returns one.
   * @see https://fullcalendar.io/docs/list-item-event-render-hooks
   */
  listItemEventTitleClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventTextInfo>>,

  /**
   * Class names for the before element of a list item event. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/list-item-event-render-hooks
   */
  listItemEventBeforeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for the after element of a list item event. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/list-item-event-render-hooks
   */
  listItemEventAfterClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  //
  /**
   * Class names for a color-filled rectangular event: every event except list items. A string, or a
   * function that receives `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/block-event-render-hooks
   */
  blockEventClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for the content wrapper of a block event. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/block-event-render-hooks
   */
  blockEventInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for the time text of a block event. A string, or a function that receives
   * `EventTextInfo` and returns one.
   * @see https://fullcalendar.io/docs/block-event-render-hooks
   */
  blockEventTimeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventTextInfo>>,

  /**
   * Class names for the title text of a block event. A string, or a function that receives
   * `EventTextInfo` and returns one.
   * @see https://fullcalendar.io/docs/block-event-render-hooks
   */
  blockEventTitleClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventTextInfo>>,

  /**
   * Class names for the before element of a block event. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/block-event-render-hooks
   */
  blockEventBeforeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for the after element of a block event. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/block-event-render-hooks
   */
  blockEventAfterClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  //
  /**
   * Class names for a horizontal bar event: all-day and multi-day events in day grids, all-day events
   * in time grids, and timeline events. A string, or a function that receives `EventDisplayInfo` and
   * returns one.
   * @see https://fullcalendar.io/docs/row-event-render-hooks
   */
  rowEventClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for the content wrapper of a row event. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/row-event-render-hooks
   */
  rowEventInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for the time text of a row event, when it shows one. A string, or a function that
   * receives `EventTextInfo` and returns one.
   * @see https://fullcalendar.io/docs/row-event-render-hooks
   */
  rowEventTimeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventTextInfo>>,

  /**
   * Class names for the title text of a row event. A string, or a function that receives
   * `EventTextInfo` and returns one.
   * @see https://fullcalendar.io/docs/row-event-render-hooks
   */
  rowEventTitleClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventTextInfo>>,

  /**
   * Whether a row event's title stays in view when the event is partly scrolled out horizontally, for
   * example in timeline views.
   * @see https://fullcalendar.io/docs/row-event-render-hooks
   */
  rowEventTitleSticky: Boolean,

  /**
   * Class names for the before element of a row event. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/row-event-render-hooks
   */
  rowEventBeforeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Content rendered inside each row event's `rowEventBefore` element, which is otherwise empty.
   * @see https://fullcalendar.io/docs/row-event-render-hooks
   */
  rowEventBeforeContent: identity as Identity<ContentGenerator<EventDisplayInfo>>,

  /**
   * Class names for the after element of a row event. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/row-event-render-hooks
   */
  rowEventAfterClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Content rendered inside each row event's `rowEventAfter` element, which is otherwise empty.
   * @see https://fullcalendar.io/docs/row-event-render-hooks
   */
  rowEventAfterContent: identity as Identity<ContentGenerator<EventDisplayInfo>>,

  //
  /**
   * Class names for a vertical event in a day lane: timed events in time grids. A string, or a
   * function that receives `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/column-event-render-hooks
   */
  columnEventClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for the content wrapper of a column event. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/column-event-render-hooks
   */
  columnEventInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for the time text of a column event. A string, or a function that receives
   * `EventTextInfo` and returns one.
   * @see https://fullcalendar.io/docs/column-event-render-hooks
   */
  columnEventTimeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventTextInfo>>,

  /**
   * Class names for the title text of a column event. A string, or a function that receives
   * `EventTextInfo` and returns one.
   * @see https://fullcalendar.io/docs/column-event-render-hooks
   */
  columnEventTitleClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventTextInfo>>,

  /**
   * Whether a column event's title stays in view when the event is partly scrolled out vertically, in
   * TimeGrid views.
   * @see https://fullcalendar.io/docs/column-event-render-hooks
   */
  columnEventTitleSticky: Boolean,

  /**
   * Class names for the before element of a column event. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/column-event-render-hooks
   */
  columnEventBeforeClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for the after element of a column event. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/column-event-render-hooks
   */
  columnEventAfterClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  //
  /**
   * Class names for a background event: shading behind a day or time range. A string, or a function
   * that receives `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/background-event-render-hooks
   */
  backgroundEventClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Called right after each `backgroundEvent` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/background-event-render-hooks
   */
  backgroundEventDidMount: identity as Identity<DidMountHandler<EventDisplayInfo>>,

  /**
   * Called right before each `backgroundEvent` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/background-event-render-hooks
   */
  backgroundEventWillUnmount: identity as Identity<WillUnmountHandler<EventDisplayInfo>>,

  /**
   * Custom content for each `backgroundEvent` part, injected inside it in place of its default
   * content.
   * @see https://fullcalendar.io/docs/background-event-render-hooks
   */
  backgroundEventContent: identity as Identity<ContentGenerator<EventDisplayInfo>>,

  /**
   * Class names for the wrapper inside a background event. A string, or a function that receives
   * `EventDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/background-event-render-hooks
   */
  backgroundEventInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventDisplayInfo>>,

  /**
   * Class names for a background event's title text, where shown. A string, or a function that
   * receives `EventTextInfo` and returns one.
   * @see https://fullcalendar.io/docs/background-event-render-hooks
   */
  backgroundEventTitleClass: refineClassNameGenerator as Identity<ClassNameGenerator<EventTextInfo>>,

  /**
   * The color of all background events, as any CSS color.
   * @see https://fullcalendar.io/docs/backgroundEventColor
   */
  backgroundEventColor: String,

  /**
   * Limits where the user can select dates: an event `groupId`, `'businessHours'`, or an object
   * describing a time window or date range that the selection must stay within.
   * @see https://fullcalendar.io/docs/selectConstraint
   */
  selectConstraint: identity as Identity<ConstraintInput>,

  /**
   * Whether the user may select a range that overlaps events. `true`, `false`, or a function that
   * receives each overlapping event and returns whether that overlap is allowed.
   * @see https://fullcalendar.io/docs/selectOverlap
   */
  selectOverlap: identity as Identity<boolean | OverlapFunc>,

  /**
   * A function that decides whether a potential date selection is allowed. It receives information
   * about the selection and returns `true` to allow it.
   * @see https://fullcalendar.io/docs/selectAllow
   */
  selectAllow: identity as Identity<AllowFunc>,

  /**
   * Whether events dragged from other calendars can be dropped onto this one. Also requires
   * `editable` and the interaction plugin. External draggable elements can be dropped regardless of
   * this setting; filter them with `dropAccept`.
   * @see https://fullcalendar.io/docs/droppable
   */
  droppable: Boolean,

  /**
   * A CSS selector for elements that do not clear the current date selection when clicked, despite
   * `unselectAuto`.
   * @see https://fullcalendar.io/docs/unselectCancel
   */
  unselectCancel: String,

  /**
   * The date format of time slot labels in TimeGrid and timeline views. Timeline views also accept an
   * array of formats, one per header row.
   * @see https://fullcalendar.io/docs/slotHeaderFormat
   */
  slotHeaderFormat: identity as Identity<FormatterInput | FormatterInput[]>,

  /**
   * Class names for one time slot's long strip: across all days in a time grid, down through all
   * resources in a timeline. A string, or a function that receives `SlotLaneInfo` and returns one.
   * @see https://fullcalendar.io/docs/slot-lane-render-hooks
   */
  slotLaneClass: refineClassNameGenerator as Identity<ClassNameGenerator<SlotLaneInfo>>,

  /**
   * Called right after each `slotLane` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/slot-lane-render-hooks
   */
  slotLaneDidMount: identity as Identity<DidMountHandler<SlotLaneInfo>>,

  /**
   * Called right before each `slotLane` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/slot-lane-render-hooks
   */
  slotLaneWillUnmount: identity as Identity<WillUnmountHandler<SlotLaneInfo>>,

  /**
   * Class names for one time label: on the left of a time grid, or along the top of a timeline. A
   * string, or a function that receives `SlotHeaderInfo` and returns one.
   * @see https://fullcalendar.io/docs/slot-header-render-hooks
   */
  slotHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<SlotHeaderInfo>>,

  /**
   * Class names for the text wrapper inside a time label; may be a nav link in timelines. A string,
   * or a function that receives `SlotHeaderInfo` and returns one.
   * @see https://fullcalendar.io/docs/slot-header-render-hooks
   */
  slotHeaderInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<SlotHeaderInfo>>,

  /**
   * Custom content for each `slotHeader` part, injected inside it in place of its default content.
   * @see https://fullcalendar.io/docs/slot-header-render-hooks
   */
  slotHeaderContent: identity as Identity<ContentGenerator<SlotHeaderInfo>>,

  /**
   * Called right after each `slotHeader` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/slot-header-render-hooks
   */
  slotHeaderDidMount: identity as Identity<DidMountHandler<SlotHeaderInfo>>,

  /**
   * Called right before each `slotHeader` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/slot-header-render-hooks
   */
  slotHeaderWillUnmount: identity as Identity<WillUnmountHandler<SlotHeaderInfo>>,

  /**
   * The horizontal alignment of slot header text in timeline views: `'start'`, `'center'`, or
   * `'end'`, or a function of the header's `level` and `isTime` that returns one.
   * @see https://fullcalendar.io/docs/slot-header-render-hooks
   */
  slotHeaderAlign: identity as Identity<'start' | 'center' | 'end' | ((info: { level: number, isTime: boolean }) => 'start' | 'center' | 'end')>,

  /**
   * In timeline views, whether the labels in the upper slot header rows (such as the dates above the
   * times) stay in view while scrolling horizontally. A number or CSS length sets their offset from
   * the edge.
   * @see https://fullcalendar.io/docs/slot-header-render-hooks
   */
  slotHeaderSticky: identity as Identity<boolean | number | string>,

  /**
   * Class names for the row of time labels above a timeline. A string only; functions are not
   * accepted.
   * @see https://fullcalendar.io/docs/slot-header-row-render-hooks
   */
  slotHeaderRowClass: refineClassName,

  /**
   * Class names for the line between the time labels and the slots. A string, or a function of the
   * part's info that returns one.
   * @see https://fullcalendar.io/docs/slot-header-divider-render-hooks
   */
  slotHeaderDividerClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ inTableHeader: boolean, options: { dayMinWidth: number | undefined } }>>,

  /**
   * The maximum number of events to show in a day cell, not counting the "+more" link that reveals
   * the rest in a popover. If `true`, the limit is determined by the height of the cell (in
   * TimeGrid's all-day section, five rows).
   * @see https://fullcalendar.io/docs/dayMaxEvents
   */
  dayMaxEvents: identity as Identity<boolean | number>,

  /**
   * The maximum number of event rows in a day cell, including the "+more" link that reveals the rest
   * in a popover. If `true`, the limit is determined by the height of the cell (in TimeGrid's all-day
   * section, five rows).
   * @see https://fullcalendar.io/docs/dayMaxEventRows
   */
  dayMaxEventRows: identity as Identity<boolean | number>,

  /**
   * A minimum width in pixels for day columns in DayGrid, TimeGrid, and vertical resource views;
   * below it, the view scrolls horizontally. Requires the premium scrollgrid plugin.
   * @see https://fullcalendar.io/docs/dayMinWidth
   */
  dayMinWidth: Number,

  /**
   * How often time slots are labeled, as a Duration such as `'01:00'`. If unset, an interval is
   * computed from `slotDuration`.
   * @see https://fullcalendar.io/docs/slotHeaderInterval
   */
  slotHeaderInterval: createDuration,

  // in core because more-popover needs it
  /**
   * Class names for a header cell naming one day of the week or one date, above its column. Also the
   * date heading in the "+more" popover. A string, or a function that receives `DayHeaderInfo` and
   * returns one.
   * @see https://fullcalendar.io/docs/day-header-render-hooks
   */
  dayHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayHeaderInfo>>,

  /**
   * Class names for the text wrapper inside a day header; may be a nav link. A string, or a function
   * that receives `DayHeaderInfo` and returns one.
   * @see https://fullcalendar.io/docs/day-header-render-hooks
   */
  dayHeaderInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayHeaderInfo>>,

  /**
   * Custom content for each `dayHeader` part, injected inside it in place of its default content.
   * @see https://fullcalendar.io/docs/day-header-render-hooks
   */
  dayHeaderContent: identity as Identity<ContentGenerator<DayHeaderInfo>>,

  /**
   * Called right after each `dayHeader` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/day-header-render-hooks
   */
  dayHeaderDidMount: identity as Identity<DidMountHandler<DayHeaderInfo>>,

  /**
   * Called right before each `dayHeader` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/day-header-render-hooks
   */
  dayHeaderWillUnmount: identity as Identity<WillUnmountHandler<DayHeaderInfo>>,

  /**
   * The horizontal alignment of day header text: `'start'`, `'center'`, or `'end'`, or a function of
   * the header's `level`, `inPopover`, and `isNarrow` that returns one. Themes set their own default.
   * @see https://fullcalendar.io/docs/day-header-render-hooks
   */
  dayHeaderAlign: identity as Identity<'start' | 'center' | 'end' | ((info: { level: number, inPopover: boolean, isNarrow: boolean }) => 'start' | 'center' | 'end')>,

  // stickiness for cell-inner-contents laterally. experimental settings
  _dayHeaderSticky: identity as Identity<boolean | number | string>,

  /**
   * Class names for the row of day headers above the grid. A string only; functions are not accepted.
   * @see https://fullcalendar.io/docs/day-header-row-render-hooks
   */
  dayHeaderRowClass: refineClassName,

  /**
   * Class names for the line between the day headers and the grid body. A string, or a function that
   * receives `DayHeaderDividerInfo` and returns one.
   * @see https://fullcalendar.io/docs/day-header-divider-render-hooks
   */
  dayHeaderDividerClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayHeaderDividerInfo>>,

  /**
   * Class names for one horizontal row of day cells, usually a week. A string only; functions are not
   * accepted.
   * @see https://fullcalendar.io/docs/day-row-render-hooks
   */
  dayRowClass: refineClassName,

  /**
   * Called right after each `dayCell` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/day-cell-render-hooks
   */
  dayCellDidMount: identity as Identity<DidMountHandler<DayCellInfo>>,

  /**
   * Called right before each `dayCell` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/day-cell-render-hooks
   */
  dayCellWillUnmount: identity as Identity<WillUnmountHandler<DayCellInfo>>,

  /**
   * Class names for one day's cell in a day grid, holding its date number and its events. Also the
   * body of the "+more" popover. A string, or a function that receives `DayCellInfo` and returns one.
   * @see https://fullcalendar.io/docs/day-cell-render-hooks
   */
  dayCellClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayCellInfo>>,

  /**
   * Class names for the middle of a day cell, where its events are stacked. A string, or a function
   * that receives `DayCellInfo` and returns one.
   * @see https://fullcalendar.io/docs/day-cell-render-hooks
   */
  dayCellInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayCellInfo>>,

  /**
   * Custom content for each `dayCellTop` part, injected inside it in place of its default content.
   * @see https://fullcalendar.io/docs/day-cell-render-hooks
   */
  dayCellTopContent: identity as Identity<ContentGenerator<DayCellInfo>>,

  /**
   * Class names for the top of a day cell, where the date number appears. A string, or a function
   * that receives `DayCellInfo` and returns one.
   * @see https://fullcalendar.io/docs/day-cell-render-hooks
   */
  dayCellTopClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayCellInfo>>,

  /**
   * Class names for the date number inside a day cell's top; may be a nav link. A string, or a
   * function that receives `DayCellInfo` and returns one.
   * @see https://fullcalendar.io/docs/day-cell-render-hooks
   */
  dayCellTopInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayCellInfo>>,

  /**
   * Class names for the bottom of a day cell, where the "+more" link would sit. A string, or a
   * function that receives `DayCellInfo` and returns one.
   * @see https://fullcalendar.io/docs/day-cell-render-hooks
   */
  dayCellBottomClass: refineClassNameGenerator as Identity<ClassNameGenerator<DayCellInfo>>,

  /**
   * Whether TimeGrid views show the all-day section at the top. When `false`, all-day events are
   * not displayed in those views.
   * @see https://fullcalendar.io/docs/allDaySlot
   */
  allDaySlot: Boolean,

  /**
   * The label for the all-day section of TimeGrid views, also used as the time text of all-day events
   * in list views. Defined by the locale.
   */
  allDayText: String,

  /**
   * Class names for the cell to the left of the all-day row, labeling it ("all-day"). A string, or a
   * function that receives `AllDayHeaderInfo` and returns one.
   * @see https://fullcalendar.io/docs/all-day-header-render-hooks
   */
  allDayHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<AllDayHeaderInfo>>,

  /**
   * Class names for the text wrapper inside the all-day header. A string, or a function that receives
   * `AllDayHeaderInfo` and returns one.
   * @see https://fullcalendar.io/docs/all-day-header-render-hooks
   */
  allDayHeaderInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<AllDayHeaderInfo>>,

  /**
   * Custom content for each `allDayHeader` part, injected inside it in place of its default content.
   * @see https://fullcalendar.io/docs/all-day-header-render-hooks
   */
  allDayHeaderContent: identity as Identity<ContentGenerator<AllDayHeaderInfo>>,

  /**
   * Called right after each `allDayHeader` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/all-day-header-render-hooks
   */
  allDayHeaderDidMount: identity as Identity<DidMountHandler<AllDayHeaderInfo>>,

  /**
   * Called right before each `allDayHeader` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/all-day-header-render-hooks
   */
  allDayHeaderWillUnmount: identity as Identity<WillUnmountHandler<AllDayHeaderInfo>>,

  /**
   * A screen-reader label for the timed section of TimeGrid views. Defined by the locale.
   */
  timedText: String,

  /**
   * The minimum width in pixels of each time slot in timeline views. If unset, a width is computed
   * automatically.
   * @see https://fullcalendar.io/docs/slotMinWidth
   */
  slotMinWidth: Number,

  /**
   * The minimum height in pixels of each time slot in TimeGrid views. Slots are never shorter than
   * their content requires.
   * @see https://fullcalendar.io/docs/slotMinHeight
   */
  slotMinHeight: Number,

  /**
   * Whether day names, dates, and week numbers become links that navigate to a day or week view. Use
   * `navLinkDayClick` and `navLinkWeekClick` to customize the destination.
   * @see https://fullcalendar.io/docs/navLinks
   */
  navLinks: Boolean,

  /**
   * The date format of the time text shown on events, as a date formatter. Each view has its own
   * default.
   * @see https://fullcalendar.io/docs/eventTimeFormat
   */
  eventTimeFormat: createFormatter,

  /**
   * How many milliseconds to wait after a change before rerendering, so that rapid successive changes
   * are batched into one render. Off by default. Ignored by the React and Preact components, which
   * rerender when their framework does.
   * @see https://fullcalendar.io/docs/rerenderDelay
   */
  rerenderDelay: Number, // TODO: move to vanilla right? nah keep here

  /**
   * The text after the count in "+more" links, such as "more" in "+2 more", or a function that
   * receives the count and returns the full text. Defined by the locale.
   */
  moreLinkText: identity as Identity<string | ((this: CalendarApi, num: number) => string)>, // this not enforced :( check others too

  /**
   * The accessible label for "+more" links. A string where `$0` is replaced by the number of hidden
   * events, or a function that receives that number. Defined by the locale.
   * @see https://fullcalendar.io/docs/hints
   */
  moreLinkHint: identity as Identity<string | ((this: CalendarApi, num: number) => string)>,

  /**
   * How many pixels the mouse must move after pressing before a date selection begins. Useful for
   * telling a selection apart from a `dateClick`.
   * @see https://fullcalendar.io/docs/selectMinDistance
   */
  selectMinDistance: Number,

  /**
   * Whether the user can select dates or time slots by clicking and dragging. Requires the
   * interaction plugin.
   * @see https://fullcalendar.io/docs/selectable
   */
  selectable: Boolean,

  /**
   * On touch devices, how long in milliseconds the user must hold down before a date selection
   * begins. Defaults to `longPressDelay`.
   * @see https://fullcalendar.io/docs/selectLongPressDelay
   */
  selectLongPressDelay: Number,

  /**
   * On touch devices, how long in milliseconds the user must hold down on an event before it can be
   * dragged. Defaults to `longPressDelay`.
   * @see https://fullcalendar.io/docs/eventLongPressDelay
   */
  eventLongPressDelay: Number,

  /**
   * Whether to draw a placeholder event while the user drags to select time slots, instead of only
   * highlighting them. Applies to TimeGrid views.
   * @see https://fullcalendar.io/docs/selectMirror
   */
  selectMirror: Boolean,

  /**
   * The maximum number of events stacked side by side in TimeGrid views, or top to bottom in timeline
   * views, before the rest are collapsed into a "+more" link. Unlimited if unset.
   * @see https://fullcalendar.io/docs/eventMaxStack
   */
  eventMaxStack: Number,

  /**
   * The minimum height in pixels of events in TimeGrid views.
   * @see https://fullcalendar.io/docs/eventMinHeight
   */
  eventMinHeight: Number,

  /**
   * The minimum width in pixels of events in timeline views.
   * @see https://fullcalendar.io/docs/eventMinWidth
   */
  eventMinWidth: Number,

  /**
   * The height in pixels below which an event in a TimeGrid view gets its compact "short" layout.
   * @see https://fullcalendar.io/docs/eventShortHeight
   */
  eventShortHeight: Number,

  /**
   * Whether timed events in TimeGrid views may visually overlap one another. When `false`, they are
   * placed fully side by side.
   * @see https://fullcalendar.io/docs/slotEventOverlap
   */
  slotEventOverlap: Boolean,

  /**
   * The day each week begins on, where Sunday is `0`, Monday is `1`, and so on. Defaults to the
   * locale's first day, or Monday when `weekNumberCalculation` is `'ISO'`.
   * @see https://fullcalendar.io/docs/firstDay
   */
  firstDay: Number,

  /**
   * The number of visible days a view displays; days hidden by `weekends` or `hiddenDays` are
   * skipped and not counted. Mainly used to define custom views.
   * @see https://fullcalendar.io/docs/dayCount
   */
  dayCount: Number,

  /**
   * The unit a custom view's start date is aligned to, such as `'week'` or `'month'`. If unset, it is
   * derived from the view's duration; ignored when `visibleRange` is set.
   * @see https://fullcalendar.io/docs/dateAlignment
   */
  dateAlignment: String,

  /**
   * How far the calendar moves when navigating to the previous or next period, as a Duration.
   * Defaults to the view's duration.
   * @see https://fullcalendar.io/docs/dateIncrement
   */
  dateIncrement: createDuration,

  /**
   * Days of the week to hide, as an array of numbers where Sunday is `0`, Monday is `1`, and so on.
   * @see https://fullcalendar.io/docs/hiddenDays
   */
  hiddenDays: identity as Identity<number[]>,

  /**
   * Whether month views always display six weeks. If `false`, each month shows four, five, or six
   * weeks, depending on how many it spans.
   * @see https://fullcalendar.io/docs/fixedWeekCount
   */
  fixedWeekCount: Boolean,

  /**
   * Limits which dates the user can navigate to and where events can be placed: an object with
   * `start` and/or `end` dates, or a function that receives today's date and returns one. Dates
   * outside the range are disabled.
   * @see https://fullcalendar.io/docs/validRange
   */
  validRange: identity as Identity<DateRangeInput | ((this: CalendarApi, nowDate: Date) => DateRangeInput)>, // `this` works?

  /**
   * The exact date range a view displays: an object with `start` and exclusive `end` dates, or a
   * function that receives the calendar's current date (the one navigated to) and returns one.
   * @see https://fullcalendar.io/docs/visibleRange
   */
  visibleRange: identity as Identity<DateRangeInput | ((this: CalendarApi, currentDate: Date) => DateRangeInput)>, // `this` works?

  /**
   * The date format of the toolbar title, as a date formatter. Each view has its own default.
   * @see https://fullcalendar.io/docs/titleFormat
   */
  titleFormat: identity as Identity<FormatterInput>,

  /**
   * Whether events are focusable and keyboard-activatable. When unset, each event's own
   * `interactive` property decides, falling back to whether an `eventClick` handler is defined.
   * Events with a `url` are always interactive.
   * @see https://fullcalendar.io/docs/eventInteractive
   */
  eventInteractive: Boolean,

  // only used by list-view, but languages define the value, so we need it in base options
  /**
   * The message list views display when there are no events in the date range. Defined by the locale.
   * @see https://fullcalendar.io/docs/no-events-render-hooks
   */
  noEventsText: String,

  /**
   * The accessible label for toolbar buttons that switch views. A string where `$0` is replaced by
   * the button text, or a function that receives the button text and view name. Defined by the
   * locale.
   * @see https://fullcalendar.io/docs/hints
   */
  viewHint: identity as Identity<string | ((viewButtonText: string, viewName: string) => string)>,

  /**
   * The accessible label for a toolbar button group made only of view buttons. Defined by the locale.
   */
  viewChangeHint: String, // for the tab container

  /**
   * The accessible label for nav links. A string where `$0` is replaced by the formatted date, or a
   * function that receives that text and the Date. Defined by the locale.
   * @see https://fullcalendar.io/docs/hints
   */
  navLinkHint: identity as Identity<string | ((dateText: string, date: Date) => string)>,

  /**
   * The accessible label for the close button of the "+more" event popover. Defined by the locale.
   * @see https://fullcalendar.io/docs/hints
   */
  closeHint: String,

  /**
   * The accessible label for a group of events, such as each day's events in list views and the
   * events area of timeline views. Defined by the locale.
   */
  eventsHint: String,

  /**
   * The heading level of the toolbar title, applied as `aria-level` (`2` makes it act like an
   * `<h2>`), so it fits the page's heading hierarchy.
   * @see https://fullcalendar.io/docs/headingLevel
   */
  headingLevel: Number,

  /**
   * What happens when the user clicks a "+more" link: `'popover'` (the default), `'week'`, `'day'`, a
   * view name, or a function that receives information about the hidden events and may return one of
   * those values.
   * @see https://fullcalendar.io/docs/moreLinkClick
   */
  moreLinkClick: identity as Identity<MoreLinkAction>,

  /**
   * Custom content for each `moreLink` part, injected inside it in place of its default content.
   * @see https://fullcalendar.io/docs/more-link-render-hooks
   */
  moreLinkContent: identity as Identity<ContentGenerator<MoreLinkInfo>>,

  /**
   * Called right after each `moreLink` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/more-link-render-hooks
   */
  moreLinkDidMount: identity as Identity<DidMountHandler<MoreLinkInfo>>,

  /**
   * Called right before each `moreLink` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/more-link-render-hooks
   */
  moreLinkWillUnmount: identity as Identity<WillUnmountHandler<MoreLinkInfo>>,

  /**
   * Class names for a "+N more" link, shown when a day or slot has more events than fit. A string, or
   * a function that receives `MoreLinkInfo` and returns one.
   * @see https://fullcalendar.io/docs/more-link-render-hooks
   */
  moreLinkClass: refineClassNameGenerator as Identity<ClassNameGenerator<MoreLinkInfo>>,

  /**
   * Class names for the text wrapper inside a "+N more" link. A string, or a function that receives
   * `MoreLinkInfo` and returns one.
   * @see https://fullcalendar.io/docs/more-link-render-hooks
   */
  moreLinkInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<MoreLinkInfo>>,

  //
  /**
   * Class names for a "+N more" link in a row layout: day cells and timeline rows. A string, or a
   * function that receives `MoreLinkInfo` and returns one.
   * @see https://fullcalendar.io/docs/row-more-link-render-hooks
   */
  rowMoreLinkClass: refineClassNameGenerator as Identity<ClassNameGenerator<MoreLinkInfo>>,

  /**
   * Class names for the text wrapper inside a row "+N more" link. A string, or a function that
   * receives `MoreLinkInfo` and returns one.
   * @see https://fullcalendar.io/docs/row-more-link-render-hooks
   */
  rowMoreLinkInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<MoreLinkInfo>>,

  //
  /**
   * Class names for a "+N more" link in a day lane, when too many timed events overlap. A string, or
   * a function that receives `MoreLinkInfo` and returns one.
   * @see https://fullcalendar.io/docs/column-more-link-render-hooks
   */
  columnMoreLinkClass: refineClassNameGenerator as Identity<ClassNameGenerator<MoreLinkInfo>>,

  /**
   * Class names for the text wrapper inside a column "+N more" link. A string, or a function that
   * receives `MoreLinkInfo` and returns one.
   * @see https://fullcalendar.io/docs/column-more-link-render-hooks
   */
  columnMoreLinkInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<MoreLinkInfo>>,

  /**
   * Class names for a date or week number that navigates to that day or week when clicked (with the
   * `navLinks` setting). A string only; functions are not accepted.
   * @see https://fullcalendar.io/docs/navLinkClass
   */
  navLinkClass: refineClassName,

  /**
   * The date format used instead of `dayCellFormat` for the view's first date and the first day of
   * each month, when a DayGrid view spans more than one month.
   * @see https://fullcalendar.io/docs/monthStartFormat
   */
  monthStartFormat: createFormatter,

  /**
   * The date format of the day number in each DayGrid day cell.
   * @see https://fullcalendar.io/docs/dayCellFormat
   */
  dayCellFormat: createFormatter,

  // for connectors
  // (can't be part of plugin system b/c must be provided at runtime)
  handleCustomRendering: identity as Identity<CustomRenderingHandler<any>>,
  customRenderingMetaMap: identity as Identity<{ [optionName: string]: any }>,

  /**
   * Class names for the popover listing every event of a day, opened by a "+N more" link. A string
   * only; functions are not accepted.
   * @see https://fullcalendar.io/docs/popover-render-hooks
   */
  popoverClass: refineClassName,

  /**
   * Class names for the popover's close button. A string only; functions are not accepted.
   * @see https://fullcalendar.io/docs/popover-render-hooks
   */
  popoverCloseClass: refineClassName,

  /**
   * Content rendered inside the popover's close button (the `popoverClose` part), typically an icon.
   * Empty unless a theme provides one.
   * @see https://fullcalendar.io/docs/popover-render-hooks
   */
  popoverCloseContent: identity as Identity<ContentGenerator<{}>>,

  /**
   * The column width in pixels below which day columns switch to their narrow date text and layout.
   * @see https://fullcalendar.io/docs/dayNarrowWidth
   */
  dayNarrowWidth: Number,

  /**
   * Whether to remove the borders around the calendar's outer edge.
   * @see https://fullcalendar.io/docs/borderless
   */
  borderless: Boolean,

  /**
   * Whether to remove the calendar's left and right outer borders. Themes may also indent the
   * toolbars to align with the calendar body.
   * @see https://fullcalendar.io/docs/borderless
   */
  borderlessX: Boolean,

  /**
   * Whether to remove the calendar's top outer border.
   * @see https://fullcalendar.io/docs/borderless
   */
  borderlessTop: Boolean,

  /**
   * Whether to remove the calendar's bottom outer border.
   * @see https://fullcalendar.io/docs/borderless
   */
  borderlessBottom: Boolean,

  /**
   * Class names for an empty spacer that keeps columns aligned, e.g. under resource rows that don't
   * fill the height. A string, or a function of the part's info that returns one.
   * @see https://fullcalendar.io/docs/filler-render-hooks
   */
  fillerClass: refineClassNameGenerator as Identity<ClassNameGenerator<{ inTableHeader: boolean }>>,

  /**
   * Class names for the toolbar above the view. A string, or a function that receives `ToolbarInfo`
   * and returns one.
   * @see https://fullcalendar.io/docs/toolbar-render-hooks
   */
  headerToolbarClass: refineClassNameGenerator as Identity<ClassNameGenerator<ToolbarInfo>>,

  /**
   * Class names for the toolbar below the view. A string, or a function that receives `ToolbarInfo`
   * and returns one.
   * @see https://fullcalendar.io/docs/toolbar-render-hooks
   */
  footerToolbarClass: refineClassNameGenerator as Identity<ClassNameGenerator<ToolbarInfo>>,

  /**
   * Class names for a toolbar, header or footer, holding up to three sections (start, center, end). A
   * string, or a function that receives `ToolbarInfo` and returns one.
   * @see https://fullcalendar.io/docs/toolbar-render-hooks
   */
  toolbarClass: refineClassNameGenerator as Identity<ClassNameGenerator<ToolbarInfo>>,

  /**
   * Class names for one of a toolbar's start, center and end sections. A string, or a function that
   * receives `ToolbarSectionInfo` and returns one.
   * @see https://fullcalendar.io/docs/toolbar-render-hooks
   */
  toolbarSectionClass: refineClassNameGenerator as Identity<ClassNameGenerator<ToolbarSectionInfo>>,

  /**
   * Class names for the title text in a toolbar, usually the current date range. A string only;
   * functions are not accepted.
   * @see https://fullcalendar.io/docs/toolbar-render-hooks
   */
  toolbarTitleClass: refineClassName,

  /**
   * Class names for the grid layout of the view, with a header and a body. Shares the view element in
   * grid and timeline views; in multi-month views, each month has its own. A string, or a function that
   * receives `TableDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/table-render-hooks
   */
  tableClass: refineClassNameGenerator as Identity<ClassNameGenerator<TableDisplayInfo>>,

  /**
   * Class names for the fixed header above the grid: day names, or times in timelines. A string, or a
   * function that receives `TableHeaderInfo` and returns one.
   * @see https://fullcalendar.io/docs/table-render-hooks
   */
  tableHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<TableHeaderInfo>>,

  /**
   * Class names for the scrolling body of the grid, where cells, lanes and events appear. A string,
   * or a function that receives `TableBodyInfo` and returns one.
   * @see https://fullcalendar.io/docs/table-render-hooks
   */
  tableBodyClass: refineClassNameGenerator as Identity<ClassNameGenerator<TableBodyInfo>>,

  /**
   * Class names for shading over times or days outside business hours. A string only; functions are
   * not accepted.
   * @see https://fullcalendar.io/docs/business-hours-render-hooks
   */
  nonBusinessHoursClass: refineClassName,

  /**
   * Class names for the shaded area showing a date range the user is selecting. A string only;
   * functions are not accepted.
   * @see https://fullcalendar.io/docs/highlight-render-hooks
   */
  highlightClass: refineClassName,

  // daygrid-only
  /**
   * Whether to display the row of day headers at the top of DayGrid and TimeGrid views.
   * @see https://fullcalendar.io/docs/dayHeaders
   */
  dayHeaders: Boolean,

  /**
   * The date format of the day headers, as a date formatter. Each view has its own default.
   * @see https://fullcalendar.io/docs/dayHeaderFormat
   */
  dayHeaderFormat: createFormatter,

  // timegrid-only
  /**
   * Class names for the line between the all-day row and the timed slots. A string only; functions
   * are not accepted.
   * @see https://fullcalendar.io/docs/all-day-divider-render-hooks
   */
  allDayDividerClass: refineClassName,

  // list-only
  /**
   * Class names for the container for all of a list view's day sections. A string only; functions are
   * not accepted.
   * @see https://fullcalendar.io/docs/list-day-render-hooks
   */
  listDaysClass: refineClassName,  // rename this?

  /**
   * Class names for one day's section in a list view: its heading and its events. A string, or a
   * function that receives `ListDayInfo` and returns one.
   * @see https://fullcalendar.io/docs/list-day-render-hooks
   */
  listDayClass: refineClassNameGenerator as Identity<ClassNameGenerator<ListDayInfo>>,

  //
  /**
   * The date format of the main text in each list view day header, or `false` to show none.
   * @see https://fullcalendar.io/docs/listDayFormat
   */
  listDayFormat: createFalsableFormatter, // defaults specified in list plugins

  /**
   * The date format of the secondary text in each list view day header, or `false` to show none.
   * @see https://fullcalendar.io/docs/listDayAltFormat
   */
  listDayAltFormat: createFalsableFormatter, // "

  //
  /**
   * Called right after each `listDayHeader` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/list-day-header-render-hooks
   */
  listDayHeaderDidMount: identity as Identity<DidMountHandler<ListDayHeaderInfo>>,

  /**
   * Called right before each `listDayHeader` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/list-day-header-render-hooks
   */
  listDayHeaderWillUnmount: identity as Identity<WillUnmountHandler<ListDayHeaderInfo>>,

  /**
   * Class names for the date heading above a list view day's events. A string, or a function that
   * receives `ListDayHeaderInfo` and returns one.
   * @see https://fullcalendar.io/docs/list-day-header-render-hooks
   */
  listDayHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<ListDayHeaderInfo>>,

  /**
   * Class names for one of the two halves of a list view day heading (day name and date); may be a
   * nav link. A string, or a function that receives `ListDayHeaderInnerInfo` and returns one.
   * @see https://fullcalendar.io/docs/list-day-header-render-hooks
   */
  listDayHeaderInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<ListDayHeaderInnerInfo>>,

  /**
   * Custom content for each text element of a list view day header (the `listDayHeaderInner` parts,
   * one each for `listDayFormat` and `listDayAltFormat`), in place of the formatted date.
   * @see https://fullcalendar.io/docs/list-day-header-render-hooks
   */
  listDayHeaderContent: identity as Identity<ContentGenerator<ListDayHeaderInnerInfo>>,

  //
  /**
   * Class names for the wrapper around one list view day's events. A string, or a function that
   * receives `ListDayEventsInfo` and returns one.
   * @see https://fullcalendar.io/docs/list-day-render-hooks
   */
  listDayBodyClass: refineClassNameGenerator as Identity<ClassNameGenerator<ListDayEventsInfo>>,

  //
  /**
   * Class names for the "No events to display" message in an empty list view. A string, or a function
   * that receives `NoEventsInfo` and returns one.
   * @see https://fullcalendar.io/docs/no-events-render-hooks
   */
  noEventsClass: refineClassNameGenerator as Identity<ClassNameGenerator<NoEventsInfo>>,

  /**
   * Class names for the text wrapper inside the no-events message. A string, or a function that
   * receives `NoEventsInfo` and returns one.
   * @see https://fullcalendar.io/docs/no-events-render-hooks
   */
  noEventsInnerClass: refineClassNameGenerator as Identity<ClassNameGenerator<NoEventsInfo>>,

  /**
   * Custom content for each `noEvents` part, injected inside it in place of its default content.
   * @see https://fullcalendar.io/docs/no-events-render-hooks
   */
  noEventsContent: identity as Identity<ContentGenerator<NoEventsInfo>>,

  /**
   * Called right after each `noEvents` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/no-events-render-hooks
   */
  noEventsDidMount: identity as Identity<DidMountHandler<NoEventsInfo>>,

  /**
   * Called right before each `noEvents` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/no-events-render-hooks
   */
  noEventsWillUnmount: identity as Identity<WillUnmountHandler<NoEventsInfo>>,

  // noEventsText is defined in base options

  // multimonth-only
  /**
   * The maximum number of months per row in multi-month views. Fewer are shown when each month would
   * be narrower than `singleMonthMinWidth`.
   * @see https://fullcalendar.io/docs/multiMonthMaxColumns
   */
  multiMonthMaxColumns: Number,

  //
  /**
   * The minimum width in pixels of each month in multi-month views. When months would be narrower,
   * they wrap onto more rows.
   * @see https://fullcalendar.io/docs/singleMonthMinWidth
   */
  singleMonthMinWidth: Number,

  /**
   * The date format of the title above each month in multi-month views.
   * @see https://fullcalendar.io/docs/singleMonthTitleFormat
   */
  singleMonthTitleFormat: createFormatter,

  /**
   * Called right after each `singleMonth` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/single-month-render-hooks
   */
  singleMonthDidMount: identity as Identity<DidMountHandler<SingleMonthInfo>>,

  /**
   * Called right before each `singleMonth` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/single-month-render-hooks
   */
  singleMonthWillUnmount: identity as Identity<WillUnmountHandler<SingleMonthInfo>>,

  /**
   * Class names for one month's block in multi-month views, with its own header and grid. A string, or
   * a function that receives `SingleMonthInfo` and returns one.
   * @see https://fullcalendar.io/docs/single-month-render-hooks
   */
  singleMonthClass: refineClassNameGenerator as Identity<ClassNameGenerator<SingleMonthInfo>>,

  /**
   * Class names for the month name above each month's grid ("January 2026"). A string, or a function
   * that receives `SingleMonthHeaderInfo` and returns one.
   * @see https://fullcalendar.io/docs/single-month-header-render-hooks
   */
  singleMonthHeaderClass: refineClassNameGenerator as Identity<ClassNameGenerator<SingleMonthHeaderInfo>>,

  /**
   * Class names for the text wrapper inside a month header; may be a nav link. A string, or a
   * function that receives `SingleMonthHeaderInfo` and returns one.
   * @see https://fullcalendar.io/docs/single-month-header-render-hooks
   */
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
  eventSlicing: true,
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
  /**
   * Called after the calendar's date range is first set or changes, such as on navigation or a
   * view switch, once the new dates have rendered.
   * @see https://fullcalendar.io/docs/datesSet
   */
  datesSet: identity as Identity<(info: DatesSetInfo) => void>,

  /**
   * Called after the calendar's events are first loaded or change in any way, with an array of every
   * event in memory (the same as `getEvents()`).
   * @see https://fullcalendar.io/docs/eventsSet
   */
  eventsSet: identity as Identity<(events: EventApi[]) => void>,

  /**
   * Called after an event is added to the calendar, via `addEvent` or by dropping another calendar's
   * event. Not called for external draggable elements (see `eventReceive`). The info includes
   * `revert` to undo the addition.
   * @see https://fullcalendar.io/docs/eventAdd
   */
  eventAdd: identity as Identity<(info: EventAddInfo) => void>,

  /**
   * Called after an event is modified, via its setter methods or by dragging or resizing. The info
   * includes the updated event, the previous `oldEvent`, and `revert` to undo the change.
   * @see https://fullcalendar.io/docs/eventChange
   */
  eventChange: identity as Identity<(info: EventChangeInfo) => void>,

  /**
   * Called after an event is removed from the calendar, via `remove()` or by dragging it to another
   * calendar. The info includes `revert` to undo the removal.
   * @see https://fullcalendar.io/docs/eventRemove
   */
  eventRemove: identity as Identity<(info: EventRemoveInfo) => void>,

  /**
   * Called when the user clicks an event, with the event, its element, the native `jsEvent`, and
   * the view. Call `info.jsEvent.preventDefault()` to stop the browser from following the event's `url`.
   * @see https://fullcalendar.io/docs/eventClick
   */
  eventClick: identity as Identity<(info: EventClickInfo) => void>, // TODO: resource for scheduler????

  /**
   * Called when the pointer moves onto an event, with the event, its element, the native `jsEvent`,
   * and the view.
   * @see https://fullcalendar.io/docs/eventMouseEnter
   */
  eventMouseEnter: identity as Identity<(info: EventHoveringInfo) => void>,

  /**
   * Called when the pointer moves off an event, with the event, its element, the native `jsEvent`,
   * and the view.
   * @see https://fullcalendar.io/docs/eventMouseLeave
   */
  eventMouseLeave: identity as Identity<(info: EventHoveringInfo) => void>,

  /**
   * Called when a date or time range is selected, by the user (requires the interaction plugin and
   * `selectable`) or via the `select()` method. The info includes the range's `start`, exclusive
   * `end`, `allDay`, the native `jsEvent`, and the view.
   * @see https://fullcalendar.io/docs/select-callback
   */
  select: identity as Identity<(info: DateSelectInfo) => void>, // resource for scheduler????

  /**
   * Called when the current date selection is cleared, with an object holding the native `jsEvent`
   * (if any) and the view.
   * @see https://fullcalendar.io/docs/unselect-callback
   */
  unselect: identity as Identity<(info: DateUnselectInfo) => void>,

  /**
   * Called with `true` when the calendar starts fetching events (or resources, with premium resource
   * plugins), and with `false` when all fetching is done.
   * @see https://fullcalendar.io/docs/loading
   */
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
  /**
   * Called when the user clicks a date or time slot. The info includes the clicked `date`, `allDay`,
   * the element, the native `jsEvent`, and the view. Requires the interaction plugin.
   * @see https://fullcalendar.io/docs/dateClick
   */
  dateClick: identity as Identity<(info: DateClickInfo) => void>,

  /**
   * Called when the user starts dragging an event, with the event, the native `jsEvent`, and the
   * view.
   * @see https://fullcalendar.io/docs/eventDragStart
   */
  eventDragStart: identity as Identity<(info: EventDragStartInfo) => void>,

  /**
   * Called when the user stops dragging an event, whether or not it moved, before the event is
   * modified and before `eventDrop`.
   * @see https://fullcalendar.io/docs/eventDragStop
   */
  eventDragStop: identity as Identity<(info: EventDragStopInfo) => void>,

  /**
   * Called when the user drops an event at a different date or time. The info includes the updated
   * event, the previous `oldEvent`, the `delta`, and `revert` to undo the move.
   * @see https://fullcalendar.io/docs/eventDrop
   */
  eventDrop: identity as Identity<(info: EventDropInfo) => void>,

  /**
   * Called when the user starts resizing an event, with the event, the native `jsEvent`, and the
   * view.
   * @see https://fullcalendar.io/docs/eventResizeStart
   */
  eventResizeStart: identity as Identity<(info: EventResizeStartInfo) => void>,

  /**
   * Called when the user stops resizing an event, whether or not it changed, before the event is
   * modified and before `eventResize`.
   * @see https://fullcalendar.io/docs/eventResizeStop
   */
  eventResizeStop: identity as Identity<(info: EventResizeStopInfo) => void>,

  /**
   * Called when the user resizes an event and its duration changes. The info includes the updated
   * event, the previous `oldEvent`, the start and end deltas, and `revert` to undo the resize.
   * @see https://fullcalendar.io/docs/eventResize
   */
  eventResize: identity as Identity<(info: EventResizeDoneInfo) => void>,

  /**
   * Called when an external draggable element, or another calendar's event, is dropped onto the
   * calendar. Requires the interaction plugin.
   * @see https://fullcalendar.io/docs/drop
   */
  drop: identity as Identity<(info: DropInfo) => void>,

  /**
   * Called when an external draggable element with event data, or another calendar's event, is
   * dropped onto the calendar and becomes an event. The info includes `revert` to undo it.
   * @see https://fullcalendar.io/docs/eventReceive
   */
  eventReceive: identity as Identity<(info: EventReceiveInfo) => void>,

  /**
   * Called when one of this calendar's events is dropped onto another calendar, just before it is
   * removed from this one. The info includes `revert` to restore it.
   * @see https://fullcalendar.io/docs/eventLeave
   */
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

  /**
   * Class names for the calendar's root element. A string, or a function that receives
   * `CalendarDisplayInfo` and returns one. Same as `className`.
   * @see https://fullcalendar.io/docs/className
   */
  class: refineClassNameGenerator as Identity<ClassNameGenerator<CalendarDisplayInfo>>,

  /**
   * Class names for the calendar's root element. A string, or a function that receives
   * `CalendarDisplayInfo` and returns one. Same as `class`.
   * @see https://fullcalendar.io/docs/className
   */
  className: refineClassNameGenerator as Identity<ClassNameGenerator<CalendarDisplayInfo>>,

  /**
   * Class names for the view element: everything between the toolbars. A string, or a function that
   * receives `ViewDisplayInfo` and returns one.
   * @see https://fullcalendar.io/docs/view-render-hooks
   */
  viewClass: refineClassNameGenerator as Identity<ClassNameGenerator<ViewDisplayInfo>>,

  /**
   * Called right after each `view` part's element is added to the DOM.
   * @see https://fullcalendar.io/docs/view-render-hooks
   */
  viewDidMount: identity as Identity<DidMountHandler<ViewDisplayInfo>>,

  /**
   * Called right before each `view` part's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/view-render-hooks
   */
  viewWillUnmount: identity as Identity<WillUnmountHandler<ViewDisplayInfo>>,

  /**
   * Per-view settings and custom view definitions, keyed by view name (such as `timeGridWeek`), view
   * type (such as `timeGrid`), or duration unit (such as `week`, for every one-week view). A custom
   * view entry sets `type` plus a duration, visible range, or day count.
   * @see https://fullcalendar.io/docs/view-specific-options
   */
  views: identity as Identity<{ [viewId: string]: ViewOptions }>,

  /**
   * The plugins to load, such as the interaction plugin or premium view plugins.
   * @see https://fullcalendar.io/docs/plugin-index
   */
  plugins: identity as Identity<PluginInput[]>,

  /**
   * Events to load when the calendar initializes, in any form `events` accepts. Unlike `events`,
   * later changes to this value are ignored, so events can then be managed through the API.
   * @see https://fullcalendar.io/docs/initialEvents
   */
  initialEvents: identity as Identity<EventSourceInput>,

  /**
   * The calendar's events: an array of event objects, a JSON feed URL, a function that supplies
   * events, or an event source object.
   * @see https://fullcalendar.io/docs/event-source
   */
  events: identity as Identity<EventSourceInput>,

  /**
   * Multiple event sources, each in any form `events` accepts: an array, a JSON feed URL, a function,
   * or an event source object.
   * @see https://fullcalendar.io/docs/eventSources
   */
  eventSources: identity as Identity<EventSourceInput[]>,
}

type CalendarOnlyOptionRefiners = typeof CALENDAR_ONLY_OPTION_REFINERS
type CalendarOnlyOptions = RawOptionsFromRefiners<CalendarOnlyOptionRefiners>
type CalendarOnlyOptionsRefined = RefinedOptionsFromRefiners<CalendarOnlyOptionRefiners>

// view-specific options
// ---------------------

export const VIEW_ONLY_OPTION_REFINERS = {
  /**
   * The existing view type that a custom view is based on, such as `'timeGrid'` or `'dayGrid'`. Used
   * in a `views` entry along with a duration, visible range, or day count.
   * @see https://fullcalendar.io/docs/custom-view-with-settings
   */
  type: String,

  /**
   * A component that renders a custom view from scratch, written for the UI library of your
   * FullCalendar package (for example React or Preact). Used in a `views` entry.
   * @see https://fullcalendar.io/docs/custom-view-with-js
   */
  component: identity as Identity<ViewComponentType>,

  /**
   * In a `views` entry, class names for the view's root element. A string, or a function that
   * receives `ViewDisplayInfo` and returns one. Same as `className`.
   * @see https://fullcalendar.io/docs/custom-view-with-js
   */
  class: refineClassNameGenerator as Identity<ClassNameGenerator<ViewDisplayInfo>>,

  /**
   * In a `views` entry, class names for the view's root element. A string, or a function that
   * receives `ViewDisplayInfo` and returns one. Same as `class`.
   * @see https://fullcalendar.io/docs/custom-view-with-js
   */
  className: refineClassNameGenerator as Identity<ClassNameGenerator<ViewDisplayInfo>>,

  /**
   * In a `views` entry, renders a custom view from scratch: a content injection input, or a function
   * that receives `ViewContentInfo` (including the view's dates and events) and returns one.
   * @see https://fullcalendar.io/docs/custom-view-with-js
   */
  content: identity as Identity<ContentGenerator<ViewContentInfo>>,

  /**
   * In a `views` entry, called right after the view's element is added to the DOM.
   * @see https://fullcalendar.io/docs/custom-view-with-js
   */
  didMount: identity as Identity<DidMountHandler<ViewDisplayInfo>>,

  /**
   * In a `views` entry, called right before the view's element is removed from the DOM.
   * @see https://fullcalendar.io/docs/custom-view-with-js
   */
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
  // otherwise, an equal-but-new value, like from a React rerender, rebuilds the date profile (#7069)
  validRange: isMaybeDateRangeInputsEqual,
  visibleRange: isMaybeDateRangeInputsEqual,
  hiddenDays: isMaybeArraysEqual,
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

/*
`false` refines to `null`, turning the formatted text off. A nullish input stays `undefined`, for the default.
*/
function createFalsableFormatter(input: FormatterInput | false): DateFormatter {
  if (input === false) {
    return null
  }
  return createFormatter(input) ?? undefined
}
