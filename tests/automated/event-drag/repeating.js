import * as TimeGridEventDragUtils from './TimeGridEventDragUtils'
import { getVisibleEventEls, getFirstEventEl } from '../event-render/EventRenderUtils'

describe('event dragging on repeating events', function() {
  pushOptions({
    defaultView: 'dayGridMonth',
    defaultDate: '2017-02-12',
    editable: true,
    events: [
      {
        groupId: 999,
        title: 'Repeating Event',
        start: '2017-02-09T16:00:00'
      },
      {
        groupId: 999,
        title: 'Repeating Event',
        start: '2017-02-16T16:00:00'
      }
    ]
  })

  // bug where offscreen instance of a repeating event was being incorrectly dragged
  it('drags correct instance of event', function(done) {

    initCalendar()

    // event range needs out large (month) then scope down (week)
    // so that the new view receives out-of-range events.
    currentCalendar.changeView('timeGridWeek')

    TimeGridEventDragUtils.drag('2017-02-16T16:00:00', '2017-02-16T12:00:00')
      .then(function(res) {
        expect(typeof res).toBe('object')
      })
      .then(done)
  })

  it('hides other repeating events when dragging', function(done) {

    initCalendar({
      eventDragStart: function() {
        setTimeout(function() { // try go execute DURING the drag
          expect(
            getVisibleEventEls().filter(function(i, node) {
              return $(node).css('visibility') !== 'hidden'
            }).length
          ).toBe(1)
        }, 0)
      },
      eventDrop: function() {
        setTimeout(function() {
          done()
        }, 10)
      }
    })

    getFirstEventEl().simulate('drag', {
      dx: 100,
      duration: 100 // ample time for separate eventDragStart/eventDrop
    })
  })

  // inverse of above test
  it('doesnt accidentally hide all non-id events when dragging', function(done) {

    initCalendar({
      events: [
        {
          title: 'Regular Event',
          start: '2017-02-09T16:00:00'
        },
        {
          title: 'Other Regular Event',
          start: '2017-02-16T16:00:00'
        }
      ],
      eventDragStart: function() {
        setTimeout(function() { // try go execute DURING the drag
          expect(
            getVisibleEventEls().filter(function(i, node) {
              return $(node).css('visibility') !== 'hidden'
            }).length
          ).toBe(2) // the dragging event AND the other regular event
        }, 0)
      },
      eventDrop: function() {
        setTimeout(function() {
          done()
        }, 10)
      }
    })

    getFirstEventEl().simulate('drag', {
      dx: 100,
      duration: 100 // ample time for separate eventDragStart/eventDrop
    })
  })

})
