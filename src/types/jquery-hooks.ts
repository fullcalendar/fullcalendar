import * as moment from 'moment'
import Calendar from '../Calendar'
import View from '../View'
import EventSource from '../models/event-source/EventSource'
import { RangeInput, MomentInput, OptionsInput, EventObjectInput, EventSourceInput } from './input-types'

declare global {

  interface JQueryStatic {
    fullCalendar: object // TODO: more specificity
  }

  interface JQuery {
    fullCalendar(options?: OptionsInput): JQuery // initialization
    fullCalendar(method: 'getCalendar'): Calendar
    fullCalendar(method: 'getView'): View
    fullCalendar(method: 'destroy'): JQuery
    fullCalendar(method: 'option', name: string | object, value?: any): any
    fullCalendar(method: 'isValidViewType', viewType: string): boolean
    fullCalendar(method: 'changeView', viewName: string, dateOrRange?: RangeInput | MomentInput): JQuery
    fullCalendar(method: 'zoomTo', newDate: moment.Moment, viewType?: string): JQuery
    fullCalendar(method: 'prev'): JQuery
    fullCalendar(method: 'next'): JQuery
    fullCalendar(method: 'prevYear'): JQuery
    fullCalendar(method: 'nextYear'): JQuery
    fullCalendar(method: 'today'): JQuery
    fullCalendar(method: 'gotoDate', zonedDateInput: any): JQuery
    fullCalendar(method: 'incrementDate', delta: any): JQuery
    fullCalendar(method: 'getDate'): moment.Moment
    fullCalendar(method: 'render'): JQuery
    fullCalendar(method: 'select', zonedStartInput: MomentInput, zonedEndInput?: MomentInput, resourceId?: string): JQuery
    fullCalendar(method: 'unselect'): JQuery
    fullCalendar(method: 'moment', ...args: any[]): moment.Moment
    fullCalendar(method: 'getNow'): moment.Moment
    fullCalendar(method: 'rerenderEvents'): JQuery
    fullCalendar(method: 'refetchEvents'): JQuery
    fullCalendar(method: 'renderEvents', eventInputs: EventObjectInput[], isSticky?: boolean): JQuery
    fullCalendar(method: 'renderEvent', eventInput: EventObjectInput, isSticky?: boolean): JQuery
    fullCalendar(method: 'removeEvents', legacyQuery?: any): JQuery
    fullCalendar(method: 'clientEvents', legacyQuery: any): any
    fullCalendar(method: 'updateEvents', eventPropsArray: EventObjectInput[]): JQuery
    fullCalendar(method: 'updateEvent', eventProps: EventObjectInput): JQuery
    fullCalendar(method: 'getEventSources'): EventSource
    fullCalendar(method: 'getEventSourceById', id: any): EventSource
    fullCalendar(method: 'addEventSource', sourceInput: EventSourceInput): JQuery
    fullCalendar(method: 'removeEventSources', sourceMultiQuery: any): JQuery
    fullCalendar(method: 'removeEventSource', sourceQuery: any): JQuery
    fullCalendar(method: 'refetchEventSources', sourceMultiQuery: any): JQuery
  }

}
