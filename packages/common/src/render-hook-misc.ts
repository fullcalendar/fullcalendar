import { DateMeta } from './component/date-rendering'
import { Duration } from './datelib/duration'
import { ViewApi } from './ViewApi'

export interface SlotLaneHookProps extends Partial<DateMeta> { // TODO: move?
  time?: Duration
  date?: Date
  view: ViewApi
  // this interface is for date-specific slots AND time-general slots. make an OR?
}

export interface SlotLabelHookProps { // TODO: move?
  time: Duration
  date: Date
  view: ViewApi
  text: string
}

export interface AllDayHookProps {
  text: string
  view: ViewApi
}

export interface DayHeaderHookProps extends DateMeta {
  date: Date
  view: ViewApi
  text: string
  [otherProp: string]: any
}
