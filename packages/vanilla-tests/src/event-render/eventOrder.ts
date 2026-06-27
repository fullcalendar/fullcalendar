import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { waitTimeout } from '../lib/misc'

describe('eventOrder', () => {
  pushOptions({
    initialDate: '2018-01-01',
    initialView: 'dayGridMonth',
    eventDidMount(info) {
      info.el.setAttribute('data-event-id', info.event.id)
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

    it('will sort by start time by default', async () => {
      let calendar = initCalendar()
      await waitTimeout()
      expect(getEventOrder(calendar)).toEqual(['x', 'y', 'z'])
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

    it('sorts by title by default', async () => {
      let calendar = initCalendar()
      await waitTimeout()
      expect(getEventOrder(calendar)).toEqual(['z', 'y', 'x'])
    })

    it('can sort by a standard prop', async () => {
      let calendar = initCalendar({
        eventOrder: 'id',
      })
      await waitTimeout()
      expect(getEventOrder(calendar)).toEqual(['x', 'y', 'z'])
    })

    it('can sort by a non-standard prop', async () => {
      let calendar = initCalendar({
        eventOrder: 'myOrder',
      })
      await waitTimeout()
      expect(getEventOrder(calendar)).toEqual(['y', 'x', 'z'])
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

    it('sorting by a prop will override date-determined order', async () => {
      let calendar = initCalendar({
        eventOrder: 'myOrder',
      })
      await waitTimeout()
      expect(getEventOrder(calendar)).toEqual(['y', 'x', 'z'])
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

    it('sorting by a prop will override duration-determined order', async () => {
      let calendar = initCalendar({
        eventOrder: 'myOrder',
      })
      await waitTimeout()
      expect(getEventOrder(calendar)).toEqual(['y', 'x', 'z'])
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

    it('should prioritize eventOrder duration', async () => {
      let calendar = initCalendar({
        eventOrder: '-duration',
      })
      await waitTimeout()
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

  function getEventOrder(calendar) {
    let objs = new CalendarWrapper(calendar).getEventEls().map((el) => ({
      id: el.getAttribute('data-event-id'),
      top: el.getBoundingClientRect().top,
    }))
    objs.sort((a, b) => a.top - b.top)
    return objs.map((obj) => obj.id)
  }
})
