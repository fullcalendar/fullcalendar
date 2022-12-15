import { DateMeta } from './component/date-rendering.js'
import { Duration } from './datelib/duration.js'
import { ViewApi } from './api/ViewApi.js'
import { MountArg } from './common/render-hook.js'

export interface SlotLaneContentArg extends Partial<DateMeta> { // TODO: move?
  time?: Duration
  date?: Date
  view: ViewApi
  // this interface is for date-specific slots AND time-general slots. make an OR?
}
export type SlotLaneMountArg = MountArg<SlotLaneContentArg>

export interface SlotLabelContentArg { // TODO: move?
  level: number
  time: Duration
  date: Date
  view: ViewApi
  text: string
}
export type SlotLabelMountArg = MountArg<SlotLabelContentArg>

export interface AllDayContentArg {
  text: string
  view: ViewApi
}
export type AllDayMountArg = MountArg<AllDayContentArg>

export interface DayHeaderContentArg extends DateMeta {
  date: Date
  view: ViewApi
  text: string
  [otherProp: string]: any
}
export type DayHeaderMountArg = MountArg<DayHeaderContentArg>
