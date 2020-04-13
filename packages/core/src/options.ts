import { mergeProps } from './util/object'

export const config = {} as any // TODO: make these options

export const globalDefaults = {

  defaultRangeSeparator: ' - ',
  titleRangeSeparator: ' \u2013 ', // en dash

  defaultTimedEventDuration: '01:00:00',
  defaultAllDayEventDuration: { day: 1 },
  forceEventDuration: false,
  nextDayThreshold: '00:00:00',

  // display
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
  weekNumberCalculation: 'local',

  editable: false,

  // nowIndicator: false,

  scrollTime: '06:00:00',
  slotMinTime: '00:00:00',
  slotMaxTime: '24:00:00',
  showNonCurrentDates: true,

  // event ajax
  lazyFetching: true,
  startParam: 'start',
  endParam: 'end',
  timeZoneParam: 'timeZone',

  timeZone: 'local', // TODO: throw error if given falsy value?

  // defaultAllDay: undefined,

  // locale
  locales: [],
  locale: '', // blank values means it will compute based off locales[]
  // direction: will get this from the default locale
  // buttonIcons: null,

  themeSystem: 'standard',

  // eventResizableFromStart: false,
  dragRevertDuration: 500,
  dragScroll: true,

  allDayMaintainDuration: false,

  // selectable: false,
  unselectAuto: true,
  // selectMinDistance: 0,

  dropAccept: '*',

  eventOrder: 'start,-duration,allDay,title',
  // ^ if start tie, longer events go before shorter. final tie-breaker is title text

  // rerenderDelay: null,

  moreLinkClick: 'popover',
  dayPopoverFormat: { month: 'long', day: 'numeric', year: 'numeric' },

  handleWindowResize: true,
  windowResizeDelay: 100, // milliseconds before an updateSize happens

  longPressDelay: 1000,
  eventDragMinDistance: 5, // only applies to mouse

  expandRows: false

  // dayMinWidth: null
}


let complexOptions = [ // names of options that are objects whose properties should be combined
  'headerToolbar',
  'footerToolbar',
  'buttonText',
  'buttonIcons'
]


// Merges an array of option objects into a single object
export function mergeOptions(optionObjs) {
  return mergeProps(optionObjs, complexOptions)
}
