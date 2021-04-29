import { EventApi } from '../api/EventApi'
import { EventRenderRange } from '../component/event-rendering'
import { VUIEvent } from '../vdom'
import { ViewApi } from '../ViewApi'
import { ViewContext } from '../ViewContext'

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
  jsEvent: VUIEvent
  view: ViewApi
}

export type MoreLinkHandler = (arg: MoreLinkArg) => MoreLinkSimpleAction | void

export function buildPublicSeg(
  seg: {
    eventRange?: EventRenderRange, // needed because Seg's prop is optional. why?
    isStart: boolean,
    isEnd: boolean
  },
  context: ViewContext
) {
  let { def, instance, range } = seg.eventRange
  return {
    event: new EventApi(context, def, instance),
    start: context.dateEnv.toDate(range.start),
    end: context.dateEnv.toDate(range.end),
    isStart: seg.isStart,
    isEnd: seg.isEnd,
  }
}
