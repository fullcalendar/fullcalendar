import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'

describe('weekNumbers', function() {

  describe('when using month view', function() {
    pushOptions({
      initialView: 'dayGridMonth',
      fixedWeekCount: true // will make 6 rows
    })

    describe('with default weekNumbers', function() { // which is false!
      it('should not display week numbers at all', function() {
        let calendar = initCalendar()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        expect(dayGridWrapper.getWeekNumberEls().length).toEqual(0)
      })
    })

    describe('with weekNumbers to false', function() {
      pushOptions({
        weekNumbers: false
      })

      it('should not display week numbers at all', function() {
        let calendar = initCalendar()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        expect(dayGridWrapper.getWeekNumberEls().length).toEqual(0)
      })
    })

    describe('with weekNumbers to true', function() {
      pushOptions({
        weekNumbers: true
      })

      it('should display week numbers in the day cells only', function() {
        let calendar = initCalendar()
        let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
        expect(dayGridWrapper.getWeekNumberEls().length).toBeGreaterThan(0)
      })
    })

  })

  describe('when using an timeGrid view', function() {
    pushOptions({
      initialView: 'timeGridWeek'
    })

    describe('with default weekNumbers', function() {
      it('should not display week numbers at all', function() {
        let calendar = initCalendar()
        let viewWrapper = new TimeGridViewWrapper(calendar)
        expect(viewWrapper.getHeaderWeekNumberLink()).toBeFalsy()
      })
    })

    describe('with weekNumbers to false', function() {
      pushOptions({
        weekNumbers: false
      })

      it('should not display week numbers at all', function() {
        let calendar = initCalendar()
        let viewWrapper = new TimeGridViewWrapper(calendar)
        expect(viewWrapper.getHeaderWeekNumberLink()).toBeFalsy()
      })
    })

    describe('with weekNumbers to true', function() {
      pushOptions({
        weekNumbers: true
      })

      it('should display week numbers in the top left corner only', function() {
        let calendar = initCalendar()
        let viewWrapper = new TimeGridViewWrapper(calendar)
        expect(viewWrapper.getHeaderWeekNumberLink()).toBeTruthy()
      })
    })

  })

  describe('when using in dayGrid view', function() {
    pushOptions({
      initialView: 'dayGridWeek'
    })

    // https://github.com/fullcalendar/fullcalendar/issues/5708
    it('displays events evenly', function() {
      let calendar = initCalendar({
        weekNumbers: true,
        initialDate: '2020-08-07',
        events: [
          { title: 'Event 1', start: '2020-08-02' },
          { title: 'Event 2', start: '2020-08-03' }
        ]
      })
      let gridWrapper = new DayGridViewWrapper(calendar).dayGrid
      let eventEls = gridWrapper.getEventEls()

      expect(
        Math.abs(
          eventEls[0].getBoundingClientRect().top -
          eventEls[1].getBoundingClientRect().top
        )
      ).toBeLessThan(1)
    })
  })

})
