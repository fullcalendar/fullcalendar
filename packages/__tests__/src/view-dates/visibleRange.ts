import { addLocalDays, startOfLocalDay, startOfUtcDay, addUtcDays } from '../lib/date-math'
import { expectActiveRange } from '../lib/ViewDateUtils'
import { parseUtcDate, parseLocalDate } from '../lib/date-parsing'

describe('visibleRange', () => {
  describe('when custom view with a flexible range', () => {
    pushOptions({
      initialView: 'timeGrid',
    })

    describe('when given a valid date range', () => {
      let startInput = '2017-06-26'
      let endInput = '2017-06-29'

      describeOptions('visibleRange', {
        'of Date objects': {
          start: new Date(startInput),
          end: new Date(endInput),
        },
        'of strings': {
          start: startInput,
          end: endInput,
        },
        'of a function that returns date objects': () => ({
          start: new Date(startInput),
          end: new Date(endInput),
        }),
        'of a function that returns strings': () => ({
          start: startInput,
          end: endInput,
        }),
      }, () => {
        it('gets set to the given range', () => {
          initCalendar()
          expectActiveRange(startInput, endInput)
        })
      })

      it('works as a custom view', () => {
        initCalendar({
          views: {
            myCustomView: {
              type: 'timeGrid',
              visibleRange: {
                start: startInput,
                end: endInput,
              },
            },
          },
          initialView: 'myCustomView',
        })
        expectActiveRange(startInput, endInput)
      })

      it('ignores dateAlignment', () => {
        initCalendar({
          dateAlignment: 'dayGridMonth',
          visibleRange: {
            start: startInput,
            end: endInput,
          },
        })
        expectActiveRange(startInput, endInput)
      })

      it('works as a dynamic option', () => {
        initCalendar({
          initialView: 'dayGrid',
        })
        currentCalendar.setOption('visibleRange', {
          start: startInput,
          end: endInput,
        })
        expectActiveRange(startInput, endInput)
      })
    })

    describe('when a function', () => {
      let initialDateInput = '2017-06-08T12:30:00'

      it('receives the calendar\'s initialDate, with local timezone, and emits local range', () => {
        let matched = false

        initCalendar({
          timeZone: 'local',
          initialDate: initialDateInput,
          visibleRange(date) {
            // this function will receive the date for prev/next,
            // which should be ignored. make sure just one call matches.
            if (date.valueOf() === parseLocalDate(initialDateInput).valueOf()) {
              matched = true
            }

            let dayStart = startOfLocalDay(date)
            return {
              start: addLocalDays(dayStart, -1),
              end: addLocalDays(dayStart, 2),
            }
          },
        })

        expect(matched).toBe(true)
        expectActiveRange(parseLocalDate('2017-06-07'), parseLocalDate('2017-06-10'))
      })

      it('receives the calendar\'s initialDate, with UTC timezone, and emits UTC range', () => {
        let matched = false

        initCalendar({
          timeZone: 'UTC',
          initialDate: initialDateInput,
          visibleRange(date) {
            // this function will receive the date for prev/next,
            // which should be ignored. make sure just one call matches.
            if (date.valueOf() === parseUtcDate(initialDateInput).valueOf()) {
              matched = true
            }

            let dayStart = startOfUtcDay(date)
            return {
              start: addUtcDays(dayStart, -1),
              end: addUtcDays(dayStart, 2),
            }
          },
        })

        expect(matched).toBe(true)
        expectActiveRange('2017-06-07', '2017-06-10')
      })

      // https://github.com/fullcalendar/fullcalendar/issues/4517
      it('can emit and timed UTC range that will be rounded', () => {
        initCalendar({
          dateIncrement: { days: 3 },
          timeZone: 'UTC',
          initialDate: initialDateInput,
          visibleRange(date) {
            return {
              start: addUtcDays(date, -1), // 2017-06-07T12:30:00 -> 2017-06-07
              end: addUtcDays(date, 2), // 2017-06-10T12:30:00 -> 2017-06-11
            }
          },
        })
        expectActiveRange('2017-06-07', '2017-06-11')
        currentCalendar.prev()
        expectActiveRange('2017-06-04', '2017-06-07') // second computation will round down the end
      })
    })

    describe('when given an invalid range', () => {
      describeOptions('visibleRange', {
        'with end before start': {
          start: '2017-06-18',
          end: '2017-06-15',
        },
        'with no end': {
          start: '2017-06-18',
        },
        'with no start': {
          end: '2017-06-15',
        },
      }, () => {
        it('defaults to the initialDate', () => { // TODO: have it report an warning
          initCalendar({
            initialDate: '2017-08-01',
          })
          expectActiveRange('2017-08-01', '2017-08-02')
        })
      })
    })

    describe('when later switching to a one-day view', () => {
      it('constrains an earlier current date to the start of visibleRange', () => {
        initCalendar({
          initialDate: '2017-06-25',
          visibleRange: {
            start: '2017-06-26',
            end: '2017-06-29',
          },
        })
        currentCalendar.changeView('timeGridDay')
        expectActiveRange('2017-06-26', '2017-06-27')
      })

      it('constrains a later current date to the start of visibleRange', () => {
        initCalendar({
          initialDate: '2017-07-01',
          visibleRange: {
            start: '2017-06-26',
            end: '2017-06-29',
          },
        })
        currentCalendar.changeView('timeGridDay')
        expectActiveRange('2017-06-26', '2017-06-27')
      })
    })
  })

  describe('when a list view', () => {
    pushOptions({
      initialView: 'list',
      visibleRange: {
        start: '2017-06-07',
        end: '2017-06-10',
      },
      events: [
        { start: '2017-06-08' },
      ],
    })

    it('respects the given range', () => {
      initCalendar()
      expectActiveRange('2017-06-07', '2017-06-10')
    })
  })

  describe('when custom view with fixed duration', () => {
    pushOptions({
      initialDate: '2015-06-08',
      initialView: 'timeGrid',
      duration: { days: 3 },
    })

    it('ignores the given visibleRange', () => {
      initCalendar({
        visibleRange: {
          start: '2017-06-29',
          end: '2017-07-04',
        },
      })
      expectActiveRange('2015-06-08', '2015-06-11')
    })
  })

  describe('when standard view', () => {
    pushOptions({
      initialDate: '2015-06-08',
      initialView: 'timeGridWeek',
    })

    it('ignores the given visibleRange', () => {
      initCalendar({
        visibleRange: {
          start: '2017-06-29',
          end: '2017-07-04',
        },
      })
      expectActiveRange('2015-06-07', '2015-06-14')
    })
  })
})
