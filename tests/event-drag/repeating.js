import * as TimeGridEventDragUtils from './TimeGridEventDragUtils'

describe('event dragging on repeating events', function() {
  pushOptions({
    defaultView: 'month',
    defaultDate: '2017-02-12',
    editable: true,
    events: [
      {
        id: 999,
        title: 'Repeating Event',
        start: '2017-02-09T16:00:00'
      },
      {
        id: 999,
        title: 'Repeating Event',
        start: '2017-02-16T16:00:00'
      }
    ]
  })

  // bug where offscreen instance of a repeating event was being incorrectly dragged
  pit('drags correct instance of event', function() {

    initCalendar()

    // event range needs out large (month) then scope down (agendaWeek)
    // so that the new view receives out-of-range events.
    currentCalendar.changeView('agendaWeek')

    return TimeGridEventDragUtils.drag('2017-02-16T16:00:00', '2017-02-16T12:00:00')
      .then(function(res) {
        expect(res.isSuccess).toBe(true)
      })
  })

  it('hides other repeating events when dragging', function(done) {

    initCalendar({
      eventDragStart: function() {
        setTimeout(function() { // try go execute DURING the drag
          expect(
            $('.fc-event:visible').filter(function(i, node) {
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

    $('.fc-event:first').simulate('drag', {
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
            $('.fc-event:visible').filter(function(i, node) {
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

    $('.fc-event:first').simulate('drag', {
      dx: 100,
      duration: 100 // ample time for separate eventDragStart/eventDrop
    })
  })

})
