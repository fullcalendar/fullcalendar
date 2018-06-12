import { EventRenderRange } from './event-rendering'

export interface Seg {
  isStart: boolean
  isEnd: boolean
  eventRange?: EventRenderRange
  el?: HTMLElement
  [otherProp: string]: any
}
