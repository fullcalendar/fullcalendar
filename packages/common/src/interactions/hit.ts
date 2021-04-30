import { DateProfile } from '../DateProfileGenerator'
import { DateSpan } from '../structs/date-span'
import { Rect } from '../util/geom'
import { ViewContext } from '../ViewContext'

export interface Hit {
  componentId?: string // will be set by HitDragging
  context?: ViewContext // will be set by HitDragging
  dateProfile: DateProfile
  dateSpan: DateSpan
  dayEl: HTMLElement
  rect: Rect
  layer: number
  largeUnit?: string // TODO: have timeline set this!
}
