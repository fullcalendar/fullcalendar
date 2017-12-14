import * as $ from 'jquery'
import * as moment from 'moment'
import * as exportHooks from './exports'
import { mergeOptions, globalDefaults, englishDefaults } from './options'
import { stripHtmlEntities } from './util'

export const localeOptionHash = {};
(exportHooks as any).locales = localeOptionHash


// NOTE: can't guarantee any of these computations will run because not every locale has datepicker
// configs, so make sure there are English fallbacks for these in the defaults file.
const dpComputableOptions = {

  buttonText: function(dpOptions) {
    return {
      // the translations sometimes wrongly contain HTML entities
      prev: stripHtmlEntities(dpOptions.prevText),
      next: stripHtmlEntities(dpOptions.nextText),
      today: stripHtmlEntities(dpOptions.currentText)
    }
  },

  // Produces format strings like "MMMM YYYY" -> "September 2014"
  monthYearFormat: function(dpOptions) {
    return dpOptions.showMonthAfterYear ?
      'YYYY[' + dpOptions.yearSuffix + '] MMMM' :
      'MMMM YYYY[' + dpOptions.yearSuffix + ']'
  }

}


const momComputableOptions = {

  // Produces format strings like "ddd M/D" -> "Fri 9/15"
  dayOfMonthFormat: function(momOptions, fcOptions) {
    let format = momOptions.longDateFormat('l') // for the format like "M/D/YYYY"

    // strip the year off the edge, as well as other misc non-whitespace chars
    format = format.replace(/^Y+[^\w\s]*|[^\w\s]*Y+$/g, '')

    if (fcOptions.isRTL) {
      format += ' ddd' // for RTL, add day-of-week to end
    } else {
      format = 'ddd ' + format // for LTR, add day-of-week to beginning
    }
    return format
  },

  // Produces format strings like "h:mma" -> "6:00pm"
  mediumTimeFormat: function(momOptions) { // can't be called `timeFormat` because collides with option
    return momOptions.longDateFormat('LT')
      .replace(/\s*a$/i, 'a') // convert AM/PM/am/pm to lowercase. remove any spaces beforehand
  },

  // Produces format strings like "h(:mm)a" -> "6pm" / "6:30pm"
  smallTimeFormat: function(momOptions) {
    return momOptions.longDateFormat('LT')
      .replace(':mm', '(:mm)')
      .replace(/(\Wmm)$/, '($1)') // like above, but for foreign locales
      .replace(/\s*a$/i, 'a') // convert AM/PM/am/pm to lowercase. remove any spaces beforehand
  },

  // Produces format strings like "h(:mm)t" -> "6p" / "6:30p"
  extraSmallTimeFormat: function(momOptions) {
    return momOptions.longDateFormat('LT')
      .replace(':mm', '(:mm)')
      .replace(/(\Wmm)$/, '($1)') // like above, but for foreign locales
      .replace(/\s*a$/i, 't') // convert to AM/PM/am/pm to lowercase one-letter. remove any spaces beforehand
  },

  // Produces format strings like "ha" / "H" -> "6pm" / "18"
  hourFormat: function(momOptions) {
    return momOptions.longDateFormat('LT')
      .replace(':mm', '')
      .replace(/(\Wmm)$/, '') // like above, but for foreign locales
      .replace(/\s*a$/i, 'a') // convert AM/PM/am/pm to lowercase. remove any spaces beforehand
  },

  // Produces format strings like "h:mm" -> "6:30" (with no AM/PM)
  noMeridiemTimeFormat: function(momOptions) {
    return momOptions.longDateFormat('LT')
      .replace(/\s*a$/i, '') // remove trailing AM/PM
  }

}


// options that should be computed off live calendar options (considers override options)
// TODO: best place for this? related to locale?
// TODO: flipping text based on isRTL is a bad idea because the CSS `direction` might want to handle it
const instanceComputableOptions = {

  // Produces format strings for results like "Mo 16"
  smallDayDateFormat: function(options) {
    return options.isRTL ?
      'D dd' :
      'dd D'
  },

  // Produces format strings for results like "Wk 5"
  weekFormat: function(options) {
    return options.isRTL ?
      'w[ ' + options.weekNumberTitle + ']' :
      '[' + options.weekNumberTitle + ' ]w'
  },

  // Produces format strings for results like "Wk5"
  smallWeekFormat: function(options) {
    return options.isRTL ?
      'w[' + options.weekNumberTitle + ']' :
      '[' + options.weekNumberTitle + ']w'
  }

}


// TODO: make these computable properties in optionsManager
export function populateInstanceComputableOptions(options) {
  $.each(instanceComputableOptions, function(name, func) {
    if (options[name] == null) {
      options[name] = func(options)
    }
  })
}


// Initialize jQuery UI datepicker translations while using some of the translations
// Will set this as the default locales for datepicker.
export function datepickerLocale(localeCode, dpLocaleCode, dpOptions) {

  // get the FullCalendar internal option hash for this locale. create if necessary
  let fcOptions = localeOptionHash[localeCode] || (localeOptionHash[localeCode] = {})

  // transfer some simple options from datepicker to fc
  fcOptions.isRTL = dpOptions.isRTL
  fcOptions.weekNumberTitle = dpOptions.weekHeader

  // compute some more complex options from datepicker
  $.each(dpComputableOptions, function(name, func) {
    fcOptions[name] = func(dpOptions)
  })

  let jqDatePicker = ($ as any).datepicker

  // is jQuery UI Datepicker is on the page?
  if (jqDatePicker) {

    // Register the locale data.
    // FullCalendar and MomentJS use locale codes like "pt-br" but Datepicker
    // does it like "pt-BR" or if it doesn't have the locale, maybe just "pt".
    // Make an alias so the locale can be referenced either way.
    jqDatePicker.regional[dpLocaleCode] =
      jqDatePicker.regional[localeCode] = // alias
        dpOptions

    // Alias 'en' to the default locale data. Do this every time.
    jqDatePicker.regional.en = jqDatePicker.regional['']

    // Set as Datepicker's global defaults.
    jqDatePicker.setDefaults(dpOptions)
  }
}


// Sets FullCalendar-specific translations. Will set the locales as the global default.
export function locale(localeCode, newFcOptions) {
  let fcOptions
  let momOptions

  // get the FullCalendar internal option hash for this locale. create if necessary
  fcOptions = localeOptionHash[localeCode] || (localeOptionHash[localeCode] = {})

  // provided new options for this locales? merge them in
  if (newFcOptions) {
    fcOptions = localeOptionHash[localeCode] = mergeOptions([ fcOptions, newFcOptions ])
  }

  // compute locale options that weren't defined.
  // always do this. newFcOptions can be undefined when initializing from i18n file,
  // so no way to tell if this is an initialization or a default-setting.
  momOptions = getMomentLocaleData(localeCode) // will fall back to en
  $.each(momComputableOptions, function(name, func) {
    if (fcOptions[name] == null) {
      fcOptions[name] = (func)(momOptions, fcOptions)
    }
  })

  // set it as the default locale for FullCalendar
  globalDefaults.locale = localeCode
}


// Returns moment's internal locale data. If doesn't exist, returns English.
export function getMomentLocaleData(localeCode) {
  return moment.localeData(localeCode) || moment.localeData('en')
}


// Initialize English by forcing computation of moment-derived options.
// Also, sets it as the default.
locale('en', englishDefaults)
