import { mergeProps } from './util/object'
import { PluginDef } from './plugin-system'
import ArrayEventSourcePlugin from './event-sources/array-event-source'
import FuncEventSourcePlugin from './event-sources/func-event-source'
import JsonFeedEventSourcePlugin from './event-sources/json-feed-event-source'
import SimpleRecurrencePlugin from './structs/recurring-event-simple'
import { capitaliseFirstLetter } from './util/misc'
import DefaultOptionChangeHandlers from './option-change-handlers'

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
  locale: '', // blank values means it will compute based off locales[]
  // dir: will get this from the default locale
  // buttonIcons: null,

  // allows setting a min-height to the event segment to prevent short events overlapping each other
  timeGridEventMinHeight: 0,

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
    // TODO: make RTL support the responibility of the theme
    prev: 'fc-icon-chevron-right',
    next: 'fc-icon-chevron-left',
    prevYear: 'fc-icon-chevrons-right',
    nextYear: 'fc-icon-chevrons-left'
  }
}


let complexOptions = [ // names of options that are objects whose properties should be combined
  'header',
  'footer',
  'buttonText',
  'buttonIcons'
]


// Merges an array of option objects into a single object
export function mergeOptions(optionObjs) {
  return mergeProps(optionObjs, complexOptions)
}



// TODO: move this stuff to a "plugin"-related file...

const INTERNAL_PLUGINS: PluginDef[] = [
  ArrayEventSourcePlugin,
  FuncEventSourcePlugin,
  JsonFeedEventSourcePlugin,
  SimpleRecurrencePlugin,
  DefaultOptionChangeHandlers
]

export function refinePluginDefs(pluginInputs: any[]): PluginDef[] {
  let plugins = []

  for (let pluginInput of pluginInputs) {

    if (typeof pluginInput === 'string') {
      let globalName = 'FullCalendar' + capitaliseFirstLetter(pluginInput)

      if (!window[globalName]) {
        console.warn('Plugin file not loaded for ' + pluginInput)
      } else {
        plugins.push(window[globalName].default) // is an ES6 module
      }

    } else {
      plugins.push(pluginInput)
    }
  }

  return INTERNAL_PLUGINS.concat(plugins)
}
