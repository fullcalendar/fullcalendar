import { EventApi } from '../api/EventApi'
import { ViewApi } from '../api/ViewApi'

export interface EventSegment {
  event: EventApi
  start: Date
  end: Date
  isStart: boolean
  isEnd: boolean
}

export type MoreLinkAction = MoreLinkSimpleAction | MoreLinkHandler
export type MoreLinkSimpleAction = 'popover' | 'week' | 'day' | 'timeGridWeek' | 'timeGridDay' | string

export interface MoreLinkInfo {
  date: Date
  allDay: boolean
  allSegs: EventSegment[]
  hiddenSegs: EventSegment[]
  jsEvent: UIEvent
  view: ViewApi
}

export type MoreLinkHandler = (info: MoreLinkInfo) => MoreLinkSimpleAction | void
