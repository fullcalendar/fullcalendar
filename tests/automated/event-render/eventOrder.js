import { getEventEls } from './EventRenderUtils'

describe('eventOrder', function() {
  pushOptions({
    defaultDate: '2018-01-01',
    defaultView: 'dayGridMonth',
    eventRender: function(arg) {
      arg.el.setAttribute('data-event-id', arg.event.id)
    }
  })

  describe('when all different start times', function() {
    pushOptions({
      events: [
        { id: 'z', title: 'a', start: '2018-01-01T10:00:00' },
        { id: 'y', title: 'b', start: '2018-01-01T09:00:00' },
        { id: 'x', title: 'c', start: '2018-01-01T08:00:00' }
      ]
    })

    it('will sort by start time by default', function() {
      initCalendar()
      expect(getEventOrder()).toEqual([ 'x', 'y', 'z' ])
    })
  })

  describe('when all the same date', function() {
    pushOptions({
      events: [
        { id: 'z', title: 'a', start: '2018-01-01T09:00:00', myOrder: 3 },
        { id: 'y', title: 'b', start: '2018-01-01T09:00:00', myOrder: 1 },
        { id: 'x', title: 'c', start: '2018-01-01T09:00:00', myOrder: 2 }
      ]
    })

    it('sorts by title by default', function() {
      initCalendar()
      expect(getEventOrder()).toEqual([ 'z', 'y', 'x' ])
    })

    it('can sort by a standard prop', function() {
      initCalendar({
        eventOrder: 'id'
      })
      expect(getEventOrder()).toEqual([ 'x', 'y', 'z' ])
    })

    it('can sort by a non-standard prop', function() {
      initCalendar({
        eventOrder: 'myOrder'
      })
      expect(getEventOrder()).toEqual([ 'y', 'x', 'z' ])
    })
  })

  describe('when different dates', function() {
    pushOptions({
      events: [
        { id: 'z', title: 'a', start: '2018-01-03T09:00:00', end: '2018-01-06T09:00:00', myOrder: 3 },
        { id: 'y', title: 'b', start: '2018-01-02T09:00:00', end: '2018-01-06T09:00:00', myOrder: 1 },
        { id: 'x', title: 'c', start: '2018-01-01T09:00:00', end: '2018-01-06T09:00:00', myOrder: 2 }
      ]
    })

    it('sorting by a prop will override date-determined order', function() {
      initCalendar({
        eventOrder: 'myOrder'
      })
      expect(getEventOrder()).toEqual([ 'y', 'x', 'z' ])
    })
  })

  describe('when different durations', function() {
    pushOptions({
      events: [
        { id: 'z', title: 'a', start: '2018-01-01T09:00:00', end: '2018-01-04T09:00:00', myOrder: 3 }, // 3 day
        { id: 'y', title: 'b', start: '2018-01-01T09:00:00', end: '2018-01-02T09:00:00', myOrder: 1 }, // 1 day
        { id: 'x', title: 'c', start: '2018-01-01T09:00:00', end: '2018-01-03T09:00:00', myOrder: 2 } // 2 day
      ]
    })

    it('sorting by a prop will override duration-determined order', function() {
      initCalendar({
        eventOrder: 'myOrder'
      })
      expect(getEventOrder()).toEqual([ 'y', 'x', 'z' ])
    })
  })

  function getEventOrder() {
    return getEventEls().map(function(i, node) {
      return $(node).data('event-id')
    }).get()
  }
})
