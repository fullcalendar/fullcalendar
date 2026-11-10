import { Calendar, CalendarOptions, PluginInput } from 'fullcalendar'
import classicThemePlugin from 'fullcalendar/themes/classic'
import interactionPlugin from 'fullcalendar/interaction'
import dayGridPlugin from 'fullcalendar/daygrid'
import timeGridPlugin from 'fullcalendar/timegrid'
import listPlugin from 'fullcalendar/list'
import multiMonthPlugin from 'fullcalendar/multimonth'
import testPlugin from './test-plugin'

const defaultPlugins: PluginInput[] = [
  interactionPlugin,
  dayGridPlugin,
  timeGridPlugin,
  listPlugin,
  multiMonthPlugin,
  classicThemePlugin,
  testPlugin,
]

let defaultOptions: CalendarOptions = {
  timeZone: 'UTC',
  eventDisplay: 'auto',
  dragRevertDuration: 0, // tests about the revert animation set it explicitly
}

/*
For package-level setup files (ex: premium adds its plugins and license key).
Not for individual tests, which should pass options to initCalendar.
*/
export function addDefaults(plugins: PluginInput[], options: CalendarOptions = {}): void {
  defaultPlugins.push(...plugins)
  defaultOptions = { ...defaultOptions, ...options }
}

/*
Renders a calendar into a new element attached to the body. Teardown destroys it.
Options override the test defaults, except `plugins`, which are added to the default plugins.
*/
export function initCalendar(options: CalendarOptions = {}, el?: HTMLElement): Calendar {
  const calendar = new Calendar(el || createCalendarElement(), {
    ...defaultOptions,
    ...options,
    plugins: [...defaultPlugins, ...(options.plugins || [])],
  })
  calendar.render()
  return calendar
}

const calendarEls: HTMLElement[] = []
const renderedCalendars = new Set<Calendar>()

export function createCalendarElement(): HTMLElement {
  return appendTestElement(document.createElement('div'))
}

/*
Appends an element (ex: an external draggable) to the body. Teardown removes it.
*/
export function appendTestElement<El extends HTMLElement>(el: El): El {
  document.body.appendChild(el)
  calendarEls.push(el)
  return el
}

// Track every rendered calendar, including ones tests construct directly, so teardown can destroy it
const origRender = Calendar.prototype.render
Calendar.prototype.render = function (this: Calendar) {
  renderedCalendars.add(this)
  return origRender.call(this)
}

export function cleanupCalendars(): void {
  for (const calendar of renderedCalendars) {
    calendar.destroy()
  }
  renderedCalendars.clear()

  for (const el of calendarEls) {
    el.remove()
  }
  calendarEls.length = 0
}
