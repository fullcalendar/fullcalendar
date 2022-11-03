import { Seg } from '../component/DateComponent.js'
import { EventApi } from '../api/EventApi.js'
import {
  computeSegDraggable,
  computeSegStartResizable,
  computeSegEndResizable,
  EventContentArg,
} from '../component/event-rendering.js'
import { ViewContext } from '../ViewContext.js'

export interface MinimalEventProps {
  seg: Seg
  isDragging: boolean // rename to isMirrorDragging? make optional?
  isResizing: boolean // rename to isMirrorResizing? make optional?
  isDateSelecting: boolean // rename to isMirrorDateSelecting? make optional?
  isSelected: boolean
  isPast: boolean
  isFuture: boolean
  isToday: boolean
}

interface ExtraStuff {
  timeText: string
  disableDragging?: boolean
  disableResizing?: boolean
}

export function buildEventContentArg(
  props: MinimalEventProps & ExtraStuff,
  context: ViewContext,
): EventContentArg {
  let { seg } = props
  let { eventRange } = seg
  let { ui } = eventRange

  return {
    event: new EventApi(context, eventRange.def, eventRange.instance),
    view: context.viewApi,
    timeText: props.timeText,
    textColor: ui.textColor,
    backgroundColor: ui.backgroundColor,
    borderColor: ui.borderColor,
    isDraggable: !props.disableDragging && computeSegDraggable(seg, context),
    isStartResizable: !props.disableResizing && computeSegStartResizable(seg, context),
    isEndResizable: !props.disableResizing && computeSegEndResizable(seg, context),
    isMirror: Boolean(props.isDragging || props.isResizing || props.isDateSelecting),
    isStart: Boolean(seg.isStart),
    isEnd: Boolean(seg.isEnd),
    isPast: Boolean(props.isPast), // TODO: don't cast. getDateMeta does it
    isFuture: Boolean(props.isFuture), // TODO: don't cast. getDateMeta does it
    isToday: Boolean(props.isToday), // TODO: don't cast. getDateMeta does it
    isSelected: Boolean(props.isSelected),
    isDragging: Boolean(props.isDragging),
    isResizing: Boolean(props.isResizing),
  }
}
