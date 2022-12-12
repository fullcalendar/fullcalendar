import { DateTime as LuxonDateTime } from 'luxon'
import { NamedTimeZoneImpl } from '@fullcalendar/core/internal'
import { arrayToLuxon, luxonToArray } from './convert.js'

export class LuxonNamedTimeZone extends NamedTimeZoneImpl {
  offsetForArray(a: number[]): number {
    return arrayToLuxon(a, this.timeZoneName).offset
  }

  timestampToArray(ms: number): number[] {
    return luxonToArray(
      LuxonDateTime.fromMillis(ms, {
        zone: this.timeZoneName,
      }),
    )
  }
}
