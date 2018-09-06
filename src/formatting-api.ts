import { DateEnv, DateInput } from './datelib/env'
import { assignTo } from './util/object'
import { createFormatter } from './datelib/formatting'
import { getLocale } from './datelib/locale'
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
  settings, // mixture of env and formatter settings
  defaultSeparator: string = globalDefaults.defaultRangeSeparator
) {
  let dateEnv = buildDateEnv(typeof settings === 'object' && settings ? settings : {}) // pass in if non-null object
  let formatter = createFormatter(settings, defaultSeparator)
  let startMeta = dateEnv.createMarkerMeta(startInput)
  let endMeta = dateEnv.createMarkerMeta(endInput)

  if (!startMeta || !endMeta) { // TODO: warning?
    return ''
  }

  return dateEnv.formatRange(startMeta.marker, endMeta.marker, formatter, {
    forcedStartTzo: startMeta.forcedTzo,
    forcedEndTzo: endMeta.forcedTzo
  })
}

function buildDateEnv(settings) {
  let locale = settings.locale || 'en'

  // ensure required settings
  // TODO: use constants
  settings = assignTo({
    timeZone: 'UTC',
    calendarSystem: 'gregory'
  }, settings, {
    locale: getLocale(locale)
  })

  return new DateEnv(settings)
}
