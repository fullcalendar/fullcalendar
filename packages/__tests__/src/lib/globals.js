
/// <reference path="./global-defs.d.ts" />

import { Calendar } from '@fullcalendar/core'
import { __assign } from 'tslib'
import { parseLocalDate, parseUtcDate } from './date-parsing'


// Setup / Teardown
// ---------------------------------------------------------------------------------------------------------------------

var optionsStack = null


beforeEach(function() {
  optionsStack = []
})

afterEach(function() {
  optionsStack = null

  if (window['currentCalendar']) {
    window['currentCalendar'].destroy()
    window['currentCalendar'] = null
  }

  $('#calendar').remove()
})


// Calendar Options and Initialization
// ---------------------------------------------------------------------------------------------------------------------

function pushOptions(options) {
  beforeEach(function() {
    return optionsStack.push(options)
  })
}

// called within an `it`
// needs to be called *before* initCalendar
function spyOnCalendarCallback(name, func = function(){}) {

  /** @type {any} */
  var options = {}

  options[name] = func
  spyOn(options, name).and.callThrough()

  optionsStack.push(options)

  return options[name]
}

function initCalendar(moreOptions, el) {
  var $el

  if (moreOptions) {
    optionsStack.push(moreOptions)
  }

  if (el) {
    $el = $(el)
  } else {
    $el = $('<div id="calendar">').appendTo('body')
  }

  if (window['currentCalendar']) {
    window['currentCalendar'].destroy()
  }

  var options = getCurrentOptions()

  /** @type {any} */
  var newCalendar = null

  options._init = function() {
    newCalendar = window['currentCalendar'] = this
  }

  var cool = new Calendar($el[0], options)

  if (newCalendar === window['currentCalendar']) {
    newCalendar.render()
  } else {
    newCalendar.destroy()
  }

  return cool
}

function getCurrentOptions() {
  /** @type {any} */
  let args = [ {} ].concat(optionsStack)

  return $.extend.apply($, args)
}


// Categorizing Tests
// ---------------------------------------------------------------------------------------------------------------------

/*
describeOptions(optionName, descriptionAndValueHash, callback)
describeOptions(descriptionAndOptionsHash, callback)
 */
function describeOptions(optName, hash, callback) {
  if ($.type(optName) === 'object') {
    callback = hash
    hash = optName
    optName = null
  }

  $.each(
    hash,
    /**
     * @param desc {string}
     */
    function(desc, val) {
      var opts

      if (optName) {
        opts = {}
        opts[optName] = val
      } else {
        opts = val
      }
      opts = $.extend(true, {}, opts)

      describe(desc, function() {
        pushOptions(opts)
        callback(val)
      })
    }
  )
}

function describeValues(hash, callback) {
  $.each(
    hash,
    /**
     * @param desc {string}
     */
    function(desc, val) {
      describe(desc, function() {
        callback(val)
      })
    }
  )
}


// Timezone Tests (needed?)
// ---------------------------------------------------------------------------------------------------------------------

const timeZoneScenarios = {
  local: {
    description: 'when local timezone',
    value: 'local',
    parseDate: parseLocalDate
  },
  UTC: {
    description: 'when UTC timezone',
    value: 'UTC',
    parseDate: parseUtcDate
  }
}

function describeTimeZones(callback) {
  $.each(timeZoneScenarios, function(name, scenario) {
    describe(scenario.description, function() {
      pushOptions({
        timeZone: name
      })
      callback(scenario)
    })
  })
}

function describeTimeZone(name, callback) {
  var scenario = timeZoneScenarios[name]

  describe(scenario.description, function() {
    pushOptions({
      timeZone: name
    })
    callback(scenario)
  })
}


// Misc
// ---------------------------------------------------------------------------------------------------------------------

function oneCall(func) {
  var called
  called = false
  return function() {
    if (!called) {
      called = true
      return func.apply(this, arguments)
    }
  }
}

function spyOnMethod(Class, methodName, dontCallThrough) {
  var origMethod = Class.prototype.hasOwnProperty(methodName)
    ? Class.prototype[methodName]
    : null

  var spy = spyOn(Class.prototype, methodName)

  if (!dontCallThrough) {
    spy = spy.and.callThrough()
  }

  spy['restore'] = function() {
    if (origMethod) {
      Class.prototype[methodName] = origMethod
    } else {
      delete Class.prototype[methodName]
    }
  }

  return spy
}

// wraps an existing function in a spy, calling through to the function
function spyCall(func) {
  func = func || function() {}
  const obj = { func }
  spyOn(obj, 'func').and.callThrough()
  return obj.func
}


__assign(window, {
  pushOptions,
  spyOnCalendarCallback,
  initCalendar,
  getCurrentOptions,
  describeOptions,
  describeValues,
  describeTimeZones,
  describeTimeZone,
  oneCall,
  spyOnMethod,
  spyCall
})


// Other Important Global Stuff
// ---------------------------------------------------------------------------------------------------------------------

import './hacks'
import './simulate'
import './date-matchers'

pushOptions({
  timeZone: 'UTC',
  eventDisplay: 'auto'
})
