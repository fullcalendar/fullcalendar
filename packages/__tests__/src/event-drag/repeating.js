import TimeGridViewWrapper from '../lib/wrappers/TimeGridViewWrapper'
import CalendarWrapper from '../lib/wrappers/CalendarWrapper'
import { waitEventDrag } from '../lib/wrappers/interaction-util'
import { filterVisibleEls } from '../lib/dom-misc'

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

    let calendar = initCalendar()

    // event range needs out large (month) then scope down (week)
    // so that the new view receives out-of-range events.
    currentCalendar.changeView('timeGridWeek')

    let eventEl = new CalendarWrapper(calendar).getFirstEventEl()
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    let dragging = timeGridWrapper.dragEventToDate(eventEl, '2017-02-16T12:00:00')

    waitEventDrag(calendar, dragging).then((res) => {
      expect(typeof res).toBe('object')
      done()
    })
  })

  it('hides other repeating events when dragging', function(done) {

    let calendar = initCalendar({

      eventDragStart() {
        setTimeout(function() { // try go execute DURING the drag
          let visibleEventEls = filterVisibleEls(calendarWrapper.getEventEls())
          expect(visibleEventEls.length).toBe(1)
        }, 0)
      },

      eventDrop() {
        setTimeout(function() {
          done()
        }, 10)
      }
    })
    let calendarWrapper = new CalendarWrapper(calendar)

    $(calendarWrapper.getFirstEventEl()).simulate('drag', {
      dx: 100,
      duration: 100 // ample time for separate eventDragStart/eventDrop
    })
  })

  // inverse of above test
  it('doesnt accidentally hide all non-id events when dragging', function(done) {

    let calendar = initCalendar({
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

      eventDragStart() {
        setTimeout(function() { // try go execute DURING the drag
          let visibleEventEls = filterVisibleEls(calendarWrapper.getEventEls())
          expect(visibleEventEls.length).toBe(2) // the dragging event AND the other regular event
        }, 0)
      },

      eventDrop() {
        setTimeout(function() {
          done()
        }, 10)
      }
    })
    let calendarWrapper = new CalendarWrapper(calendar)

    $(calendarWrapper.getFirstEventEl()).simulate('drag', {
      dx: 100,
      duration: 100 // ample time for separate eventDragStart/eventDrop
    })
  })

})
