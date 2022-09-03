import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'

describe('eventOrder', () => {
  pushOptions({
    initialDate: '2018-01-01',
    initialView: 'dayGridMonth',
    eventDidMount(arg) {
      arg.el.setAttribute('data-event-id', arg.event.id)
    },
  })

  describe('when all different start times', () => {
    pushOptions({
      events: [
        { id: 'z', title: 'a', start: '2018-01-01T10:00:00' },
        { id: 'y', title: 'b', start: '2018-01-01T09:00:00' },
        { id: 'x', title: 'c', start: '2018-01-01T08:00:00' },
      ],
    })

    it('will sort by start time by default', () => {
      initCalendar()
      expect(getEventOrder()).toEqual(['x', 'y', 'z'])
    })
  })

  describe('when all the same date', () => {
    pushOptions({
      events: [
        { id: 'z', title: 'a', start: '2018-01-01T09:00:00', myOrder: 3 },
        { id: 'y', title: 'b', start: '2018-01-01T09:00:00', myOrder: 1 },
        { id: 'x', title: 'c', start: '2018-01-01T09:00:00', myOrder: 2 },
      ],
    })

    it('sorts by title by default', () => {
      initCalendar()
      expect(getEventOrder()).toEqual(['z', 'y', 'x'])
    })

    it('can sort by a standard prop', () => {
      initCalendar({
        eventOrder: 'id',
      })
      expect(getEventOrder()).toEqual(['x', 'y', 'z'])
    })

    it('can sort by a non-standard prop', () => {
      initCalendar({
        eventOrder: 'myOrder',
      })
      expect(getEventOrder()).toEqual(['y', 'x', 'z'])
    })
  })

  describe('when different dates', () => {
    pushOptions({
      events: [
        { id: 'z', title: 'a', start: '2018-01-03T09:00:00', end: '2018-01-06T09:00:00', myOrder: 3 },
        { id: 'y', title: 'b', start: '2018-01-02T09:00:00', end: '2018-01-06T09:00:00', myOrder: 1 },
        { id: 'x', title: 'c', start: '2018-01-01T09:00:00', end: '2018-01-06T09:00:00', myOrder: 2 },
      ],
    })

    it('sorting by a prop will override date-determined order', () => {
      initCalendar({
        eventOrder: 'myOrder',
      })
      expect(getEventOrder()).toEqual(['y', 'x', 'z'])
    })
  })

  describe('when different durations', () => {
    pushOptions({
      events: [
        { id: 'z', title: 'a', start: '2018-01-01T09:00:00', end: '2018-01-04T09:00:00', myOrder: 3 }, // 3 day
        { id: 'y', title: 'b', start: '2018-01-01T09:00:00', end: '2018-01-02T09:00:00', myOrder: 1 }, // 1 day
        { id: 'x', title: 'c', start: '2018-01-01T09:00:00', end: '2018-01-03T09:00:00', myOrder: 2 }, // 2 day
      ],
    })

    it('sorting by a prop will override duration-determined order', () => {
      initCalendar({
        eventOrder: 'myOrder',
      })
      expect(getEventOrder()).toEqual(['y', 'x', 'z'])
    })
  })

  describe('when long event split across weeks', () => {
    pushOptions({
      events: [
        { id: 'x', start: '2018-01-06', end: '2018-01-08' },
        { id: 'y', start: '2018-01-06', end: '2018-01-07' },
        { id: 'z', start: '2018-01-07', end: '2018-01-08' },
      ],
    })

    it('should prioritize eventOrder duration', () => {
      let calendar = initCalendar({
        eventOrder: '-duration',
      })
      let dayGrid = new DayGridViewWrapper(calendar).dayGrid
      let rowEls = dayGrid.getRowEls()
      let xEvent0 = rowEls[0].querySelector('[data-event-id="x"]')
      let xEvent1 = rowEls[1].querySelector('[data-event-id="x"]')
      let yEvent = rowEls[0].querySelector('[data-event-id="y"]')
      let zEvent = rowEls[1].querySelector('[data-event-id="z"]')

      expect(xEvent0.getBoundingClientRect().top)
        .toBeLessThan(yEvent.getBoundingClientRect().top)
      expect(xEvent1.getBoundingClientRect().top)
        .toBeLessThan(zEvent.getBoundingClientRect().top)
    })
  })

  function getEventOrder() {
    let objs = new CalendarWrapper(currentCalendar).getEventEls().map((el) => ({
      id: el.getAttribute('data-event-id'),
      top: el.getBoundingClientRect().top,
    }))
    objs.sort((a, b) => a.top - b.top)
    return objs.map((obj) => obj.id)
  }
})
