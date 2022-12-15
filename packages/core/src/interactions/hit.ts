import { DateProfile } from '../DateProfileGenerator.js'
import { DateSpan } from '../structs/date-span.js'
import { Rect } from '../util/geom.js'
import { ViewContext } from '../ViewContext.js'

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
