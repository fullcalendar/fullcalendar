import { DateEnv, NativeDateFormatterOptions, joinDateTimeFormatParts } from '@full-ui/headless-calendar'
import { createFormatter } from './datelib/formatting'
import { organizeRawLocales, buildLocale } from './datelib/locale'
import { BASE_OPTION_DEFAULTS } from './options'

// public
import { DateInput } from './api/structs'

export interface FormatDateOptions extends NativeDateFormatterOptions {
  locale?: string
}

export interface FormatRangeOptions extends FormatDateOptions {
  isEndExclusive?: boolean
}

export function formatDate(dateInput: DateInput, options: FormatDateOptions = {}): string {
  let dateEnv = buildDateEnv(options)
  let formatter = createFormatter(options)
  let dateMeta = dateEnv.createMarkerMeta(dateInput)

  if (!dateMeta) { // TODO: warning?
    return ''
  }

  return joinDateTimeFormatParts(dateEnv.formatToParts(dateMeta.marker, formatter))
}

export function formatRange(
  startInput: DateInput,
  endInput: DateInput,
  options: FormatRangeOptions, // mixture of env and formatter settings
): string {
  let dateEnv = buildDateEnv(typeof options === 'object' && options ? options : {}) // pass in if non-null object
  let formatter = createFormatter(options)
  let startMeta = dateEnv.createMarkerMeta(startInput)
  let endMeta = dateEnv.createMarkerMeta(endInput)

  if (!startMeta || !endMeta) { // TODO: warning?
    return ''
  }

  return joinDateTimeFormatParts(
    dateEnv.formatRangeToParts(startMeta.marker, endMeta.marker, formatter, {
      isEndExclusive: options.isEndExclusive,
    }),
  )
}

// TODO: more DRY and optimized
function buildDateEnv(settings: FormatRangeOptions) {
  let locale = buildLocale(settings.locale || 'en', organizeRawLocales([]).map) // TODO: don't hardcode 'en' everywhere

  return new DateEnv({
    timeZone: BASE_OPTION_DEFAULTS.timeZone,
    calendarSystem: 'gregory',
    ...settings,
    locale,
  })
}
