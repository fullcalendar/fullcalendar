
beforeEach(function() {
  jasmine.addMatchers({
    toEqualDate() {
      return {
        compare: function(actual, expected) {
          var result;

          if (typeof expected === 'string') {
            expected = new Date(expected)
          }

          if (!(actual instanceof Date)) {
            result = {
              pass: false,
              message: 'Actual value ' + actual + ' needs to be an instance of a Date'
            }
          } else if (!(expected instanceof Date)) {
            result = {
              pass: false,
              message: 'Expected value ' + expected + ' needs to be an instance of a Date'
            }
          } else if (actual.valueOf() !== expected.valueOf()) {
            result = {
              pass: false,
              message: 'Date ' + actual.toUTCString() + ' does not equal ' + expected.toUTCString()
            }
          } else {
            result = { pass: true }
          }

          return result
        }
      }
    }
  })
})

// kill all this...

function serializeDuration(duration) {
  return Math.floor(duration.asDays()) + '.' +
    pad(duration.hours(), 2) + ':' +
    pad(duration.minutes(), 2) + ':' +
    pad(duration.seconds(), 2) + '.' +
    pad(duration.milliseconds(), 3)
}

function pad(n, width) {
  n = n + ''
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n
}

beforeEach(function() {
  jasmine.addMatchers({

    toEqualMoment() {
      return {
        compare: function(actual, expected) {
          var actualStr = FullCalendar.moment.parseZone(actual).format()
          var expectedStr = FullCalendar.moment.parseZone(expected).format()
          var result = {
            pass: actualStr === expectedStr
          }
          if (!result.pass) {
            result.message = 'Moment ' + actualStr + ' does not equal ' + expectedStr
          }
          return result
        }
      }
    },
    toEqualNow() {
      return {
        compare: function(actual) {
          var actualMoment = FullCalendar.moment.parseZone(actual)
          var result = {
            pass: Math.abs(actualMoment - new Date()) < 1000 // within a second of current datetime
          }
          if (!result.pass) {
            result.message = 'Moment ' + actualMoment.format() + ' is not close enough to now'
          }
          return result
        }
      }
    },
    toEqualDuration() {
      return {
        compare: function(actual, expected) {
          var actualStr = serializeDuration(moment.duration(actual))
          var expectedStr = serializeDuration(moment.duration(expected))
          var result = {
            pass: actualStr === expectedStr
          }
          if (!result.pass) {
            result.message = 'Duration ' + actualStr + ' does not equal ' + expectedStr
          }
          return result
        }
      }
    }

  })
})
