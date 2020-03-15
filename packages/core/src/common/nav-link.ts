import { formatDayString } from '../datelib/formatting'
import { DateMarker } from '../datelib/marker'


export function buildNavLinkData(date: DateMarker, type: string = 'day') {
  return JSON.stringify({
    date: formatDayString(date),
    type
  })
}
