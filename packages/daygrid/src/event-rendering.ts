import { EventRenderRange, diffDays } from '@fullcalendar/core'


export const DEFAULT_TABLE_EVENT_TIME_FORMAT = {
  hour: 'numeric',
  minute: '2-digit',
  omitZeroMinute: true,
  meridiem: 'narrow'
}


export function isDotRendering(eventRange: EventRenderRange) {
  let { rendering } = eventRange.ui
  let isAuto = !rendering || rendering === 'auto' // TODO: normalize earlier on

  return rendering === 'dot' || (
    isAuto &&
    !eventRange.def.allDay &&
      diffDays(eventRange.instance.range.start, eventRange.instance.range.end) <= 1 // TODO: use nextDayThreshold
  )
}
