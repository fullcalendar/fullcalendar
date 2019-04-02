import { Draggable } from '@fullcalendar/interaction'
import { getDayEl } from '../view-render/DayGridRenderUtils'

describe('external event dragging', function() {
  var $dragEl
  var thirdPartyDraggable

  beforeEach(function() {
    $dragEl = $('<div class="drag">yo</div>')
      .css({
        width: 200,
        background: 'blue',
        color: 'white'
      })
      .appendTo('body')
  })

  afterEach(function() {
    if (thirdPartyDraggable) {
      thirdPartyDraggable.destroy()
    }
    $dragEl.remove()
    $dragEl = null
  })


  describe('with forceEventDuration', function() {
    pushOptions({
      forceEventDuration: true,
      defaultEventDuration: '1:30'
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4597
    it('should yield an event with an end', function(done) {
      initCalendar({
        defaultView: 'dayGridMonth',
        defaultDate: '2019-04-01',
        droppable: true,
        defaultAllDayEventDuration: { days: 2 },
        eventReceive(arg) {
          expect(arg.event.end).toEqualDate('2019-04-04')
          done()
        }
      })

      thirdPartyDraggable = new Draggable($dragEl[0], {
        eventData: {}
      })

      $dragEl.simulate('drag', {
        end: getDayEl('2019-04-02')
      })
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4575
  it('provides eventAllow with a valid event with null start/end', function(done) {
    let called = false

    initCalendar({
      defaultView: 'dayGridMonth',
      defaultDate: '2019-04-01',
      droppable: true,
      defaultAllDayEventDuration: { days: 2 },
      eventAllow(dropInfo, draggedEvent) {
        expect(draggedEvent.id).toBe('a')
        expect(draggedEvent.title).toBe('hey')
        expect(draggedEvent.start).toBe(null)
        expect(draggedEvent.end).toBe(null)
        called = true
      }
    })

    thirdPartyDraggable = new Draggable($dragEl[0], {
      eventData: {
        id: 'a',
        title: 'hey'
      }
    })

    $dragEl.simulate('drag', {
      end: getDayEl('2019-04-02'),
      callback() {
        expect(called).toBe(true)
        done()
      }
    })
  })

})
