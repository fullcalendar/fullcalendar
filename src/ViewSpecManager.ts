import * as moment from 'moment'
import * as $ from 'jquery'
import { viewHash } from './ViewRegistry'
import { mergeProps, unitsDesc, computeDurationGreatestUnit } from './util'
import { mergeOptions, globalDefaults } from './options'
import { populateInstanceComputableOptions } from './locale'


export default class ViewSpecManager {

  _calendar: any // avoid
  optionsManager: any
  viewSpecCache: any // cache of view definitions (initialized in Calendar.js)


  constructor(optionsManager, _calendar) {
    this.optionsManager = optionsManager
    this._calendar = _calendar

    this.clearCache()
  }


  clearCache() {
    this.viewSpecCache = {}
  }


  // Gets information about how to create a view. Will use a cache.
  getViewSpec(viewType) {
    let cache = this.viewSpecCache

    return cache[viewType] || (cache[viewType] = this.buildViewSpec(viewType))
  }


  // Given a duration singular unit, like "week" or "day", finds a matching view spec.
  // Preference is given to views that have corresponding buttons.
  getUnitViewSpec(unit) {
    let viewTypes
    let i
    let spec

    if ($.inArray(unit, unitsDesc) !== -1) {

      // put views that have buttons first. there will be duplicates, but oh well
      viewTypes = this._calendar.header.getViewsWithButtons() // TODO: include footer as well?
      $.each(viewHash, function(viewType) { // all views
        viewTypes.push(viewType)
      })

      for (i = 0; i < viewTypes.length; i++) {
        spec = this.getViewSpec(viewTypes[i])
        if (spec) {
          if (spec.singleUnit === unit) {
            return spec
          }
        }
      }
    }
  }


  // Builds an object with information on how to create a given view
  buildViewSpec(requestedViewType) {
    let viewOverrides = this.optionsManager.overrides.views || {}
    let specChain = [] // for the view. lowest to highest priority
    let defaultsChain = [] // for the view. lowest to highest priority
    let overridesChain = [] // for the view. lowest to highest priority
    let viewType = requestedViewType
    let spec // for the view
    let overrides // for the view
    let durationInput
    let duration
    let unit

    // iterate from the specific view definition to a more general one until we hit an actual View class
    while (viewType) {
      spec = viewHash[viewType]
      overrides = viewOverrides[viewType]
      viewType = null // clear. might repopulate for another iteration

      if (typeof spec === 'function') { // TODO: deprecate
        spec = { 'class': spec }
      }

      if (spec) {
        specChain.unshift(spec)
        defaultsChain.unshift(spec.defaults || {})
        durationInput = durationInput || spec.duration
        viewType = viewType || spec.type
      }

      if (overrides) {
        overridesChain.unshift(overrides) // view-specific option hashes have options at zero-level
        durationInput = durationInput || overrides.duration
        viewType = viewType || overrides.type
      }
    }

    spec = mergeProps(specChain)
    spec.type = requestedViewType
    if (!spec['class']) {
      return false
    }

    // fall back to top-level `duration` option
    durationInput = durationInput ||
      this.optionsManager.dynamicOverrides.duration ||
      this.optionsManager.overrides.duration

    if (durationInput) {
      duration = moment.duration(durationInput)

      if (duration.valueOf()) { // valid?

        unit = computeDurationGreatestUnit(duration, durationInput)

        spec.duration = duration
        spec.durationUnit = unit

        // view is a single-unit duration, like "week" or "day"
        // incorporate options for this. lowest priority
        if (duration.as(unit) === 1) {
          spec.singleUnit = unit
          overridesChain.unshift(viewOverrides[unit] || {})
        }
      }
    }

    spec.defaults = mergeOptions(defaultsChain)
    spec.overrides = mergeOptions(overridesChain)

    this.buildViewSpecOptions(spec)
    this.buildViewSpecButtonText(spec, requestedViewType)

    return spec
  }


  // Builds and assigns a view spec's options object from its already-assigned defaults and overrides
  buildViewSpecOptions(spec) {
    let optionsManager = this.optionsManager

    spec.options = mergeOptions([ // lowest to highest priority
      globalDefaults,
      spec.defaults, // view's defaults (from ViewSubclass.defaults)
      optionsManager.dirDefaults,
      optionsManager.localeDefaults, // locale and dir take precedence over view's defaults!
      optionsManager.overrides, // calendar's overrides (options given to constructor)
      spec.overrides, // view's overrides (view-specific options)
      optionsManager.dynamicOverrides // dynamically set via setter. highest precedence
    ])
    populateInstanceComputableOptions(spec.options)
  }


  // Computes and assigns a view spec's buttonText-related options
  buildViewSpecButtonText(spec, requestedViewType) {
    let optionsManager = this.optionsManager

    // given an options object with a possible `buttonText` hash, lookup the buttonText for the
    // requested view, falling back to a generic unit entry like "week" or "day"
    function queryButtonText(options) {
      let buttonText = options.buttonText || {}
      return buttonText[requestedViewType] ||
        // view can decide to look up a certain key
        (spec.buttonTextKey ? buttonText[spec.buttonTextKey] : null) ||
        // a key like "month"
        (spec.singleUnit ? buttonText[spec.singleUnit] : null)
    }

    // highest to lowest priority
    spec.buttonTextOverride =
      queryButtonText(optionsManager.dynamicOverrides) ||
      queryButtonText(optionsManager.overrides) || // constructor-specified buttonText lookup hash takes precedence
      spec.overrides.buttonText // `buttonText` for view-specific options is a string

    // highest to lowest priority. mirrors buildViewSpecOptions
    spec.buttonTextDefault =
      queryButtonText(optionsManager.localeDefaults) ||
      queryButtonText(optionsManager.dirDefaults) ||
      spec.defaults.buttonText || // a single string. from ViewSubclass.defaults
      queryButtonText(globalDefaults) ||
      (spec.duration ? this._calendar.humanizeDuration(spec.duration) : null) || // like "3 days"
      requestedViewType // fall back to given view name
  }

}
