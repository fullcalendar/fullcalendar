import { EventApi } from '../api/EventApi.js'
import { ViewApi } from '../api/ViewApi.js'

export interface EventSegment {
  event: EventApi
  start: Date
  end: Date
  isStart: boolean
  isEnd: boolean
}

export type MoreLinkAction = MoreLinkSimpleAction | MoreLinkHandler
export type MoreLinkSimpleAction = 'popover' | 'week' | 'day' | 'timeGridWeek' | 'timeGridDay' | string

export interface MoreLinkArg {
  date: Date
  allDay: boolean
  allSegs: EventSegment[]
  hiddenSegs: EventSegment[]
  jsEvent: UIEvent
  view: ViewApi
}

export type MoreLinkHandler = (arg: MoreLinkArg) => MoreLinkSimpleAction | void
