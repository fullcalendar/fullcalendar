import { DateMeta } from './component-util/date-rendering'
import { Duration, DateMarker, DateTimeFormatPartWithWeek } from '@full-ui/headless-calendar'
import { ViewApi } from './api/ViewApi'
export interface SlotLaneInfo extends DateMeta {
  time?: Duration
  isMajor: boolean
  isMinor: boolean
  view: ViewApi
}
export interface SlotHeaderInfo extends SlotLaneInfo {
  level: number
  isTime: boolean
  text: string
  isNarrow: boolean
  hasNavLink: boolean
  isFirst: boolean
}
export interface AllDayHeaderInfo {
  text: string
  view: ViewApi
  isNarrow: boolean
}
export interface DayHeaderInfo extends DateMeta {
  date: Date
  isNarrow: boolean
  isMajor: boolean
  inPopover: boolean
  hasNavLink: boolean
  level: number
  text: string
  textParts: DateTimeFormatPartWithWeek[]
  weekdayText: string
  dayNumberText: string
  view: ViewApi
  [otherProp: string]: any
}
export interface DayHeaderDividerInfo {
  isSticky: boolean
  multiMonthColumns: number
  options: { allDaySlot: boolean }
}

export interface DayCellInfo extends DateMeta {
  date: DateMarker // localized
  isMajor: boolean
  isNarrow: boolean
  inPopover: boolean
  hasNavLink: boolean
  view: ViewApi
  text: string
  textParts: DateTimeFormatPartWithWeek[]
  weekdayText: string
  dayNumberText: string
  monthText: string
  options: { businessHours: boolean }
  [extraProp: string]: any // so can include a resource
}
