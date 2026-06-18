import { ViewApi } from '../api/ViewApi'
import type { DateTimeFormatPartWithWeek } from '@full-ui/headless-calendar'
import type { DateMeta } from '../component-util/date-rendering'
export interface ListDayInfo extends DateMeta {
  isFirst: boolean
  isLast: boolean
  view: ViewApi
}

export interface ListDayHeaderInfo extends DateMeta {
  view: ViewApi
}
export interface ListDayEventsInfo extends DateMeta {
  view: ViewApi
}

export interface ListDayHeaderInnerInfo extends DateMeta {
  text: string
  textParts: DateTimeFormatPartWithWeek[]
  weekdayText: string
  dayNumberText: string
  hasNavLink: boolean
  level: number // 0 for listDayFormat, 1 for listDayAltFormat
  view: ViewApi
}
