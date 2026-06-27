import { createFormatter } from '../datelib/formatting'
import { DateFormatter } from '@full-ui/headless-calendar'
import { EventRangeProps } from '../component-util/event-rendering'
import { SlicedCoordRange } from '../coord-range'

export const DEFAULT_TABLE_EVENT_TIME_FORMAT: DateFormatter = createFormatter({
  hour: 'numeric',
  minute: '2-digit',
  omitZeroMinute: true,
  meridiem: 'narrow',
})

export function hasListItemDisplay(seg: SlicedCoordRange & EventRangeProps) {
  let { display } = seg.eventRange.ui

  return display === 'list-item' || (
    display === 'auto' &&
    !seg.eventRange.def.allDay &&
    (seg.end - seg.start) === 1 && // single-day
    seg.isStart && // "
    seg.isEnd // "
  )
}
