import { ViewApi } from './ViewApi.js'
import { EventSourceApi } from './EventSourceApi.js'
import { EventApi } from './EventApi.js'
import {
  CalendarOptions,
  CalendarListeners,
  DateInput,
  DurationInput,
  DateRangeInput,
  EventSourceInput,
  EventInput,
  FormatterInput,
} from './structs.js'

export interface CalendarApi {
  view: ViewApi
  updateSize(): void

  // Options
  // -----------------------------------------------------------------------------------------------------------------

  setOption<OptionName extends keyof CalendarOptions>(name: OptionName, val: CalendarOptions[OptionName]): void
  getOption<OptionName extends keyof CalendarOptions>(name: OptionName): CalendarOptions[OptionName]
  getAvailableLocaleCodes(): string[]

  // Trigger
  // -----------------------------------------------------------------------------------------------------------------

  on<ListenerName extends keyof CalendarListeners>(handlerName: ListenerName, handler: CalendarListeners[ListenerName]): void
  off<ListenerName extends keyof CalendarListeners>(handlerName: ListenerName, handler: CalendarListeners[ListenerName]): void
  trigger<ListenerName extends keyof CalendarListeners>(handlerName: ListenerName, ...args: Parameters<CalendarListeners[ListenerName]>): void

  // View
  // -----------------------------------------------------------------------------------------------------------------

  changeView(viewType: string, dateOrRange?: DateRangeInput | DateInput): void
  zoomTo(dateMarker: Date, viewType?: string): void

  // Current Date
  // -----------------------------------------------------------------------------------------------------------------

  prev(): void
  next(): void
  prevYear(): void
  nextYear(): void
  today(): void
  gotoDate(zonedDateInput: DateInput): void
  incrementDate(deltaInput: DurationInput): void
  getDate(): Date

  // Date Formatting Utils
  // -----------------------------------------------------------------------------------------------------------------

  formatDate(d: DateInput, formatter: FormatterInput): string
  formatRange(d0: DateInput, d1: DateInput, settings: any): string // TODO: settings type
  formatIso(d: DateInput, omitTime?: boolean): string

  // Date Selection / Event Selection / DayClick
  // -----------------------------------------------------------------------------------------------------------------

  select(dateOrObj: DateInput | any, endDate?: DateInput): void
  unselect(): void

  // Public Events API
  // -----------------------------------------------------------------------------------------------------------------

  addEvent(eventInput: EventInput, sourceInput?: EventSourceApi | string | boolean): EventApi | null
  getEventById(id: string): EventApi | null
  getEvents(): EventApi[]
  removeAllEvents(): void

  // Public Event Sources API
  // -----------------------------------------------------------------------------------------------------------------

  getEventSources(): EventSourceApi[]
  getEventSourceById(id: string): EventSourceApi | null
  addEventSource(sourceInput: EventSourceInput): EventSourceApi
  removeAllEventSources(): void
  refetchEvents(): void

  // Scroll
  // -----------------------------------------------------------------------------------------------------------------

  scrollToTime(timeInput: DurationInput): void
}
