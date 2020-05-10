import { identity, Identity } from '@fullcalendar/common'
import { DateClickArg } from './interactions/DateClicking'
import { EventDragStartArg, EventDragStopArg, EventDropArg } from './interactions/EventDragging'
import { EventResizeStartArg, EventResizeStopArg, EventResizeDoneArg } from './interactions/EventResizing'
import { DropArg, EventReceiveArg, EventLeaveArg } from './utils'

export const OPTION_REFINERS = {
  dateClick: identity as Identity<(arg: DateClickArg) => void>,
  eventDragStart: identity as Identity<(arg: EventDragStartArg) => void>,
  eventDragStop: identity as Identity<(arg: EventDragStopArg) => void>,
  eventDrop: identity as Identity<(arg: EventDropArg) => void>,
  eventResizeStart: identity as Identity<(arg: EventResizeStartArg) => void>,
  eventResizeStop: identity as Identity<(arg: EventResizeStopArg) => void>,
  eventResize: identity as Identity<(arg: EventResizeDoneArg) => void>,
  drop: identity as Identity<(arg: DropArg) => void>,
  eventReceive: identity as Identity<(arg: EventReceiveArg) => void>,
  eventLeave: identity as Identity<(arg: EventLeaveArg) => void>,
}
