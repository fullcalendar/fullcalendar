import { assignTo } from '../util/object'
import { DateMarker, timeAsMs } from './marker'
import { CalendarSystem } from './calendar-system'
import { Locale } from './locale'
import { DateFormatter, DateFormattingContext, ZonedMarker, formatTimeZoneOffset } from './formatting'


const STANDARD_DATE_PROP_RE = /^(weekday|era|year|month|day|hour|minute|second|timeZoneName)$/
const DEFAULT_SEPARATOR = ' - '
const EXTENDED_SETTINGS = {
  separator: null,
  fake: function(s) {
    return s.toLowerCase() + ' --- test'
  }
}


export class NativeFormatter implements DateFormatter {

  standardSettings: any
  extendedSettings: any
  transformations: any
  datePropCnt: number

  constructor(formatSettings) {
    let standardSettings: any = {}
    let extendedSettings: any = {}
    let transformations = []
    let datePropCnt = 0

    for (let name in formatSettings) {
      if (typeof EXTENDED_SETTINGS[name] === 'function') {
        transformations.push(formatSettings[name])
      } else if (EXTENDED_SETTINGS[name]) {
        extendedSettings[name] = formatSettings[name]
      } else {
        standardSettings[name] = formatSettings[name]

        if (STANDARD_DATE_PROP_RE.test(name)) {
          datePropCnt++
        }
      }
    }

    standardSettings.timeZone = 'UTC'

    this.standardSettings = standardSettings
    this.extendedSettings = extendedSettings
    this.transformations = transformations
    this.datePropCnt = datePropCnt
  }

  format(date: ZonedMarker, context: DateFormattingContext, standardOverrides?) {
    let standardSettings = standardOverrides || this.standardSettings
    let { extendedSettings, transformations } = this

    if (this.datePropCnt === 1) {
      if (standardSettings.timeZoneName === 'short') {
        return formatTimeZoneOffset(date.timeZoneOffset)
      }
      if (extendedSettings.week) {
        return formatWeekNumber(
          context.computeWeekNumber(date.marker),
          context.locale,
          extendedSettings.week
        )
      }
    }

    // if trying to display a timezone but don't have enough information, don't try
    if (
      context.timeZone !== 'UTC' && (
        standardSettings.timeZoneName === 'long' ||
        standardSettings.timeZoneName === 'short' && date.timeZoneOffset == null
      )
    ) {
      standardSettings = assignTo({}, standardSettings) // copy
      delete standardSettings.timeZoneName
    }

    let s = date.marker.toLocaleString(context.locale.codeArg, standardSettings)

    if (
      context.timeZone !== 'UTC' && // the current timezone is something other than UTC
      standardSettings.timeZoneName === 'short' // and want to display the timezone offset
    ) {
      // then inject the timezone offset into the string
      s = s.replace(/UTC|GMT/, formatTimeZoneOffset(date.timeZoneOffset))
    }

    transformations.forEach(function(transformation) {
      s = transformation(s)
    })

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
    let separator = this.extendedSettings.separator || DEFAULT_SEPARATOR

    if (insertion) {
      return insertion.before + partial0 + separator + partial1 + insertion.after
    }

    return full0 + separator + full1
  }

}


function formatWeekNumber(num: number, locale: Locale, display?: 'numeric' | 'narrow' | 'short'): string {
  let parts = []

  if (display === 'narrow') {
    parts.push(locale.options.weekHeader)
  } else if (display === 'short') {
    parts.push(locale.options.weekHeader, ' ')
  }
  // otherwise, considered 'numeric'

  parts.push(locale.simpleNumberFormat.format(num))

  if (locale.options.isRTL) {
    parts.reverse()
  }

  return parts.join('')
}


// Range Formatting Utils

const SEVERITIES_FOR_PARTS = {
  year: 4,
  month: 3,
  day: 2,
  weekday: 2,
  hour: 1,
  minute: 1,
  second: 1
}

// 0 = exactly the same
// 1 = different by time
// 2 = different by day
// 3 = different by month
// 4 = different by year
function computeMarkerDiffSeverity(d0: DateMarker, d1: DateMarker, ca: CalendarSystem) {
  if (ca.getMarkerYear(d0) !== ca.getMarkerYear(d1)) {
    return 4
  }
  if (ca.getMarkerMonth(d0) !== ca.getMarkerMonth(d1)) {
    return 3
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
      name === 'timeZone' ||
      SEVERITIES_FOR_PARTS[name] <= biggestUnit // if undefined, will always be false
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
