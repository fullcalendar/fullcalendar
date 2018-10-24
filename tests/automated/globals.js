
// Setup / Teardown
// ---------------------------------------------------------------------------------------------------------------------

var optionsStack = null


beforeEach(function() {
  optionsStack = []
})

afterEach(function() {
  optionsStack = null

  if (window.currentCalendar) {
    window.currentCalendar.destroy()
    window.currentCalendar = null
  }

  $('#calendar').remove()
})


// Calendar Options and Initialization
// ---------------------------------------------------------------------------------------------------------------------

window.pushOptions = function(options) {
  beforeEach(function() {
    return optionsStack.push(options)
  })
}

// called within an `it`
window.spyOnCalendarCallback = function(name, func) {
  var options = {}

  options[name] = func
  spyOn(options, name).and.callThrough()

  optionsStack.push(options)

  return options[name]
}

window.initCalendar = function(moreOptions, el) {
  var $el

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

  var options = getCurrentOptions()
  var newCalendar

  options._init = function() {
    newCalendar = window.currentCalendar = this
  }

  new FullCalendar.Calendar($el[0], options)

  if (newCalendar === window.currentCalendar) {
    newCalendar.render()
  } else {
    newCalendar.destroy()
  }
}

window.getCurrentOptions = function() {
  return $.extend.apply($, [ {} ].concat(optionsStack))
}


// Categorizing Tests
// ---------------------------------------------------------------------------------------------------------------------

/*
describeOptions(optionName, descriptionAndValueHash, callback)
describeOptions(descriptionAndOptionsHash, callback)
 */
window.describeOptions = function(optName, hash, callback) {
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

window.describeValues = function(hash, callback) {
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

window.describeTimeZones = function(callback) {
  $.each(timeZoneScenarios, function(name, scenario) {
    describe(scenario.description, function() {
      pushOptions({
        timeZone: name
      })
      callback(scenario)
    })
  })
}

window.describeTimeZone = function(name, callback) {
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

window.oneCall = function(func) {
  var called
  called = false
  return function() {
    if (!called) {
      called = true
      return func.apply(this, arguments)
    }
  }
}

window.spyOnMethod = function(Class, methodName, dontCallThrough) {
  var origMethod = Class.prototype.hasOwnProperty(methodName)
    ? Class.prototype[methodName]
    : null

  var spy = spyOn(Class.prototype, methodName)

  if (!dontCallThrough) {
    spy = spy.and.callThrough()
  }

  spy.restore = function() {
    if (origMethod) {
      Class.prototype[methodName] = origMethod
    } else {
      delete Class.prototype[methodName]
    }
  }

  return spy
}

// wraps an existing function in a spy, calling through to the function
window.spyCall = function(func) {
  func = func || function() {}
  const obj = { func }
  spyOn(obj, 'func').and.callThrough()
  return obj.func
}


// Defaults that apply to all tests
// ---------------------------------------------------------------------------------------------------------------------

window.pushOptions({
  timeZone: 'UTC'
})

// clear what plugins do. will take affect for all calendars, not just those via initCalendar()
FullCalendar.globalDefaults.timeZoneImpl = null
FullCalendar.globalDefaults.cmdFormatter = null
