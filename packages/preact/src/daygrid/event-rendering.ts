import { createFormatter } from '../datelib/formatting'
import { DateFormatter } from '@full-ui/headless-calendar'
import { EventRenderRange } from '../component-util/event-rendering'
import { SlicedCoordRange } from '../coord-range'

export const DEFAULT_TABLE_EVENT_TIME_FORMAT: DateFormatter = createFormatter({
  hour: 'numeric',
  minute: '2-digit',
  omitZeroMinute: true,
  meridiem: 'narrow',
})

export function hasListItemDisplay(
  range: SlicedCoordRange,
  eventRange: EventRenderRange,
) {
  let { display } = eventRange.ui

  return display === 'list-item' || (
    display === 'auto' &&
    !eventRange.def.allDay &&
    (range.end - range.start) === 1 && // single-day
    range.isStart && // "
    range.isEnd // "
  )
}
