import { DateMarker, timeAsMs } from './marker'
import { CalendarSystem } from './calendar-system'
import { Locale } from './locale'
import { DateFormatter, DateFormattingContext, ZonedMarker, formatTimeZoneOffset } from './formatting'
import { memoize } from '../util/memoize'

const EXTENDED_SETTINGS_AND_SEVERITIES = {
  week: 3,
  separator: 0, // 0 = not applicable
  omitZeroMinute: 0,
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
const MULTI_SPACE_RE = /\s+/g
const LTR_RE = /\u200e/g // control character
const UTC_RE = /UTC|GMT/

export class NativeFormatter implements DateFormatter {

  standardDateProps: any
  extendedSettings: any
  severity: number
  private buildFormattingFunc: typeof buildFormattingFunc // caching for efficiency with same date env

  constructor(formatSettings) {
    let standardDateProps: any = {}
    let extendedSettings: any = {}
    let severity = 0

    for (let name in formatSettings) {
      if (name in EXTENDED_SETTINGS_AND_SEVERITIES) {
        extendedSettings[name] = formatSettings[name]
        severity = Math.max(EXTENDED_SETTINGS_AND_SEVERITIES[name], severity)
      } else {
        standardDateProps[name] = formatSettings[name]

        if (name in STANDARD_DATE_PROP_SEVERITIES) {
          severity = Math.max(STANDARD_DATE_PROP_SEVERITIES[name], severity)
        }
      }
    }

    this.standardDateProps = standardDateProps
    this.extendedSettings = extendedSettings
    this.severity = severity

    this.buildFormattingFunc = memoize(buildFormattingFunc)
  }

  format(date: ZonedMarker, context: DateFormattingContext) {
    return this.buildFormattingFunc(this.standardDateProps, this.extendedSettings, context)(date)
  }

  formatRange(start: ZonedMarker, end: ZonedMarker, context: DateFormattingContext) {
    let { standardDateProps, extendedSettings } = this

    let diffSeverity = computeMarkerDiffSeverity(start.marker, end.marker, context.calendarSystem)
    if (!diffSeverity) {
      return this.format(start, context)
    }

    let biggestUnitForPartial = diffSeverity
    if (
      biggestUnitForPartial > 1 && // the two dates are different in a way that's larger scale than time
      (standardDateProps.year === 'numeric' || standardDateProps.year === '2-digit') &&
      (standardDateProps.month === 'numeric' || standardDateProps.month === '2-digit') &&
      (standardDateProps.day === 'numeric' || standardDateProps.day === '2-digit')
    ) {
      biggestUnitForPartial = 1 // make it look like the dates are only different in terms of time
    }

    let full0 = this.format(start, context)
    let full1 = this.format(end, context)

    if (full0 === full1) {
      return full0
    }

    let partialDateProps = computePartialFormattingOptions(standardDateProps, biggestUnitForPartial)
    let partialFormattingFunc = buildFormattingFunc(partialDateProps, extendedSettings, context)
    let partial0 = partialFormattingFunc(start)
    let partial1 = partialFormattingFunc(end)

    let insertion = findCommonInsertion(full0, partial0, full1, partial1)
    let separator = extendedSettings.separator || ''

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

function buildFormattingFunc(
  standardDateProps,
  extendedSettings,
  context: DateFormattingContext
): (date: ZonedMarker) => string {
  let standardDatePropCnt = Object.keys(standardDateProps).length

  if (standardDatePropCnt === 1 && standardDateProps.timeZoneName === 'short') {
    return function(date: ZonedMarker) {
      return formatTimeZoneOffset(date.timeZoneOffset)
    }
  }

  if (standardDatePropCnt === 0 && extendedSettings.week) {
    return function(date: ZonedMarker) {
      return formatWeekNumber(
        context.computeWeekNumber(date.marker),
        context.weekLabel,
        context.locale,
        extendedSettings.week
      )
    }
  }

  return buildNativeFormattingFunc(standardDateProps, extendedSettings, context)
}

function buildNativeFormattingFunc(
  standardDateProps,
  extendedSettings,
  context: DateFormattingContext
): (date: ZonedMarker) => string {
  standardDateProps = { ...standardDateProps } // copy
  extendedSettings = { ...extendedSettings } // copy

  sanitizeSettings(standardDateProps, extendedSettings)

  standardDateProps.timeZone = 'UTC' // we leverage the only guaranteed timeZone for our UTC markers

  let normalFormat = new Intl.DateTimeFormat(context.locale.codes, standardDateProps)
  let zeroFormat // needed?

  if (extendedSettings.omitZeroMinute) {
    let zeroProps = { ...standardDateProps }
    delete zeroProps.minute // seconds and ms were already considered in sanitizeSettings
    zeroFormat = new Intl.DateTimeFormat(context.locale.codes, zeroProps)
  }

  return function(date: ZonedMarker) {
    let marker = date.marker
    let format

    if (zeroFormat && !marker.getUTCMinutes()) {
      format = zeroFormat
    } else {
      format = normalFormat
    }

    let s = format.format(marker)

    return postProcess(s, date, standardDateProps, extendedSettings, context)
  }
}

function sanitizeSettings(standardDateProps, extendedSettings) {

  // deal with a browser inconsistency where formatting the timezone
  // requires that the hour/minute be present.
  if (standardDateProps.timeZoneName) {
    if (!standardDateProps.hour) {
      standardDateProps.hour = '2-digit'
    }
    if (!standardDateProps.minute) {
      standardDateProps.minute = '2-digit'
    }
  }

  // only support short timezone names
  if (standardDateProps.timeZoneName === 'long') {
    standardDateProps.timeZoneName = 'short'
  }

  // if requesting to display seconds, MUST display minutes
  if (extendedSettings.omitZeroMinute && (standardDateProps.second || standardDateProps.millisecond)) {
    delete extendedSettings.omitZeroMinute
  }
}

function postProcess(s: string, date: ZonedMarker, standardDateProps, extendedSettings, context: DateFormattingContext): string {

  s = s.replace(LTR_RE, '') // remove left-to-right control chars. do first. good for other regexes

  if (standardDateProps.timeZoneName === 'short') {
    s = injectTzoStr(
      s,
      (context.timeZone === 'UTC' || date.timeZoneOffset == null) ?
        'UTC' : // important to normalize for IE, which does "GMT"
        formatTimeZoneOffset(date.timeZoneOffset)
    )
  }

  if (extendedSettings.omitCommas) {
    s = s.replace(COMMA_RE, '').trim()
  }

  if (extendedSettings.omitZeroMinute) {
    s = s.replace(':00', '') // zeroFormat doesn't always achieve this
  }

  // ^ do anything that might create adjacent spaces before this point,
  // because MERIDIEM_RE likes to eat up loading spaces

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

  s = s.replace(MULTI_SPACE_RE, ' ')
  s = s.trim()

  return s
}

function injectTzoStr(s: string, tzoStr: string): string {
  let replaced = false

  s = s.replace(UTC_RE, function() {
    replaced = true
    return tzoStr
  })

  // IE11 doesn't include UTC/GMT in the original string, so append to end
  if (!replaced) {
    s += ' ' + tzoStr
  }

  return s
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

  if (locale.options.isRtl) { // TODO: use control characters instead?
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
