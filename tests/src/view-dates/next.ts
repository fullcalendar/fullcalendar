import { expectActiveRange } from '../lib/ViewDateUtils.js'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('next', () => {
  pushOptions({
    initialDate: '2017-06-08',
  })

  describe('when in week view', () => {
    pushOptions({
      initialView: 'timeGridWeek',
    })

    describe('when dateIncrement not specified', () => {
      it('moves forward by one week', () => {
        initCalendar()
        currentCalendar.next()
        expectActiveRange('2017-06-11', '2017-06-18')
      })
    })

    describeOptions('dateIncrement', {
      'when two week dateIncrement specified as a plain object': { weeks: 2 },
      'when two week dateIncrement specified as a string': '14.00:00:00',
    }, () => {
      it('moves forward by two weeks', () => {
        initCalendar()
        currentCalendar.next()
        expectActiveRange('2017-06-18', '2017-06-25')
      })
    })

    it('does not duplicate-render skeleton', () => {
      let calendar = initCalendar()
      calendar.next()
      let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
      expect(timeGridWrapper.isStructureValid()).toBe(true)
    })
  })

  describe('when in a month view', () => {
    pushOptions({
      initialView: 'dayGridMonth',
    })

    describe('when dateIncrement not specified', () => {
      it('moves forward by one month', () => {
        initCalendar()
        currentCalendar.next()
        expectActiveRange('2017-06-25', '2017-08-06')
      })
    })

    describe('when two month dateIncrement is specified', () => {
      pushOptions({
        dateIncrement: { months: 2 },
      })

      it('moves forward by two months', () => {
        initCalendar()
        currentCalendar.next()
        expectActiveRange('2017-07-30', '2017-09-10')
      })
    })
  })

  describe('when in custom three day view', () => {
    pushOptions({
      initialView: 'dayGrid',
      duration: { days: 3 },
    })

    describe('when no dateAlignment is specified', () => {
      describe('when dateIncrement not specified', () => {
        it('moves forward three days', () => {
          initCalendar()
          currentCalendar.next()
          expectActiveRange('2017-06-11', '2017-06-14')
        })
      })

      describe('when two day dateIncrement is specified', () => {
        pushOptions({
          dateIncrement: { days: 2 },
        })
        it('moves forward two days', () => {
          initCalendar()
          currentCalendar.next()
          expectActiveRange('2017-06-10', '2017-06-13')
        })
      })
    })

    describe('when week dateAlignment is specified', () => {
      pushOptions({
        dateAlignment: 'week',
      })

      describe('when dateIncrement not specified', () => {
        it('moves forward one week', () => {
          initCalendar()
          currentCalendar.next()
          expectActiveRange('2017-06-11', '2017-06-14')
        })
      })

      describe('when two day dateIncrement is specified', () => {
        pushOptions({
          dateIncrement: { days: 2 },
        })

        it('does not navigate nor rerender', () => {
          let called

          initCalendar({
            dayCellDidMount() {
              called = true
            },
          })

          called = false
          currentCalendar.next()

          expectActiveRange('2017-06-04', '2017-06-07') // the same as how it started
          expect(called).toBe(false)
        })
      })
    })
  })

  describe('when in a custom two day view and weekends:false', () => {
    pushOptions({
      weekends: false,
      initialView: 'timeGrid',
      duration: { days: 2 },
    })

    it('skips over weekends if there would be alignment with weekend', () => {
      initCalendar({
        initialDate: '2017-11-09',
      })
      currentCalendar.next()
    })
  })
})
