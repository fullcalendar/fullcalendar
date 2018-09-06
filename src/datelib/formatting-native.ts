import { assignTo } from '../util/object'
import { DateMarker, timeAsMs } from './marker'
import { CalendarSystem } from './calendar-system'
import { Locale } from './locale'
import { DateFormatter, DateFormattingContext, ZonedMarker, formatTimeZoneOffset } from './formatting'


const EXTENDED_SETTINGS_AND_SEVERITIES = {
  week: 3,
  separator: 0, // 0 = not applicable
  omitZeroTime: 0,
  meridiem: 0, // like am/pm
  omitCommas: 0
}
const STANDARD_DATE_PROP_SEVERITIES = {
  timeZoneName: 7,
  era: 6,
  year: 5,
  month: 4,
  day: 2,
  weekday: 2,
  hour: 1,
  minute: 1,
  second: 1
}
const MERIDIEM_RE = /\s*([ap])\.?m\.?/i // eats up leading spaces too
const COMMA_RE = /,/g // we need re for globalness

export class NativeFormatter implements DateFormatter {

  standardSettings: any
  standardDatePropCnt: number
  extendedSettings: any
  severity: number

  constructor(formatSettings) {
    let standardSettings: any = {}
    let extendedSettings: any = {}
    let standardDatePropCnt = 0
    let severity = 0

    for (let name in formatSettings) {
      if (name in EXTENDED_SETTINGS_AND_SEVERITIES) {
        extendedSettings[name] = formatSettings[name]
        severity = Math.max(EXTENDED_SETTINGS_AND_SEVERITIES[name], severity)
      } else {
        standardSettings[name] = formatSettings[name]

        if (name in STANDARD_DATE_PROP_SEVERITIES) {
          standardDatePropCnt++
          severity = Math.max(STANDARD_DATE_PROP_SEVERITIES[name], severity)
        }
      }
    }

    standardSettings.timeZone = 'UTC'

    this.standardSettings = standardSettings
    this.standardDatePropCnt = standardDatePropCnt
    this.extendedSettings = extendedSettings
    this.severity = severity
  }

  format(date: ZonedMarker, context: DateFormattingContext, standardOverrides?) {
    let standardSettings = assignTo({}, standardOverrides || this.standardSettings) // always copy (efficient?)
    let { extendedSettings } = this

    if (this.standardDatePropCnt === 1 && standardSettings.timeZoneName === 'short') {
      return formatTimeZoneOffset(date.timeZoneOffset)
    }
    if (this.standardDatePropCnt === 0 && extendedSettings.week) {
      return formatWeekNumber(
        context.computeWeekNumber(date.marker),
        context.weekLabel,
        context.locale,
        extendedSettings.week
      )
    }

    // if trying to display a timezone but don't have enough information, don't try
    if (
      context.timeZone !== 'UTC' && (
        standardSettings.timeZoneName === 'long' ||
        standardSettings.timeZoneName === 'short' && date.timeZoneOffset == null
      )
    ) {
      delete standardSettings.timeZoneName
    }

    if (extendedSettings.omitZeroTime) {
      if (standardSettings.minute && !date.marker.getUTCMinutes()) {
        delete standardSettings.minute
      }
      if (standardSettings.second && !date.marker.getUTCSeconds()) {
        delete standardSettings.second
      }
    }

    let s = date.marker.toLocaleString(context.locale.codeArg, standardSettings)

    if (
      context.timeZone !== 'UTC' && // the current timezone is something other than UTC
      standardSettings.timeZoneName === 'short' // and want to display the timezone offset
    ) {
      // then inject the timezone offset into the string
      s = s.replace(/UTC|GMT/, formatTimeZoneOffset(date.timeZoneOffset))
    }

    if (extendedSettings.meridiem === false) {
      s = s.replace(MERIDIEM_RE, '').trim()
    } else if (extendedSettings.meridiem === 'narrow') { // a/p
      s = s.replace(MERIDIEM_RE, function(m0, m1) {
        return m1.toLocaleLowerCase()
      })
    } else if (extendedSettings.meridiem === 'short') { // am/pm
      s = s.replace(MERIDIEM_RE, function(m0, m1) {
        return m1.toLocaleLowerCase() + 'm'
      })
    } else if (extendedSettings.meridiem === 'lowercase') { // other meridiem transformers already converted to lowercase
      s = s.replace(MERIDIEM_RE, function(m0) {
        return m0.toLocaleLowerCase()
      })
    }

    if (extendedSettings.omitCommas) {
      s = s.replace(COMMA_RE, '').trim()
    }

    return s
  }

  formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext) {
    let { standardSettings } = this

    let diffSeverity = computeMarkerDiffSeverity(start.marker, end.marker, context.calendarSystem)
    if (!diffSeverity) {
      return this.format(start, context)
    }

    let biggestUnitForPartial = diffSeverity
    if (
      biggestUnitForPartial > 1 && // the two dates are different in a way that's larger scale than time
      (standardSettings.year === 'numeric' || standardSettings.year === '2-digit') &&
      (standardSettings.month === 'numeric' || standardSettings.month === '2-digit') &&
      (standardSettings.day === 'numeric' || standardSettings.day === '2-digit')
    ) {
      biggestUnitForPartial = 1 // make it look like the dates are only different in terms of time
    }

    let full0 = this.format(start, context)
    let full1 = this.format(end, context)

    if (full0 === full1) {
      return full0
    }

    let partialFormatSettings = computePartialFormattingOptions(standardSettings, biggestUnitForPartial)
    let partial0 = this.format(start, context, partialFormatSettings)
    let partial1 = this.format(end, context, partialFormatSettings)

    let insertion = findCommonInsertion(full0, partial0, full1, partial1)
    let separator = this.extendedSettings.separator || ''

    if (insertion) {
      return insertion.before + partial0 + separator + partial1 + insertion.after
    }

    return full0 + separator + full1
  }

  getLargestUnit() {
    switch (this.severity) {
      case 7:
      case 6:
      case 5:
        return 'year'
      case 4:
        return 'month'
      case 3:
        return 'week'
      default:
        return 'day'
    }
  }

}


function formatWeekNumber(num: number, weekLabel: string, locale: Locale, display?: 'numeric' | 'narrow' | 'short'): string {
  let parts = []

  if (display === 'narrow') {
    parts.push(weekLabel)
  } else if (display === 'short') {
    parts.push(weekLabel, ' ')
  }
  // otherwise, considered 'numeric'

  parts.push(locale.simpleNumberFormat.format(num))

  if (locale.options.isRtl) {
    parts.reverse()
  }

  return parts.join('')
}


// Range Formatting Utils

// 0 = exactly the same
// 1 = different by time
// and bigger
function computeMarkerDiffSeverity(d0: DateMarker, d1: DateMarker, ca: CalendarSystem) {
  if (ca.getMarkerYear(d0) !== ca.getMarkerYear(d1)) {
    return 5
  }
  if (ca.getMarkerMonth(d0) !== ca.getMarkerMonth(d1)) {
    return 4
  }
  if (ca.getMarkerDay(d0) !== ca.getMarkerDay(d1)) {
    return 2
  }
  if (timeAsMs(d0) !== timeAsMs(d1)) {
    return 1
  }
  return 0
}

function computePartialFormattingOptions(options, biggestUnit) {
  let partialOptions = {}

  for (let name in options) {
    if (
      !(name in STANDARD_DATE_PROP_SEVERITIES) || // not a date part prop (like timeZone)
      STANDARD_DATE_PROP_SEVERITIES[name] <= biggestUnit
    ) {
      partialOptions[name] = options[name]
    }
  }

  return partialOptions
}

function findCommonInsertion(full0, partial0, full1, partial1) {

  let i0 = 0
  while (i0 < full0.length) {

    let found0 = full0.indexOf(partial0, i0)
    if (found0 === -1) {
      break
    }

    let before0 = full0.substr(0, found0)
    i0 = found0 + partial0.length
    let after0 = full0.substr(i0)

    let i1 = 0
    while (i1 < full1.length) {

      let found1 = full1.indexOf(partial1, i1)
      if (found1 === -1) {
        break
      }

      let before1 = full1.substr(0, found1)
      i1 = found1 + partial1.length
      let after1 = full1.substr(i1)

      if (before0 === before1 && after0 === after1) {
        return {
          before: before0,
          after: after0
        }
      }
    }
  }

  return null
}
