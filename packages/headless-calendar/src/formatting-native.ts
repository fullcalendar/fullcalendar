import { Locale } from './locale'
import { ZonedMarker } from './zoned-marker'
import {
  DateFormatter,
  DateTimeFormatPartWithWeek,
  DateTimeRangeFormatPartWithWeek,
  DateFormattingContext,
} from './formatting-interface'
import { formatTimeZoneOffset } from './formatting-utils'

export interface NativeDateFormatterOptions extends Intl.DateTimeFormatOptions {
  /*
  If specified, must be the only option.
  Outputs a part with type:'week', aka DateTimeFormatPartWithWeek
  */
  week?: 'long' | 'short' | 'narrow' | 'numeric'

  /*
  If specified, converts any dayPeriod string that matches MERIDIEM_RE to be uppercase, lowercase,
  "short" ("am" or "pm"), "narrow" ("a" or "p"), or `false` (completely omitted). `true` does nothing
  If short or narrow are specified, ensures that there's no separation between prior value and meridiem,
  so "7 a.m." will end up like "7am" or "7a"
  */
  meridiem?: 'lowercase' | 'short' | 'narrow' | boolean

  /*
  when receiving a marker with zero hour/minute/second/millisecond,
  format with a different internal DateTimeFormat that hides all time parts
  */
  omitZeroMinute?: boolean

  /*
  forces all strings like ", " to be " "
  */
  omitCommas?: boolean

  /*
  prepends "," to all whitespace-only literal strings
  */
  forceCommas?: boolean

  /*
  strips whitespace, periods, and commas from the final part if it is a literal
  */
  omitTrailing?: boolean

  /*
  can force a weekday like "Saturday 1" to the end like "1 Saturday"
  can force a weekday like "2 Sunday" to the start like "Sunday 1"
  only expected to work when there are three parts: weekday, an empty-space literal, and something else
  */
  weekdayJustify?: 'start' | 'end'
}

const EXTENDED_SETTINGS = new Set([
  'week',
  'meridiem',
  'omitZeroMinute',
  'omitCommas',
  'forceCommas',
  'omitTrailing',
  'weekdayJustify',
])

const MERIDIEM_RE = /([ap])\.?m\.?/i
const COMMA_RE = /,/g
const LTR_RE = /\u200e/g // control character
const TRAILING_RE = /[\s.,]+$/
const WHITESPACE_ONLY_RE = /^\s+$/

interface CachedFormats {
  normalFormat: Intl.DateTimeFormat
  zeroFormat?: Intl.DateTimeFormat
}

export class NativeDateFormatter implements DateFormatter {
  private standardOptions: Intl.DateTimeFormatOptions
  private extendedOptions: Partial<NativeDateFormatterOptions>
  private weekOnly: boolean
  private timeZoneOnly: boolean
  private cachedContext: DateFormattingContext | undefined
  private cachedFormats: CachedFormats | undefined

  constructor(options?: NativeDateFormatterOptions) {
    const standardOptions: Intl.DateTimeFormatOptions = {}
    const extendedOptions: NativeDateFormatterOptions = {}

    for (const name in options) {
      if (EXTENDED_SETTINGS.has(name)) {
        extendedOptions[name] = options[name]
      } else {
        standardOptions[name] = options[name]
      }
    }

    if (standardOptions.timeZoneName === 'long') {
      standardOptions.timeZoneName = 'short'
    }

    this.timeZoneOnly = Object.keys(standardOptions).length === 1 &&
      standardOptions.timeZoneName === 'short'

    this.weekOnly = Boolean(!Object.keys(standardOptions).length && extendedOptions.week)

    if (!this.timeZoneOnly) {
      if (standardOptions.timeZoneName) {
        if (!standardOptions.hour) {
          standardOptions.hour = '2-digit'
        }
        if (!standardOptions.minute) {
          standardOptions.minute = '2-digit'
        }
      }

      if (
        extendedOptions.omitZeroMinute &&
        (standardOptions.second || standardOptions.fractionalSecondDigits)
      ) {
        delete extendedOptions.omitZeroMinute
      }

      standardOptions.timeZone = 'UTC'
    }

    this.standardOptions = standardOptions
    this.extendedOptions = extendedOptions
  }

  formatToParts(date: ZonedMarker, context: DateFormattingContext): DateTimeFormatPartWithWeek[] {
    const { standardOptions, extendedOptions } = this

    if (this.timeZoneOnly) {
      return [{
        type: 'timeZoneName',
        value: formatTimeZoneOffset(date.timeZoneOffset),
      }]
    }

    if (this.weekOnly) {
      return formatWeekNumberParts(
        context.computeWeekNumber(date.marker),
        context.weekTextLong,
        context.weekTextShort,
        context.locale,
        extendedOptions.week,
      )
    }

    const { normalFormat, zeroFormat } = this.getFormats(context)
    const format = (zeroFormat && !date.marker.getUTCMinutes())
      ? zeroFormat
      : normalFormat
    const parts = format.formatToParts(date.marker)
    return postProcessParts(parts, date, standardOptions, extendedOptions)
  }

  formatRangeToParts(
    start: ZonedMarker,
    end: ZonedMarker,
    context: DateFormattingContext,
  ): DateTimeRangeFormatPartWithWeek[] {
    const { standardOptions, extendedOptions } = this

    if (this.timeZoneOnly || this.weekOnly) {
      return this.formatToParts(start, context).map((part) => {
        return {
          source: part.type === 'literal' ? 'shared' : 'startRange',
          ...part,
        }
      })
    }

    const { normalFormat, zeroFormat } = this.getFormats(context)
    const format = (zeroFormat && !start.marker.getUTCMinutes() && !end.marker.getUTCMinutes())
      ? zeroFormat
      : normalFormat
    const parts = format.formatRangeToParts(start.marker, end.marker)
    return postProcessRangeParts(parts, start, end, standardOptions, extendedOptions)
  }

  private getFormats(context: DateFormattingContext): CachedFormats {
    if (this.cachedContext !== context) {
      const { standardOptions, extendedOptions } = this
      const { codes } = context.locale
      const normalFormat = new Intl.DateTimeFormat(codes, standardOptions)
      let zeroFormat: Intl.DateTimeFormat | undefined

      if (extendedOptions.omitZeroMinute) {
        const zeroProps = { ...standardOptions }
        delete zeroProps.minute
        zeroFormat = new Intl.DateTimeFormat(codes, zeroProps)
      }

      this.cachedContext = context
      this.cachedFormats = { normalFormat, zeroFormat }
    }

    return this.cachedFormats!
  }
}

function processPartsLoop<T extends Intl.DateTimeFormatPart>(
  parts: T[],
  extendedOptions: Partial<NativeDateFormatterOptions>,
  getTzValue: (part: T) => string | undefined,
): { lastLiteral: T | undefined, anyTzInjected: boolean } {
  let anyTzInjected = false
  let priorLiteral: T | undefined

  for (const part of parts) {
    const isLiteral = part.type === 'literal'

    if (isLiteral || part.type === 'dayPeriod') {
      let s = part.value
      s = s.replace(LTR_RE, '')

      if (extendedOptions.omitCommas) {
        s = s.replace(COMMA_RE, '')
      }

      if (!isLiteral) {
        const { meridiem } = extendedOptions
        if (meridiem === false) {
          s = s.replace(MERIDIEM_RE, '')
        } else if (meridiem === 'narrow') {
          s = s.replace(MERIDIEM_RE, (_m0: string, m1: string) => m1.toLocaleLowerCase())
        } else if (meridiem === 'short') {
          s = s.replace(MERIDIEM_RE, (_m0: string, m1: string) => `${m1.toLocaleLowerCase()}m`)
        } else if (meridiem === 'lowercase') {
          s = s.replace(MERIDIEM_RE, (m0: string) => m0.toLocaleLowerCase())
        }

        if (priorLiteral) {
          priorLiteral.value = priorLiteral.value.trimEnd()
        }
      }

      part.value = s
    } else if (part.type === 'timeZoneName') {
      const tzValue = getTzValue(part)
      if (tzValue != null) {
        part.value = tzValue
        anyTzInjected = true
      }
    }

    priorLiteral = isLiteral ? part : undefined
  }

  return { lastLiteral: priorLiteral, anyTzInjected }
}

function postProcessParts(
  parts: Intl.DateTimeFormatPart[],
  date: ZonedMarker,
  standardOptions: Intl.DateTimeFormatOptions,
  extendedOptions: Partial<NativeDateFormatterOptions>,
): DateTimeFormatPartWithWeek[] {
  const injectableTz = standardOptions.timeZoneName === 'short'
    ? (date.timeZoneOffset == null ? 'UTC' : formatTimeZoneOffset(date.timeZoneOffset))
    : undefined

  const { lastLiteral, anyTzInjected } = processPartsLoop(parts, extendedOptions, () => injectableTz)

  if (injectableTz && !anyTzInjected) {
    if (lastLiteral) {
      lastLiteral.value += ' '
    } else {
      parts.push({ type: 'literal', value: ' ' })
    }
    parts.push({ type: 'timeZoneName', value: injectableTz })
  }

  if (
    extendedOptions.weekdayJustify &&
    parts.length === 3 &&
    WHITESPACE_ONLY_RE.test(parts[1].value)
  ) {
    if (parts[extendedOptions.weekdayJustify === 'start' ? 2 : 0].type === 'weekday') {
      parts.reverse()
    }
  }

  if (extendedOptions.forceCommas) {
    for (const part of parts) {
      if (part.type === 'literal' && WHITESPACE_ONLY_RE.test(part.value)) {
        part.value = `,${part.value}`
      }
    }
  }

  if (extendedOptions.omitTrailing) {
    stripTrailingLiteral(parts)
  }

  return parts.filter((part) => part.value)
}

function postProcessRangeParts(
  parts: Intl.DateTimeRangeFormatPart[],
  start: ZonedMarker,
  end: ZonedMarker,
  standardOptions: Intl.DateTimeFormatOptions,
  extendedOptions: Partial<NativeDateFormatterOptions>,
): DateTimeRangeFormatPartWithWeek[] {
  const injectTz = standardOptions.timeZoneName === 'short'

  processPartsLoop(parts, extendedOptions, (part) => {
    if (!injectTz) return undefined
    const offset = part.source === 'endRange' ? end.timeZoneOffset : start.timeZoneOffset
    return offset == null ? 'UTC' : formatTimeZoneOffset(offset)
  })

  if (extendedOptions.forceCommas) {
    for (const part of parts) {
      if (part.type === 'literal' && WHITESPACE_ONLY_RE.test(part.value)) {
        part.value = `,${part.value}`
      }
    }
  }

  if (extendedOptions.omitTrailing) {
    stripTrailingLiteral(parts)
  }

  return parts.filter((part) => part.value)
}

function stripTrailingLiteral<T extends { type: string, value: string }>(parts: T[]): void {
  const lastPart = parts[parts.length - 1]

  if (lastPart?.type === 'literal') {
    lastPart.value = lastPart.value.replace(TRAILING_RE, '')

    if (!lastPart.value) {
      parts.pop()
    }
  }
}

function formatWeekNumberParts(
  num: number,
  weekTextLong: string,
  weekTextShort: string,
  locale: Locale,
  display?: 'numeric' | 'narrow' | 'short' | 'long',
): DateTimeFormatPartWithWeek[] {
  const parts: DateTimeFormatPartWithWeek[] = []

  if (display === 'long') {
    parts.push({ type: 'literal', value: weekTextLong })
  } else if (display === 'short' || display === 'narrow') {
    parts.push({ type: 'literal', value: weekTextShort })
  }

  if (display === 'long' || display === 'short') {
    parts.push({ type: 'literal', value: ' ' })
  }

  parts.push({
    type: 'week',
    value: locale.simpleNumberFormat.format(num),
  })

  if (locale.options.direction === 'rtl') {
    parts.reverse()
  }

  return parts
}
