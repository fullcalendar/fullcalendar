/*
Huge thanks to these people:
https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/fullcalendar/index.d.ts
*/

import View from '../View'
import { EventSourceInput, EventInputTransformer } from '../structs/event-source'
import { Duration, DurationInput } from '../datelib/duration'
import { DateInput } from '../datelib/env'
import { FormatterInput } from '../datelib/formatting'
import { DateRangeInput } from '../datelib/date-range'
import { BusinessHoursInput } from '../structs/business-hours'
import EventApi from '../api/EventApi'
import { AllowFunc, ConstraintInput, OverlapFunc } from '../validation'
import { PluginDef } from '../plugin-system'
import { LocaleSingularArg, RawLocale } from '../datelib/locale'


export interface ToolbarInput {
  left?: string
  center?: string
  right?: string
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
  prevYear?: string
  nextYear?: string
  today?: string
  month?: string
  week?: string
  day?: string
  [viewId: string]: string | undefined // needed b/c of other optional types
}

export interface EventSegment {
  event: EventApi
  start: Date
  end: Date
  isStart: boolean
  isEnd: boolean
}

export interface CellInfo {
  date: Date
  dayEl: HTMLElement
  moreEl: HTMLElement
  segs: EventSegment[]
  hiddenSegs: EventSegment[]
}

export interface DropInfo {
  start: Date
  end: Date
}

// TODO: refactor OptionsInputBase to split out event handlers into a separate interface,
// which will enable replacing the static list of event handlers below with a simpler
// `keyof OptionsInputBaseEventHandlers`
export type EventHandlerName =
  '_init' | 'selectAllow' | 'eventAllow' | 'eventDataTransform' | 'datesRender' |
  'datesDestroy' | 'dayRender' | 'windowResize' | 'dateClick' | 'eventClick' |
  'eventMouseEnter' | 'eventMouseLeave' | 'select' | 'unselect' | 'loading' |
  'eventRender' | 'eventPositioned' | '_eventsPositioned' | 'eventDestroy' |
  'eventDragStart' | 'eventDragStop' | 'eventDrop' | '_destroyed' | 'drop' |
  'eventResizeStart' | 'eventResizeStop' | 'eventResize' | 'eventReceive' |
  'eventLeave' | 'viewSkeletonRender' | 'viewSkeletonDestroy' | '_noEventDrop' |
  '_noEventResize' | 'eventLimitClick' |
  'resourceRender' // BAD: put in Scheduler somehow

export type EventHandlerArgs<T extends EventHandlerName> =
  Parameters<Extract<OptionsInput[T], (...args: any[]) => any>>
export type EventHandlerArg<T extends EventHandlerName> = EventHandlerArgs<T>[0]

export interface OptionsInputBase {
  header?: boolean | ToolbarInput
  footer?: boolean | ToolbarInput
  customButtons?: { [name: string]: CustomButtonInput }
  buttonIcons?: boolean | ButtonIconsInput
  themeSystem?: 'standard' | string
  bootstrapFontAwesome?: boolean | ButtonIconsInput
  firstDay?: number
  dir?: 'ltr' | 'rtl' | 'auto'
  weekends?: boolean
  hiddenDays?: number[]
  fixedWeekCount?: boolean
  weekNumbers?: boolean
  weekNumbersWithinDays?: boolean
  weekNumberCalculation?: 'local' | 'ISO' | ((m: Date) => number)
  businessHours?: BusinessHoursInput
  showNonCurrentDates?: boolean
  height?: number | 'auto' | 'parent' | (() => number)
  contentHeight?: number | 'auto' | (() => number)
  aspectRatio?: number
  handleWindowResize?: boolean
  windowResizeDelay?: number
  eventLimit?: boolean | number
  eventLimitClick?: 'popover' | 'week' | 'day' | 'timeGridWeek' | 'timeGridDay' | string |
    ((arg: { date: Date, allDay: boolean, dayEl: HTMLElement, moreEl: HTMLElement, segs: any[], hiddenSegs: any[], jsEvent: MouseEvent, view: View }) => void),
  timeZone?: string | boolean
  now?: DateInput | (() => DateInput)
  defaultView?: string
  allDaySlot?: boolean
  allDayText?: string
  slotDuration?: DurationInput
  slotLabelFormat?: FormatterInput
  slotLabelInterval?: DurationInput
  snapDuration?: DurationInput
  scrollTime?: DurationInput
  minTime?: DurationInput
  maxTime?: DurationInput
  slotEventOverlap?: boolean
  listDayFormat?: FormatterInput | boolean
  listDayAltFormat?: FormatterInput | boolean
  noEventsMessage?: string
  defaultDate?: DateInput
  nowIndicator?: boolean
  visibleRange?: ((currentDate: Date) => DateRangeInput) | DateRangeInput
  validRange?: DateRangeInput
  dateIncrement?: DurationInput
  dateAlignment?: string
  duration?: DurationInput
  dayCount?: number
  locales?: RawLocale[]
  locale?: LocaleSingularArg
  eventTimeFormat?: FormatterInput
  columnHeader?: boolean
  columnHeaderFormat?: FormatterInput
  columnHeaderText?: string | ((date: DateInput) => string)
  columnHeaderHtml?: string | ((date: DateInput) => string)
  titleFormat?: FormatterInput
  weekLabel?: string
  displayEventTime?: boolean
  displayEventEnd?: boolean
  eventLimitText?: string | ((eventCnt: number) => string)
  dayPopoverFormat?: FormatterInput
  navLinks?: boolean
  navLinkDayClick?: string | ((date: Date, jsEvent: Event) => void)
  navLinkWeekClick?: string | ((weekStart: any, jsEvent: Event) => void)
  selectable?: boolean
  selectMirror?: boolean
  unselectAuto?: boolean
  unselectCancel?: string
  defaultAllDayEventDuration?: DurationInput
  defaultTimedEventDuration?: DurationInput
  cmdFormatter?: string
  defaultRangeSeparator?: string
  selectConstraint?: ConstraintInput
  selectOverlap?: boolean | OverlapFunc
  selectAllow?: AllowFunc
  editable?: boolean
  eventStartEditable?: boolean
  eventDurationEditable?: boolean
  eventConstraint?: ConstraintInput
  eventOverlap?: boolean | OverlapFunc // allows a function, unlike EventUi
  eventAllow?: AllowFunc
  eventClassName?: string[] | string
  eventClassNames?: string[] | string
  eventBackgroundColor?: string
  eventBorderColor?: string
  eventTextColor?: string
  eventColor?: string
  events?: EventSourceInput
  eventSources?: EventSourceInput[]
  allDayDefault?: boolean
  startParam?: string
  endParam?: string
  lazyFetching?: boolean
  nextDayThreshold?: DurationInput
  eventOrder?: string | Array<((a: EventApi, b: EventApi) => number) | (string | ((a: EventApi, b: EventApi) => number))>
  rerenderDelay?: number | null
  dragRevertDuration?: number
  dragScroll?: boolean
  longPressDelay?: number
  eventLongPressDelay?: number
  droppable?: boolean
  dropAccept?: string | ((draggable: any) => boolean)
  eventDataTransform?: EventInputTransformer
  allDayMaintainDuration?: boolean
  eventResizableFromStart?: boolean
  timeGridEventMinHeight?: number
  allDayHtml?: string
  eventDragMinDistance?: number
  eventSourceFailure?: any
  eventSourceSuccess?: any
  forceEventDuration?: boolean
  progressiveEventRendering?: boolean
  selectLongPressDelay?: number
  selectMinDistance?: number
  timeZoneParam?: string
  titleRangeSeparator?: string
  datesRender?(arg: { view: View, el: HTMLElement }): void
  datesDestroy?(arg: { view: View, el: HTMLElement }): void
  dayRender?(arg: { view: View, date: Date, allDay?: boolean, el: HTMLElement }): void
  windowResize?(view: View): void
  dateClick?(arg: { date: Date, dateStr: string, allDay: boolean, resource?: any, dayEl: HTMLElement, jsEvent: MouseEvent, view: View }): void // resource for Scheduler
  eventClick?(arg: { el: HTMLElement, event: EventApi, jsEvent: MouseEvent, view: View }): boolean | void
  eventMouseEnter?(arg: { el: HTMLElement, event: EventApi, jsEvent: MouseEvent, view: View }): void
  eventMouseLeave?(arg: { el: HTMLElement, event: EventApi, jsEvent: MouseEvent, view: View }): void
  select?(arg: { start: Date, end: Date, startStr: string, endStr: string, allDay: boolean, resource?: any, jsEvent: MouseEvent, view: View }): void // resource for Scheduler
  unselect?(arg: { view: View, jsEvent: Event }): void
  loading?(isLoading: boolean): void
  eventRender?(arg: { isMirror: boolean, isStart: boolean, isEnd: boolean, event: EventApi, el: HTMLElement, view: View }): void
  eventPositioned?(arg: { isMirror: boolean, isStart: boolean, isEnd: boolean, event: EventApi, el: HTMLElement, view: View }): void
  _eventsPositioned?(arg: { view: View }): void
  eventDestroy?(arg: { isMirror: boolean, event: EventApi, el: HTMLElement, view: View }): void
  eventDragStart?(arg: { event: EventApi, el: HTMLElement, jsEvent: MouseEvent, view: View }): void
  eventDragStop?(arg: { event: EventApi, el: HTMLElement, jsEvent: MouseEvent, view: View }): void
  eventDrop?(arg: { el: HTMLElement, event: EventApi, oldEvent: EventApi, delta: Duration, revert: () => void, jsEvent: Event, view: View }): void
  eventResizeStart?(arg: { el: HTMLElement, event: EventApi, jsEvent: MouseEvent, view: View }): void
  eventResizeStop?(arg: { el: HTMLElement, event: EventApi, jsEvent: MouseEvent, view: View }): void
  eventResize?(arg: { el: HTMLElement, startDelta: Duration, endDelta: Duration, prevEvent: EventApi, event: EventApi, revert: () => void, jsEvent: Event, view: View }): void
  drop?(arg: { date: Date, dateStr: string, allDay: boolean, draggedEl: HTMLElement, jsEvent: MouseEvent, view: View }): void
  eventReceive?(arg: { event: EventApi, draggedEl: HTMLElement, view: View }): void
  eventLeave?(arg: { draggedEl: HTMLElement, event: EventApi, view: View }): void
  viewSkeletonRender?(arg: { el: HTMLElement, view: View }): void
  viewSkeletonDestroy?(arg: { el: HTMLElement, view: View }): void
  _destroyed?(): void
  _init?(): void
  _noEventDrop?(): void
  _noEventResize?(): void
  resourceRender?(arg: { resource: any, el: HTMLElement, view: View }): void
}

export interface ViewOptionsInput extends OptionsInputBase {
  type?: string
  buttonText?: string
}

export interface OptionsInput extends OptionsInputBase {
  buttonText?: ButtonTextCompoundInput
  views?: { [viewId: string]: ViewOptionsInput }
  plugins?: (PluginDef | string)[]
}
