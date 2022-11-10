import { Dictionary } from '../options.js'
import { EventSourceApi } from './EventSourceApi.js'
import {
  DateInput,
  DurationInput,
  FormatterInput,
} from './structs.js'

export interface EventApi {
  source: EventSourceApi | null
  start: Date | null
  end: Date | null
  startStr: string
  endStr: string
  id: string
  groupId: string
  allDay: boolean
  title: string
  url: string
  display: string // TODO: better
  startEditable: boolean
  durationEditable: boolean
  constraint: any // TODO: better
  overlap: boolean
  allow: any // TODO: better
  backgroundColor: string
  borderColor: string
  textColor: string
  classNames: string[]
  extendedProps: Dictionary

  setProp(name: string, val: any): void
  setExtendedProp(name: string, val: any): void
  setStart(startInput: DateInput, options?: { granularity?: string, maintainDuration?: boolean }): void
  setEnd(endInput: DateInput | null, options?: { granularity?: string }): void
  setDates(startInput: DateInput, endInput: DateInput | null, options?: { allDay?: boolean, granularity?: string }): void
  moveStart(deltaInput: DurationInput): void
  moveEnd(deltaInput: DurationInput): void
  moveDates(deltaInput: DurationInput): void
  setAllDay(allDay: boolean, options?: { maintainDuration?: boolean }): void
  formatRange(formatInput: FormatterInput)
  remove(): void
  toPlainObject(settings?: { collapseExtendedProps?: boolean, collapseColor?: boolean }): Dictionary
  toJSON(): Dictionary
}
