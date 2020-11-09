import { DateEnv } from './datelib/env'
import { createFormatter } from './datelib/formatting'
import { NativeFormatterOptions } from './datelib/formatting-native'
import { organizeRawLocales, buildLocale } from './datelib/locale'
import { BASE_OPTION_DEFAULTS } from './options'

// public
import { DateInput } from './api-type-deps'

export interface FormatDateOptions extends NativeFormatterOptions {
  locale?: string
}

export interface FormatRangeOptions extends FormatDateOptions {
  separator?: string
  isEndExclusive?: boolean
}

export function formatDate(dateInput: DateInput, options: FormatDateOptions = {}) {
  let dateEnv = buildDateEnv(options)
  let formatter = createFormatter(options)
  let dateMeta = dateEnv.createMarkerMeta(dateInput)

  if (!dateMeta) { // TODO: warning?
    return ''
  }

  return dateEnv.format(dateMeta.marker, formatter, {
    forcedTzo: dateMeta.forcedTzo,
  })
}

export function formatRange(
  startInput: DateInput,
  endInput: DateInput,
  options: FormatRangeOptions, // mixture of env and formatter settings
) {
  let dateEnv = buildDateEnv(typeof options === 'object' && options ? options : {}) // pass in if non-null object
  let formatter = createFormatter(options)
  let startMeta = dateEnv.createMarkerMeta(startInput)
  let endMeta = dateEnv.createMarkerMeta(endInput)

  if (!startMeta || !endMeta) { // TODO: warning?
    return ''
  }

  return dateEnv.formatRange(startMeta.marker, endMeta.marker, formatter, {
    forcedStartTzo: startMeta.forcedTzo,
    forcedEndTzo: endMeta.forcedTzo,
    isEndExclusive: options.isEndExclusive,
    defaultSeparator: BASE_OPTION_DEFAULTS.defaultRangeSeparator,
  })
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
