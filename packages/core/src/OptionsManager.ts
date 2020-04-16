import { firstDefined } from './util/misc'
import { globalDefaults, mergeOptions } from './options'
import { organizeRawLocales, buildLocale } from './datelib/locale'
import { __assign } from 'tslib'

export function compileOptions(overrides, dynamicOverrides, viewDefaults?, viewOverrides?) {
  let locales = firstDefined( // explicit locale option given?
    dynamicOverrides.locales,
    overrides.locales,
    globalDefaults.locales
  )

  let locale = firstDefined( // explicit locales option given?
    dynamicOverrides.locale,
    overrides.locale,
    globalDefaults.locale
  )

  let availableLocaleData = organizeRawLocales(locales)
  let localeDefaults = buildLocale(locale || availableLocaleData.defaultCode, availableLocaleData.map).options

  return {
    availableLocaleData,
    localeDefaults,
    options: mergeOptions([ // merge defaults and overrides. lowest to highest precedence
      globalDefaults, // global defaults
      viewDefaults || {},
      localeDefaults,
      overrides,
      viewOverrides || {},
      dynamicOverrides
    ])
  }
}
