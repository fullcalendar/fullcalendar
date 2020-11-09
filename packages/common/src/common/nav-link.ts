import { formatDayString } from '../datelib/formatting-utils'
import { DateMarker } from '../datelib/marker'

export function buildNavLinkData(date: DateMarker, type = 'day') {
  return JSON.stringify({
    date: formatDayString(date),
    type,
  })
}
