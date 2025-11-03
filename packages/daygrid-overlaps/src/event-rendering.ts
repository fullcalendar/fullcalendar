import { createFormatter, DateFormatter } from '@fullcalendar/core/internal'
import { TableSeg } from './TableSeg.js'

export const DEFAULT_TABLE_EVENT_TIME_FORMAT: DateFormatter = createFormatter({
  hour: 'numeric',
  minute: '2-digit',
  omitZeroMinute: true,
  meridiem: 'narrow',
})

export function hasListItemDisplay(seg: TableSeg) {
  let { display } = seg.eventRange.ui

  return display === 'list-item' || (
    display === 'auto' &&
    !seg.eventRange.def.allDay &&
    seg.firstCol === seg.lastCol && // can't be multi-day
    seg.isStart && // "
    seg.isEnd // "
  )
}
