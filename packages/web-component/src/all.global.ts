import * as Preact from 'preact'
import * as PreactJSXRuntime from 'preact/jsx-runtime'
import * as ProtectedApi from 'fullcalendar/protected-api'
import * as ProtectedStyles from 'fullcalendar/protected-styles'
import * as Interaction from 'fullcalendar/interaction'
import * as DayGrid from 'fullcalendar/daygrid'
import * as TimeGrid from 'fullcalendar/timegrid'
import * as List from 'fullcalendar/list'
import * as MultiMonth from 'fullcalendar/multimonth'
import { FullCalendarElement } from './all'
import './global-types'

// this is an IIFE file

globalThis.FullCalendarElement = FullCalendarElement
customElements.define('full-calendar', FullCalendarElement)

export * from 'fullcalendar/public-api'
export {
  Preact,
  PreactJSXRuntime,
  FullCalendarElement,
  ProtectedApi,
  ProtectedStyles,
  Interaction,
  DayGrid,
  TimeGrid,
  List,
  MultiMonth,
}
