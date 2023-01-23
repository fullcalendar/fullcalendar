import { DateMarker } from './marker.js'
import { padStart } from '../util/misc.js'

// timeZoneOffset is in minutes
export function buildIsoString(marker: DateMarker, timeZoneOffset?: number, stripZeroTime: boolean = false) {
  let s = marker.toISOString()

  s = s.replace('.000', '')

  if (stripZeroTime) {
    s = s.replace('T00:00:00Z', '')
  }

  if (s.length > 10) { // time part wasn't stripped, can add timezone info
    if (timeZoneOffset == null) {
      s = s.replace('Z', '')
    } else if (timeZoneOffset !== 0) {
      s = s.replace('Z', formatTimeZoneOffset(timeZoneOffset, true))
    }
    // otherwise, its UTC-0 and we want to keep the Z
  }

  return s
}

// formats the date, but with no time part
// TODO: somehow merge with buildIsoString and stripZeroTime
// TODO: rename. omit "string"
export function formatDayString(marker: DateMarker) {
  return marker.toISOString().replace(/T.*$/, '')
}

export function formatIsoMonthStr(marker: DateMarker) {
  return marker.toISOString().match(/^\d{4}-\d{2}/)[0]
}

// TODO: use Date::toISOString and use everything after the T?
export function formatIsoTimeString(marker: DateMarker) {
  return padStart(marker.getUTCHours(), 2) + ':' +
    padStart(marker.getUTCMinutes(), 2) + ':' +
    padStart(marker.getUTCSeconds(), 2)
}

export function formatTimeZoneOffset(minutes: number, doIso = false) {
  let sign = minutes < 0 ? '-' : '+'
  let abs = Math.abs(minutes)
  let hours = Math.floor(abs / 60)
  let mins = Math.round(abs % 60)

  if (doIso) {
    return `${sign + padStart(hours, 2)}:${padStart(mins, 2)}`
  }
  return `GMT${sign}${hours}${mins ? `:${padStart(mins, 2)}` : ''}`
}
