import { expectActiveRange } from './ViewDateUtils'

describe('visibleRange', function() {

  describe('when custom view with a flexible range', function() {
    pushOptions({
      defaultView: 'agenda'
    })

    describe('when given a valid date range', function() {
      var startInput = '2017-06-26'
      var endInput = '2017-06-29'

      describeOptions('visibleRange', {
        'of moment objects': {
          start: $.fullCalendar.moment(startInput),
          end: $.fullCalendar.moment(endInput)
        },
        'of strings': {
          start: startInput,
          end: endInput
        },
        'of a function that returns moment objects': function() {
          return {
            start: $.fullCalendar.moment(startInput),
            end: $.fullCalendar.moment(endInput)
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
              type: 'agenda',
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
          dateAlignment: 'month',
          visibleRange: {
            start: startInput,
            end: endInput
          }
        })
        expectActiveRange(startInput, endInput)
      })

      it('works as a dynamic option', function() {
        initCalendar({
          defaultView: 'basic'
        })
        currentCalendar.option('visibleRange', {
          start: startInput,
          end: endInput
        })
        expectActiveRange(startInput, endInput)
      })
    })

    describe('when a function', function() {
      var defaultDateInput = '2017-06-08T12:30:00'

      it('receives the calendar\'s defaultDate, timezoneless', function() {
        var matched = false

        initCalendar({
          defaultDate: defaultDateInput,
          visibleRange: function(date) {
            // this function will receive the date for prev/next,
            // which should be ignored. make sure just one call matches.
            if (date.format() === defaultDateInput) {
              matched = true
            }
          }
        })

        expect(matched).toBe(true)
      })

      it('receives the calendar\'s defaultDate, with UTC timezone', function() {
        var matched = false

        initCalendar({
          timezone: 'UTC',
          defaultDate: defaultDateInput,
          visibleRange: function(date) {
            // this function will receive the date for prev/next,
            // which should be ignored. make sure just one call matches.
            if (date.format() === defaultDateInput + 'Z') {
              matched = true
            }
          }
        })

        expect(matched).toBe(true)
      })

      it('does not cause side effects when given date is mutated', function() {
        initCalendar({
          defaultDate: defaultDateInput,
          visibleRange: function(date) {
            date.add(1, 'year')
          }
        })
        expect(currentCalendar.getDate()).toEqualMoment(defaultDateInput)
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

      it('constrains the current date to the start of visibleRange', function() {
        initCalendar({
          defaultDate: '2017-06-25',
          visibleRange: {
            start: '2017-06-26',
            end: '2017-06-29'
          }
        })
        currentCalendar.changeView('agendaDay')
        expectActiveRange('2017-06-26', '2017-06-27')
      })

      it('constrains the current date to the end of visibleRange', function() {
        initCalendar({
          defaultDate: '2017-07-01',
          visibleRange: {
            start: '2017-06-26',
            end: '2017-06-29'
          }
        })
        currentCalendar.changeView('agendaDay')
        expectActiveRange('2017-06-28', '2017-06-29')
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
      defaultView: 'agenda',
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
      defaultView: 'agendaWeek'
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
