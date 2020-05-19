import { createFormatter } from '@fullcalendar/common'
import { TableSeg } from './TableSeg'


export const DEFAULT_TABLE_EVENT_TIME_FORMAT = createFormatter({
  hour: 'numeric',
  minute: '2-digit',
  omitZeroMinute: true,
  meridiem: 'narrow'
})


export function hasListItemDisplay(seg: TableSeg) {
  let { display } = seg.eventRange.ui
  let isAuto = !display || display === 'auto' // TODO: normalize earlier on

  return display === 'list-item' || (
    isAuto &&
    !seg.eventRange.def.allDay &&
    seg.firstCol === seg.lastCol // can't be multi-day
  )
}
