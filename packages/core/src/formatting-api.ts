import { DateEnv, DateInput } from './datelib/env'
import { createFormatter } from './datelib/formatting'
import { parseRawLocales, buildLocale } from './datelib/locale'
import { globalDefaults } from './options'

export function formatDate(dateInput: DateInput, settings = {}) {
  let dateEnv = buildDateEnv(settings)
  let formatter = createFormatter(settings)
  let dateMeta = dateEnv.createMarkerMeta(dateInput)

  if (!dateMeta) { // TODO: warning?
    return ''
  }

  return dateEnv.format(dateMeta.marker, formatter, {
    forcedTzo: dateMeta.forcedTzo
  })
}

export function formatRange(
  startInput: DateInput,
  endInput: DateInput,
  settings // mixture of env and formatter settings
) {
  let dateEnv = buildDateEnv(typeof settings === 'object' && settings ? settings : {}) // pass in if non-null object
  let formatter = createFormatter(settings, globalDefaults.defaultRangeSeparator)
  let startMeta = dateEnv.createMarkerMeta(startInput)
  let endMeta = dateEnv.createMarkerMeta(endInput)

  if (!startMeta || !endMeta) { // TODO: warning?
    return ''
  }

  return dateEnv.formatRange(startMeta.marker, endMeta.marker, formatter, {
    forcedStartTzo: startMeta.forcedTzo,
    forcedEndTzo: endMeta.forcedTzo,
    isEndExclusive: settings.isEndExclusive
  })
}

// TODO: more DRY and optimized
function buildDateEnv(settings) {
  let locale = buildLocale(settings.locale || 'en', parseRawLocales([]).map) // TODO: don't hardcode 'en' everywhere

  // ensure required settings
  settings = {
    timeZone: globalDefaults.timeZone,
    calendarSystem: 'gregory',
    ...settings,
    locale
  }

  return new DateEnv(settings)
}
