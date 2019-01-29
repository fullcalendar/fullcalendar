import './hacks'
import './lib/simulate'
import './lib/date-matchers'
import { Calendar } from '@fullcalendar/core'
import InteractionPlugin from '@fullcalendar/interaction'
import DayGridPlugin from '@fullcalendar/daygrid'
import TimeGridPlugin from '@fullcalendar/timegrid'
import ListPlugin from '@fullcalendar/list'


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
function spyOnCalendarCallback(name, func) {

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

  new Calendar($el[0], options)

  if (newCalendar === window['currentCalendar']) {
    newCalendar.render()
  } else {
    newCalendar.destroy()
  }
}

function getCurrentOptions() {
  return $.extend.apply($, [ {} ].concat(optionsStack))
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

  $.each(hash, function(desc, val) {
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
  })
}

function describeValues(hash, callback) {
  $.each(hash, function(desc, val) {
    describe(desc, function() {
      callback(val)
    })
  })
}


// Timezone Tests (needed?)
// ---------------------------------------------------------------------------------------------------------------------
// NOTE:
// new Date('YYYY-MM-DD') --- parsed as UTC
// new Date('YYYY-MM-DDT00:00:00') --- parsed as local

const timeZoneScenarios = {
  local: {
    description: 'when local timezone',
    value: 'local',
    createDate: function(str) {
      if (str.length <= 10) { // doesn't have a time part?
        str += 'T00:00:00' // will force it to parse as local
      }
      return new Date(str)
    }
  },
  UTC: {
    description: 'when UTC timezone',
    value: 'UTC',
    createDate: function(str) {
      if (str.length > 10) { // has a time part?
        str += 'Z' // will force it to parse as UTC
      }
      return new Date(str)
    }
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


Object.assign(window, {
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


// Defaults that apply to all tests
// ---------------------------------------------------------------------------------------------------------------------

const DEFAULT_PLUGINS = [
  InteractionPlugin,
  DayGridPlugin,
  TimeGridPlugin,
  ListPlugin
]

pushOptions({
  timeZone: 'UTC',
  plugins: DEFAULT_PLUGINS
})
