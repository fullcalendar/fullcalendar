import DateComponent from '../component/DateComponent'
import { DateSpan } from '../structs/date-span'
import { Rect } from '../util/geom'

export interface Hit {
  component: DateComponent<any>
  dateSpan: DateSpan
  dayEl: HTMLElement
  rect: Rect
  layer: number
}
