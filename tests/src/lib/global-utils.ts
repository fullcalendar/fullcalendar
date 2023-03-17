import { Calendar, CalendarOptions } from '@fullcalendar/core'
import { createPlugin } from '@fullcalendar/core'
import { parseLocalDate, parseUtcDate } from './date-parsing.js'

// Other Important Global Stuff
// ---------------------------------------------------------------------------------------------------------------------

import './hacks.js'
import './simulate.js'
import './date-matchers.js'

// Setup / Teardown
// ---------------------------------------------------------------------------------------------------------------------

let optionsStack = null

beforeEach(() => {
  optionsStack = []
})

afterEach(() => {
  optionsStack = null

  if (window.currentCalendar) {
    window.currentCalendar.destroy()
    window.currentCalendar = null
  }

  $('#calendar').remove()
})

// Calendar Options and Initialization
// ---------------------------------------------------------------------------------------------------------------------

function pushOptions(options: CalendarOptions) {
  beforeEach(() => {
    optionsStack.push(options)
  })
}

// called within an `it`
// needs to be called *before* initCalendar
function spyOnCalendarCallback(name, func?) {
  let options = {} as any

  options[name] = func || (() => {})
  spyOn(options, name).and.callThrough()

  optionsStack.push(options)

  return options[name]
}

function initCalendar(moreOptions?: CalendarOptions, el?) {
  let $el

  if (moreOptions) {
    optionsStack.push(moreOptions)
  }

  if (el) {
    $el = $(el)
  } else {
    $el = $('<div id="calendar">').appendTo('body')
  }

  if (window.currentCalendar) {
    window.currentCalendar.destroy()
  }

  let options = getCurrentOptions()
  let newCalendar = null

  options.plugins = options.plugins.concat([
    createPlugin({
      name: 'current-calendar-' + Date.now(), // ugh, might be called twice per calendar
      contextInit(context) {
        newCalendar = window.currentCalendar = context.calendarApi as Calendar
      },
    }),
  ])

  let cool = new Calendar($el[0], options)

  if (newCalendar === window.currentCalendar) {
    newCalendar.render()
  } else {
    newCalendar.destroy()
  }

  return cool
}

function getCurrentOptions() {
  let args = [{}].concat(optionsStack) as any
  return $.extend.apply($, args) // eslint-disable-line prefer-spread
}

// Categorizing Tests
// ---------------------------------------------------------------------------------------------------------------------

/*
describeOptions(optionName, descriptionAndValueHash, callback)
describeOptions(descriptionAndOptionsHash, callback)
 */
function describeOptions(optName, hash?, callback?) {
  if ($.type(optName) === 'object') {
    callback = hash
    hash = optName
    optName = null
  }

  $.each(
    hash,
    (desc, val) => {
      let opts

      if (optName) {
        opts = {}
        opts[optName] = val
      } else {
        opts = val
      }
      opts = $.extend(true, {}, opts)

      describe(desc as string, () => {
        pushOptions(opts)
        callback(val)
      })
    },
  )
}

function describeValues(hash, callback) {
  $.each(
    hash,
    /**
     * @param desc {string}
     */
    (desc, val) => {
      describe(desc as string, () => {
        callback(val)
      })
    },
  )
}

// Timezone Tests (needed?)
// ---------------------------------------------------------------------------------------------------------------------

const timeZoneScenarios = {
  local: {
    description: 'when local timezone',
    value: 'local',
    parseDate: parseLocalDate,
  },
  UTC: {
    description: 'when UTC timezone',
    value: 'UTC',
    parseDate: parseUtcDate,
  },
}

function describeTimeZones(callback) {
  $.each(timeZoneScenarios, (name, scenario) => {
    describe(scenario.description, () => {
      pushOptions({
        timeZone: name,
      })
      callback(scenario)
    })
  })
}

function describeTimeZone(name, callback) {
  let scenario = timeZoneScenarios[name]

  describe(scenario.description, () => {
    pushOptions({
      timeZone: name,
    })
    callback(scenario)
  })
}

// Misc
// ---------------------------------------------------------------------------------------------------------------------

function oneCall(func) {
  let called
  called = false
  return function () { // eslint-disable-line func-names
    if (!called) {
      called = true
      return func.apply(this, arguments) // eslint-disable-line prefer-rest-params
    }
    return null
  }
}

function spyOnMethod(Class, methodName, dontCallThrough) {
  let origMethod = Class.prototype.hasOwnProperty(methodName) // eslint-disable-line no-prototype-builtins
    ? Class.prototype[methodName]
    : null

  let spy = spyOn(Class.prototype, methodName)

  if (!dontCallThrough) {
    spy = spy.and.callThrough()
  }

  (spy as any).restore = () => {
    if (origMethod) {
      Class.prototype[methodName] = origMethod
    } else {
      delete Class.prototype[methodName]
    }
  }

  return spy
}

// wraps an existing function in a spy, calling through to the function
function spyCall(func?) {
  func = func || (() => {})
  const obj = { func }
  spyOn(obj, 'func').and.callThrough()
  return obj.func
}

type spyOnCalendarCallbackType = typeof spyOnCalendarCallback
type pushOptionsType = typeof pushOptions
type initCalendarType = typeof initCalendar
type getCurrentOptionsType = typeof getCurrentOptions
type describeOptionsType = typeof describeOptions
type describeValuesType = typeof describeValues
type describeTimeZonesType = typeof describeTimeZones
type describeTimeZoneType = typeof describeTimeZone
type oneCallType = typeof oneCall
type spyOnMethodType = typeof spyOnMethod
type spyCallType = typeof spyCall

declare global {

  let currentCalendar: Calendar
  let spyOnCalendarCallback: spyOnCalendarCallbackType
  let pushOptions: pushOptionsType
  let initCalendar: initCalendarType
  let getCurrentOptions: getCurrentOptionsType
  let describeOptions: describeOptionsType
  let describeValues: describeValuesType
  let describeTimeZones: describeTimeZonesType
  let describeTimeZone: describeTimeZoneType
  let oneCall: oneCallType
  let spyOnMethod: spyOnMethodType
  let spyCall: spyCallType

  interface Window { // how to unify this with the above let statements?
    currentCalendar: Calendar
    karmaConfig: any
  }

  interface Function {
    calls: any // for jasmine spies
  }

  interface JQueryStatic {
    simulate: any
    simulateMouseClick: any
    simulateTouchClick: any
    simulateByPoint: any
    _data: any
  }

  interface JQuery {
    simulate: any
    draggable: any
    sortable: any
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jasmine {
    interface Matchers<T> {
      toEqualDate: any
      toEqualLocalDate: any
      toEqualNow: any
      toBeBoundedBy: any
      toIntersectWith: any
      toBeAbove: any
      toBeBelow: any
      toBeRightOf: any
      toBeLeftOf: any
      toHaveScrollbars: any
      toBeMostlyHBoundedBy: any
      toBeMostlyAbove: any
      toBeMostlyLeftOf: any
      toBeMostlyRightOf: any
    }
  }

}

Object.assign(window, {
  spyOnCalendarCallback,
  pushOptions,
  initCalendar,
  getCurrentOptions,
  describeOptions,
  describeValues,
  describeTimeZones,
  describeTimeZone,
  oneCall,
  spyOnMethod,
  spyCall,
})

pushOptions({
  timeZone: 'UTC',
  eventDisplay: 'auto',
})
