import { DateMeta } from './component/date-rendering.js'
import { Duration } from './datelib/duration.js'
import { ViewImpl } from './api/ViewImpl.js'
import { MountArg } from './common/render-hook.js'

export interface SlotLaneContentArg extends Partial<DateMeta> { // TODO: move?
  time?: Duration
  date?: Date
  view: ViewImpl
  // this interface is for date-specific slots AND time-general slots. make an OR?
}
export type SlotLaneMountArg = MountArg<SlotLaneContentArg>

export interface SlotLabelContentArg { // TODO: move?
  level: number
  time: Duration
  date: Date
  view: ViewImpl
  text: string
}
export type SlotLabelMountArg = MountArg<SlotLabelContentArg>

export interface AllDayContentArg {
  text: string
  view: ViewImpl
}
export type AllDayMountArg = MountArg<AllDayContentArg>

export interface DayHeaderContentArg extends DateMeta {
  date: Date
  view: ViewImpl
  text: string
  [otherProp: string]: any
}
export type DayHeaderMountArg = MountArg<DayHeaderContentArg>
