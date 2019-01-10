/*
Huge thanks to these people:
https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/fullcalendar/index.d.ts
*/

import * as moment from 'moment'
import View from '../View'
import EventSource from '../models/event-source/EventSource'

export type MomentInput = moment.Moment | Date | object | string | number
export type DurationInput = moment.Duration | object | string | number

export interface RangeInput {
  start?: MomentInput
  end?: MomentInput
}

export type ConstraintInput = RangeInput | BusinessHoursInput | 'businessHours'

export interface EventOptionsBase {
  className?: string | string[]
  editable?: boolean
  startEditable?: boolean
  durationEditable?: boolean
  rendering?: string
  overlap?: boolean
  constraint?: ConstraintInput
  color?: string
  backgroundColor?: string
  borderColor?: string
  textColor?: string
}

export interface EventObjectInput extends EventOptionsBase, RangeInput { // used for input and toLegacy output
  _id?: string
  id?: string | number
  title: string
  allDay?: boolean
  url?: string
  source?: EventSource
  [customField: string]: any // non-standard fields
}

export type EventSourceFunction = (start: moment.Moment, end: moment.Moment, timezone: string, callback: ((events: EventObjectInput[]) => void)) => void
export type EventSourceSimpleInput = EventObjectInput[] | EventSourceFunction | string

export interface EventSourceExtendedInput extends EventOptionsBase, JQueryAjaxSettings {
  url?: string
  events?: EventSourceSimpleInput
  allDayDefault?: boolean
  startParam?: string
  endParam?: string
  eventDataTransform?(eventData: any): EventObjectInput
}

export type EventSourceInput = EventSourceSimpleInput | EventSourceExtendedInput

export interface ToolbarInput {
  left?: string
  center?: string
  right?: string
}

export interface CustomButtonInput {
  text: string
  icon?: string
  themeIcon?: string
  bootstrapGlyphicon?: string,
  bootstrapFontAwesome?: string,
  click(element: JQuery): void
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

export interface BusinessHoursInput {
  start?: MomentInput
  end?: MomentInput
  dow?: number[]
}

export interface EventSegment {
  event: EventObjectInput
  start: moment.Moment
  end: moment.Moment
  isStart: boolean
  isEnd: boolean
}

export interface CellInfo {
  date: moment.Moment
  dayEl: JQuery
  moreEl: JQuery
  segs: EventSegment[]
  hiddenSegs: EventSegment[]
}

export interface DropInfo {
  start: moment.Moment
  end: moment.Moment
}

export interface SelectInfo {
  start: moment.Moment
  end: moment.Moment
  resourceId?: string
}

export interface OptionsInputBase {
  header?: boolean | ToolbarInput
  footer?: boolean | ToolbarInput
  customButtons?: { [name: string]: CustomButtonInput }
  buttonIcons?: boolean | ButtonIconsInput
  themeSystem?: 'standard' | 'bootstrap3' | 'bootstrap4' | 'jquery-ui'
  themeButtonIcons?: boolean | ButtonIconsInput
  bootstrapGlyphicons?: boolean | ButtonIconsInput,
  bootstrapFontAwesome?: boolean | ButtonIconsInput,
  firstDay?: number
  isRTL?: boolean
  weekends?: boolean
  hiddenDays?: number[]
  fixedWeekCount?: boolean
  weekNumbers?: boolean
  weekNumbersWithinDays?: boolean
  weekNumberCalculation?: 'local' | 'ISO' | ((m: moment.Moment) => number)
  businessHours?: boolean | BusinessHoursInput | BusinessHoursInput[]
  showNonCurrentDates?: boolean
  height?: number | 'auto' | 'parent' | (() => number)
  contentHeight?: number | 'auto' | (() => number)
  aspectRatio?: number
  handleWindowResize?: boolean
  windowResizeDelay?: number
  eventLimit?: boolean | number
  eventLimitClick?: 'popover' | 'week' | 'day' | string | ((cellinfo: CellInfo, jsevent: Event) => void)
  timezone?: string | boolean
  now?: MomentInput | (() => MomentInput)
  defaultView?: string
  allDaySlot?: boolean
  allDayText?: string
  slotDuration?: DurationInput
  slotLabelFormat?: string
  slotLabelInterval?: DurationInput
  snapDuration?: DurationInput
  scrollTime?: DurationInput
  minTime?: DurationInput
  maxTime?: DurationInput
  slotEventOverlap?: boolean
  listDayFormat?: string | boolean
  listDayAltFormat?: string | boolean
  noEventsMessage?: string
  defaultDate?: MomentInput
  nowIndicator?: boolean
  visibleRange?: ((currentDate: moment.Moment) => RangeInput) | RangeInput
  validRange?: RangeInput
  dateIncrement?: DurationInput
  dateAlignment?: string
  duration?: DurationInput
  dayCount?: number
  locale?: string
  timeFormat?: string
  columnHeader?: boolean
  columnHeaderFormat?: string
  columnHeaderText?: string | ((date: MomentInput) => string)
  columnHeaderHtml?: string | ((date: MomentInput) => string)
  titleFormat?: string
  monthNames?: string[]
  monthNamesShort?: string[]
  dayNames?: string[]
  dayNamesShort?: string[]
  weekNumberTitle?: string
  displayEventTime?: boolean
  displayEventEnd?: boolean
  eventLimitText?: string | ((eventCnt: number) => string)
  dayPopoverFormat?: string
  navLinks?: boolean
  navLinkDayClick?: string | ((date: moment.Moment, jsEvent: Event) => void)
  navLinkWeekClick?: string | ((weekStart: any, jsEvent: Event) => void)
  selectable?: boolean
  selectHelper?: boolean
  unselectAuto?: boolean
  unselectCancel?: string
  selectOverlap?: boolean | ((event: EventObjectInput) => boolean)
  selectConstraint?: ConstraintInput
  selectAllow?: ((selectInfo: SelectInfo) => boolean)
  events?: EventSourceInput
  eventSources?: EventSourceInput[]
  allDayDefault?: boolean
  startParam?: string
  endParam?: string
  lazyFetching?: boolean
  eventColor?: string
  eventBackgroundColor?: string
  eventBorderColor?: string
  eventTextColor?: string
  nextDayThreshold?: DurationInput
  eventOrder?: string | Array<((a: EventObjectInput, b: EventObjectInput) => number) | (string | ((a: EventObjectInput, b: EventObjectInput) => number))>
  eventRenderWait?: number | null
  editable?: boolean
  eventStartEditable?: boolean
  eventDurationEditable?: boolean
  dragRevertDuration?: number
  dragOpacity?: number
  dragScroll?: boolean
  eventOverlap?: boolean | ((stillEvent: EventObjectInput, movingEvent: EventObjectInput) => boolean)
  eventConstraint?: ConstraintInput
  eventAllow?: ((dropInfo: DropInfo, draggedEvent: EventObjectInput) => boolean)
  longPressDelay?: number
  eventLongPressDelay?: number
  droppable?: boolean
  dropAccept?: string | ((draggable: any) => boolean)

  viewRender?(view: View, element: JQuery): void
  viewDestroy?(view: View, element: JQuery): void
  dayRender?(date: moment.Moment, cell: JQuery): void
  windowResize?(view: View): void
  dayClick?(date: moment.Moment, jsEvent: MouseEvent, view: View, resourceObj?): void // resourceObj for Scheduler
  eventClick?(event: EventObjectInput, jsEvent: MouseEvent, view: View): boolean | void
  eventMouseover?(event: EventObjectInput, jsEvent: MouseEvent, view: View): void
  eventMouseout?(event: EventObjectInput, jsEvent: MouseEvent, view: View): void
  select?(start: moment.Moment, end: moment.Moment, jsEvent: MouseEvent, view: View, resource?: any): void
  unselect?(view: View, jsEvent: Event): void
  eventDataTransform?(eventData: any): EventObjectInput
  loading?(isLoading: boolean, view: View): void
  eventRender?(event: EventObjectInput, element: JQuery, view: View): void
  eventAfterRender?(event: EventObjectInput, element: JQuery, view: View): void
  eventAfterAllRender?(view: View): void
  eventDestroy?(event: EventObjectInput, element: JQuery, view: View): void
  eventDragStart?(event: EventObjectInput, jsEvent: MouseEvent, ui: any, view: View): void
  eventDragStop?(event: EventObjectInput, jsEvent: MouseEvent, ui: any, view: View): void
  eventDrop?(event: EventObjectInput, delta: moment.Duration, revertFunc: Function, jsEvent: Event, ui: any, view: View): void
  eventResizeStart?(event: EventObjectInput, jsEvent: MouseEvent, ui: any, view: View): void
  eventResizeStop?(event: EventObjectInput, jsEvent: MouseEvent, ui: any, view: View): void
  eventResize?(event: EventObjectInput, delta: moment.Duration, revertFunc: Function, jsEvent: Event, ui: any, view: View): void
  drop?(date: moment.Moment, jsEvent: MouseEvent, ui: any): void
  eventReceive?(event: EventObjectInput): void
}

export interface ViewOptionsInput extends OptionsInputBase {
  type?: string
  buttonText?: string
}

export interface OptionsInput extends OptionsInputBase {
  buttonText?: ButtonTextCompoundInput
  views?: { [viewId: string]: ViewOptionsInput }
}
