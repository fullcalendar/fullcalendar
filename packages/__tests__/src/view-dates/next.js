import { expectActiveRange } from './ViewDateUtils'
import * as TimeGridRenderUtils from '../view-render/TimeGridRenderUtils'


describe('next', function() {
  pushOptions({
    defaultDate: '2017-06-08'
  })

  describe('when in week view', function() {
    pushOptions({
      defaultView: 'timeGridWeek'
    })

    describe('when dateIncrement not specified', function() {
      it('moves forward by one week', function() {
        initCalendar()
        currentCalendar.next()
        expectActiveRange('2017-06-11', '2017-06-18')
      })
    })

    describeOptions('dateIncrement', {
      'when two week dateIncrement specified as a plain object': { weeks: 2 },
      'when two week dateIncrement specified as a string': '14.00:00:00'
    }, function() {
      it('moves forward by two weeks', function() {
        initCalendar()
        currentCalendar.next()
        expectActiveRange('2017-06-18', '2017-06-25')
      })
    })

    it('does not duplicate-render skeleton', function() {
      initCalendar()
      currentCalendar.next()
      expect(TimeGridRenderUtils.isStructureValid()).toBe(true)
    })
  })

  describe('when in a month view', function() {
    pushOptions({
      defaultView: 'dayGridMonth'
    })

    describe('when dateIncrement not specified', function() {

      it('moves forward by one month', function() {
        initCalendar()
        currentCalendar.next()
        expectActiveRange('2017-06-25', '2017-08-06')
      })
    })

    describe('when two month dateIncrement is specified', function() {
      pushOptions({
        dateIncrement: { months: 2 }
      })

      it('moves forward by two months', function() {
        initCalendar()
        currentCalendar.next()
        expectActiveRange('2017-07-30', '2017-09-10')
      })
    })
  })

  describe('when in custom three day view', function() {
    pushOptions({
      defaultView: 'dayGrid',
      duration: { days: 3 }
    })

    describe('when no dateAlignment is specified', function() {

      describe('when dateIncrement not specified', function() {
        it('moves forward three days', function() {
          initCalendar()
          currentCalendar.next()
          expectActiveRange('2017-06-11', '2017-06-14')
        })
      })

      describe('when two day dateIncrement is specified', function() {
        pushOptions({
          dateIncrement: { days: 2 }
        })
        it('moves forward two days', function() {
          initCalendar()
          currentCalendar.next()
          expectActiveRange('2017-06-10', '2017-06-13')
        })
      })
    })

    describe('when week dateAlignment is specified', function() {
      pushOptions({
        dateAlignment: 'week'
      })

      describe('when dateIncrement not specified', function() {
        it('moves forward one week', function() {
          initCalendar()
          currentCalendar.next()
          expectActiveRange('2017-06-11', '2017-06-14')
        })
      })

      describe('when two day dateIncrement is specified', function() {
        pushOptions({
          dateIncrement: { days: 2 }
        })

        it('does not navigate nor rerender', function() {
          var called

          initCalendar({
            datesRender: function() {
              called = true
            }
          })

          called = false
          currentCalendar.next()

          expectActiveRange('2017-06-04', '2017-06-07') // the same as how it started
          expect(called).toBe(false)
        })
      })
    })
  })

  describe('when in a custom two day view and weekends:false', function() {
    pushOptions({
      weekends: false,
      defaultView: 'timeGrid',
      duration: { days: 2 }
    })

    it('skips over weekends if there would be alignment with weekend', function() {
      initCalendar({
        defaultDate: '2017-11-09'
      })
      currentCalendar.next()
    })
  })
})
