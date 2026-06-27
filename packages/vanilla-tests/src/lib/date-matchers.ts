import { parseUtcDate, parseLocalDate } from './date-parsing'

beforeEach(() => {
  jasmine.addMatchers({

    toEqualDate() {
      return {
        compare(actual, expected) {
          let result

          if (typeof expected === 'string') {
            expected = parseUtcDate(expected)
          }

          if (!(actual instanceof Date)) {
            result = {
              pass: false,
              message: 'Actual value ' + actual + ' needs to be an instance of a Date',
            }
          } else if (!(expected instanceof Date)) {
            result = {
              pass: false,
              message: 'Expected value ' + expected + ' needs to be an instance of a Date',
            }
          } else if (actual.valueOf() !== expected.valueOf()) {
            result = {
              pass: false,
              message: 'Date ' + actual.toUTCString() + ' does not equal ' + expected.toUTCString(),
            }
          } else {
            result = { pass: true }
          }

          return result
        },
      }
    },

    toEqualLocalDate() {
      return {
        compare(actual, expected) {
          let result

          if (typeof expected === 'string') {
            expected = parseLocalDate(expected)
          }

          if (!(actual instanceof Date)) {
            result = {
              pass: false,
              message: 'Actual value ' + actual + ' needs to be an instance of a Date',
            }
          } else if (!(expected instanceof Date)) {
            result = {
              pass: false,
              message: 'Expected value ' + expected + ' needs to be an instance of a Date',
            }
          } else if (actual.valueOf() !== expected.valueOf()) {
            result = {
              pass: false,
              message: 'Date ' + actual.toString() + ' does not equal ' + expected.toString(),
            }
          } else {
            result = { pass: true }
          }

          return result
        },
      }
    },

    toEqualNow() {
      return {
        compare(actual) {
          let result

          if (!(actual instanceof Date)) {
            result = {
              pass: false,
              message: 'Actual value ' + actual + ' needs to be an instance of a Date',
            }
          } else if (Math.abs(actual.valueOf() - new Date().valueOf()) > 1000) {
            result = {
              pass: false,
              message: 'Date ' + actual.toUTCString() + ' is not close enough to now',
            }
          } else {
            result = { pass: true }
          }

          return result
        },
      }
    },

  })
})
