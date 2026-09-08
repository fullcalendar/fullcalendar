import { DateTime as LuxonDateTime } from 'luxon'

// constructing from the exact instant (rather than wall-clock fields) keeps Luxon from
// independently choosing an occurrence for wall-clocks repeated during a DST fold
export function instantToLuxon(instantMs: number, timeZone: string, locale?: string): LuxonDateTime {
  return LuxonDateTime.fromMillis(instantMs, {
    locale,
    zone: timeZone,
  })
}
