import * as exportHooks from './exports'
import { mergeOptions, globalDefaults } from './options'

export const localeOptionHash = {};
(exportHooks as any).locales = localeOptionHash


// Sets FullCalendar-specific translations. Will set the locales as the global default.
export function locale(localeCode, newFcOptions) {
  let fcOptions

  // get the FullCalendar internal option hash for this locale. create if necessary
  fcOptions = localeOptionHash[localeCode] || (localeOptionHash[localeCode] = {})

  // provided new options for this locales? merge them in
  if (newFcOptions) {
    fcOptions = localeOptionHash[localeCode] = mergeOptions([ fcOptions, newFcOptions ])
  }

  // set it as the default locale for FullCalendar
  globalDefaults.locale = localeCode
}


// Initialize English by forcing computation of moment-derived options.
// Also, sets it as the default.
locale('en', {})
