import {
  identity, Identity, ViewApi, EventApi,
  ClassNameGenerator, CustomContentGenerator, DidMountHandler, WillUnmountHandler
} from '@fullcalendar/common'
import { MoreLinkHookProps } from './TableCell'


// TODO: move these types to their own file

export interface EventSegment {
  event: EventApi
  start: Date
  end: Date
  isStart: boolean
  isEnd: boolean
}

export type MoreLinkAction = MoreLinkSimpleAction | MoreLinkHandler
export type MoreLinkSimpleAction = 'popover' | 'week' | 'day' | 'timeGridWeek' | 'timeGridDay' | string
export type MoreLinkHandler = (arg: {
  date: Date,
  allDay: boolean,
  allSegs: EventSegment[],
  hiddenSegs: EventSegment[],
  jsEvent: UIEvent,
  view: ViewApi
}) => MoreLinkSimpleAction


export const OPTION_REFINERS = {
  moreLinkClick: identity as Identity<MoreLinkAction>,
  moreLinkClassNames: identity as Identity<ClassNameGenerator<MoreLinkHookProps>>,
  moreLinkContent: identity as Identity<CustomContentGenerator<MoreLinkHookProps>>,
  moreLinkDidMount: identity as Identity<DidMountHandler<MoreLinkHookProps>>,
  moreLinkWillUnmount: identity as Identity<WillUnmountHandler<MoreLinkHookProps>>,
}


// add types
type ExtraOptionRefiners = typeof OPTION_REFINERS
declare module '@fullcalendar/common' {
  interface BaseOptionRefiners extends ExtraOptionRefiners {}
}
