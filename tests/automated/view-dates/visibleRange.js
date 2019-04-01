import { addLocalDays, startOfLocalDay, startOfUtcDay, addUtcDays } from '../lib/date-math'
import { expectActiveRange } from './ViewDateUtils'
import { parseUtcDate, parseLocalDate } from '../lib/date-parsing'

describe('visibleRange', function() {

  describe('when custom view with a flexible range', function() {
    pushOptions({
      defaultView: 'timeGrid'
    })

    describe('when given a valid date range', function() {
      var startInput = '2017-06-26'
      var endInput = '2017-06-29'

      describeOptions('visibleRange', {
        'of Date objects': {
          start: new Date(startInput),
          end: new Date(endInput)
        },
        'of strings': {
          start: startInput,
          end: endInput
        },
        'of a function that returns date objects': function() {
          return {
            start: new Date(startInput),
            end: new Date(endInput)
          }
        },
        'of a function that returns strings': function() {
          return {
            start: startInput,
            end: endInput
          }
        }
      }, function() {
        it('gets set to the given range', function() {
          initCalendar()
          expectActiveRange(startInput, endInput)
        })
      })

      it('works as a custom view', function() {
        initCalendar({
          views: {
            myCustomView: {
              type: 'timeGrid',
              visibleRange: {
                start: startInput,
                end: endInput
              }
            }
          },
          defaultView: 'myCustomView'
        })
        expectActiveRange(startInput, endInput)
      })

      it('ignores dateAlignment', function() {
        initCalendar({
          dateAlignment: 'dayGridMonth',
          visibleRange: {
            start: startInput,
            end: endInput
          }
        })
        expectActiveRange(startInput, endInput)
      })

      it('works as a dynamic option', function() {
        initCalendar({
          defaultView: 'dayGrid'
        })
        currentCalendar.setOption('visibleRange', {
          start: startInput,
          end: endInput
        })
        expectActiveRange(startInput, endInput)
      })
    })

    describe('when a function', function() {
      var defaultDateInput = '2017-06-08T12:30:00'

      it('receives the calendar\'s defaultDate, with local timezone, and emits local range', function() {
        var matched = false

        initCalendar({
          timeZone: 'local',
          defaultDate: defaultDateInput,
          visibleRange: function(date) {
            // this function will receive the date for prev/next,
            // which should be ignored. make sure just one call matches.
            if (date.valueOf() === parseLocalDate(defaultDateInput).valueOf()) {
              matched = true
            }

            let dayStart = startOfLocalDay(date)
            return {
              start: addLocalDays(dayStart, -1),
              end: addLocalDays(dayStart, 2)
            }
          }
        })

        expect(matched).toBe(true)
        expectActiveRange('2017-06-07', '2017-06-10')
      })

      it('receives the calendar\'s defaultDate, with UTC timezone, and emits UTC range', function() {
        var matched = false

        initCalendar({
          timeZone: 'UTC',
          defaultDate: defaultDateInput,
          visibleRange: function(date) {
            // this function will receive the date for prev/next,
            // which should be ignored. make sure just one call matches.
            if (date.valueOf() === parseUtcDate(defaultDateInput).valueOf()) {
              matched = true
            }

            let dayStart = startOfUtcDay(date)
            return {
              start: addUtcDays(dayStart, -1),
              end: addUtcDays(dayStart, 2)
            }
          }
        })

        expect(matched).toBe(true)
        expectActiveRange('2017-06-07', '2017-06-10')
      })

      // https://github.com/fullcalendar/fullcalendar/issues/4517
      it('can emit and timed UTC range that will be rounded', function() {
        initCalendar({
          dateIncrement: { days: 3 },
          timeZone: 'UTC',
          defaultDate: defaultDateInput,
          visibleRange: function(date) {
            return {
              start: addUtcDays(date, -1), // 2017-06-07T12:30:00 -> 2017-06-07
              end: addUtcDays(date, 2) // 2017-06-10T12:30:00 -> 2017-06-11
            }
          }
        })
        expectActiveRange('2017-06-07', '2017-06-11')
        currentCalendar.prev()
        expectActiveRange('2017-06-04', '2017-06-07') // second computation will round down the end
      })

    })

    describe('when given an invalid range', function() {

      describeOptions('visibleRange', {
        'with end before start': {
          start: '2017-06-18',
          end: '2017-06-15'
        },
        'with no end': {
          start: '2017-06-18'
        },
        'with no start': {
          end: '2017-06-15'
        }
      }, function() {
        it('defaults to the defaultDate', function() { // TODO: have it report an warning
          initCalendar({
            defaultDate: '2017-08-01'
          })
          expectActiveRange('2017-08-01', '2017-08-02')
        })
      })
    })

    describe('when later switching to a one-day view', function() {

      it('constrains an earlier current date to the start of visibleRange', function() {
        initCalendar({
          defaultDate: '2017-06-25',
          visibleRange: {
            start: '2017-06-26',
            end: '2017-06-29'
          }
        })
        currentCalendar.changeView('timeGridDay')
        expectActiveRange('2017-06-26', '2017-06-27')
      })

      it('constrains a later the current date to the start of visibleRange', function() {
        initCalendar({
          defaultDate: '2017-07-01',
          visibleRange: {
            start: '2017-06-26',
            end: '2017-06-29'
          }
        })
        currentCalendar.changeView('timeGridDay')
        expectActiveRange('2017-06-26', '2017-06-27')
      })
    })
  })

  describe('when a list view', function() {
    pushOptions({
      defaultView: 'list',
      visibleRange: {
        start: '2017-06-07',
        end: '2017-06-10'
      },
      events: [
        { start: '2017-06-08' }
      ]
    })

    it('respects the given range', function() {
      initCalendar()
      expectActiveRange('2017-06-07', '2017-06-10')
    })
  })

  describe('when custom view with fixed duration', function() {
    pushOptions({
      defaultDate: '2015-06-08',
      defaultView: 'timeGrid',
      duration: { days: 3 }
    })

    it('ignores the given visibleRange', function() {
      initCalendar({
        visibleRange: {
          start: '2017-06-29',
          end: '2017-07-04'
        }
      })
      expectActiveRange('2015-06-08', '2015-06-11')
    })
  })

  describe('when standard view', function() {
    pushOptions({
      defaultDate: '2015-06-08',
      defaultView: 'timeGridWeek'
    })

    it('ignores the given visibleRange', function() {
      initCalendar({
        visibleRange: {
          start: '2017-06-29',
          end: '2017-07-04'
        }
      })
      expectActiveRange('2015-06-07', '2015-06-14')
    })
  })

})
