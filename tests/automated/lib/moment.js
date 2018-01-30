
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
          var actualStr = $.fullCalendar.moment.parseZone(actual).format()
          var expectedStr = $.fullCalendar.moment.parseZone(expected).format()
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
          var actualMoment = $.fullCalendar.moment.parseZone(actual)
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
