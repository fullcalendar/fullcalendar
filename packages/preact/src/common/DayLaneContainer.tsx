import { ViewApi } from '../api/ViewApi'
import { DateMeta } from '../component-util/date-rendering'
import { DateMarker } from '@full-ui/headless-calendar'

export interface DayLaneInfo extends DateMeta {
  date: DateMarker // localized
  isNarrow: boolean
  isStack: boolean
  isMajor: boolean
  view: ViewApi
  [extraProp: string]: any // so can include a resource
}
