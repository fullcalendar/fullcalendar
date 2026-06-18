import { DateTime as LuxonDateTime } from 'luxon'

export function arrayToLuxon(arr: number[], timeZone: string, locale?: string): LuxonDateTime {
  return LuxonDateTime.fromObject({
    year: arr[0],
    month: arr[1] + 1, // convert 0-based to 1-based
    day: arr[2],
    hour: arr[3],
    minute: arr[4],
    second: arr[5],
    millisecond: arr[6],
  }, {
    locale,
    zone: timeZone,
  })
}
