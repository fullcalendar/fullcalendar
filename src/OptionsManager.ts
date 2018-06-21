import { assignTo } from './util/object'
import { firstDefined } from './util/misc'
import { globalDefaults, rtlDefaults, mergeOptions } from './options'
import { getLocale } from './datelib/locale'


export default class OptionsManager {

  dirDefaults: any // option defaults related to LTR or RTL
  localeDefaults: any // option defaults related to current locale
  overrides: any // option overrides given to the fullCalendar constructor
  dynamicOverrides: any // options set with dynamic setter method. higher precedence than view overrides.
  computed: any


  constructor(overrides) {
    this.overrides = assignTo({}, overrides) // make a copy
    this.dynamicOverrides = {}
    this.compute()
  }


  add(newOptionHash) {
    assignTo(this.dynamicOverrides, newOptionHash)
    this.compute()
  }


  // Computes the flattened options hash for the calendar and assigns to `this.options`.
  // Assumes this.overrides and this.dynamicOverrides have already been initialized.
  compute() {
    let locale
    let localeDefaults
    let isRTL
    let dirDefaults

    locale = firstDefined( // explicit locale option given?
      this.dynamicOverrides.locale,
      this.overrides.locale
    )
    localeDefaults = getLocale(locale).options // TODO: not efficient bc calendar already queries this

    isRTL = firstDefined( // based on options computed so far, is direction RTL?
      this.dynamicOverrides.isRTL,
      this.overrides.isRTL,
      localeDefaults.isRTL,
      globalDefaults.isRTL
    )
    dirDefaults = isRTL ? rtlDefaults : {}

    this.dirDefaults = dirDefaults
    this.localeDefaults = localeDefaults

    this.computed = mergeOptions([ // merge defaults and overrides. lowest to highest precedence
      globalDefaults, // global defaults
      dirDefaults,
      localeDefaults,
      this.overrides,
      this.dynamicOverrides
    ])
  }

}
