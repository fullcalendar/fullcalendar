import { mergeProps } from './util/object'
import { PluginDef } from './plugin-system'
import ArrayEventSourcePlugin from './event-sources/array-event-source'
import FuncEventSourcePlugin from './event-sources/func-event-source'
import JsonFeedEventSourcePlugin from './event-sources/json-feed-event-source'
import SimpleRecurrencePlugin from './structs/recurring-event-simple'

export const config = {} as any // TODO: make these options

export const globalDefaults = {

  defaultRangeSeparator: ' - ',
  titleRangeSeparator: ' \u2013 ', // en dash

  defaultTimedEventDuration: '01:00:00',
  defaultAllDayEventDuration: { day: 1 },
  forceEventDuration: false,
  nextDayThreshold: '00:00:00',

  // display
  columnHeader: true,
  defaultView: '',
  aspectRatio: 1.35,
  header: {
    left: 'title',
    center: '',
    right: 'today prev,next'
  },
  weekends: true,
  weekNumbers: false,
  weekNumberCalculation: 'local',

  editable: false,

  // nowIndicator: false,

  scrollTime: '06:00:00',
  minTime: '00:00:00',
  maxTime: '24:00:00',
  showNonCurrentDates: true,

  // event ajax
  lazyFetching: true,
  startParam: 'start',
  endParam: 'end',
  timeZoneParam: 'timeZone',

  timeZone: 'local', // TODO: throw error if given falsy value?

  // allDayDefault: undefined,

  // locale
  locales: [],
  locale: 'en',
  // dir: will get this from the default locale
  // buttonIcons: null,

  // allows setting a min-height to the event segment to prevent short events overlapping each other
  timeGridEventMinHeight: 0,

  themeSystem: 'standard',
  // themeButtonIcons: null,

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

  eventLimit: false,
  eventLimitClick: 'popover',
  dayPopoverFormat: { month: 'long', day: 'numeric', year: 'numeric' },

  handleWindowResize: true,
  windowResizeDelay: 100, // milliseconds before an updateSize happens

  longPressDelay: 1000,
  eventDragMinDistance: 5 // only applies to mouse

}


export const rtlDefaults = { // right-to-left defaults
  header: { // TODO: smarter solution (first/center/last ?)
    left: 'next,prev today',
    center: '',
    right: 'title'
  },
  buttonIcons: {
    prev: 'right-single-arrow',
    next: 'left-single-arrow',
    prevYear: 'right-double-arrow',
    nextYear: 'left-double-arrow'
  },
  themeButtonIcons: {
    prev: 'circle-triangle-e',
    next: 'circle-triangle-w',
    nextYear: 'seek-prev',
    prevYear: 'seek-next'
  }
}


let complexOptions = [ // names of options that are objects whose properties should be combined
  'header',
  'footer',
  'buttonText',
  'buttonIcons',
  'themeButtonIcons'
]


// Merges an array of option objects into a single object
export function mergeOptions(optionObjs) {
  return mergeProps(optionObjs, complexOptions)
}


const INTERNAL_PLUGINS: PluginDef[] = [
  ArrayEventSourcePlugin,
  FuncEventSourcePlugin,
  JsonFeedEventSourcePlugin,
  SimpleRecurrencePlugin
]

export function getDefaultPlugins(): PluginDef[] {
  return INTERNAL_PLUGINS.concat(getBrowserGlobalPlugins())
}

function getBrowserGlobalPlugins(): PluginDef[] {
  let globalPluginHash = !config.disableGlobalPlugins && window['FullCalendarPlugins']
  let plugins = []

  if (globalPluginHash) {

    // create predictable order of plugin loading
    // useful because we want daygrid's defaultView to go before other plugins.
    let pluginIds = Object.keys(globalPluginHash)
    pluginIds.sort()

    for (let pluginId of pluginIds) {
      plugins.push(globalPluginHash[pluginId].default)
    }
  }

  return plugins
}
