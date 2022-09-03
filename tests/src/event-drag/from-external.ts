import { Draggable } from '@fullcalendar/interaction'
import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'

describe('external event dragging', () => {
  let $dragEl
  let thirdPartyDraggable

  beforeEach(() => {
    $dragEl = $('<div class="drag">yo</div>')
      .css({
        width: 200,
        background: 'blue',
        color: 'white',
      })
      .appendTo('body')
  })

  afterEach(() => {
    if (thirdPartyDraggable) {
      thirdPartyDraggable.destroy()
    }
    $dragEl.remove()
    $dragEl = null
  })

  describe('with forceEventDuration', () => {
    pushOptions({
      forceEventDuration: true,
      defaultTimedEventDuration: '1:30',
    })

    // https://github.com/fullcalendar/fullcalendar/issues/4597
    it('should yield an event with an end', (done) => {
      let calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2019-04-01',
        droppable: true,
        defaultAllDayEventDuration: { days: 2 },
        eventReceive(arg) {
          expect(arg.event.end).toEqualDate('2019-04-04')
          done()
        },
      })
      let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

      thirdPartyDraggable = new Draggable($dragEl[0], {
        eventData: {},
      })

      $dragEl.simulate('drag', {
        end: dayGridWrapper.getDayEl('2019-04-02'),
      })
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4575
  it('provides eventAllow with a valid event with null start/end', (done) => {
    let called = false
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2019-04-01',
      droppable: true,
      defaultAllDayEventDuration: { days: 2 },
      eventAllow(dropInfo, draggedEvent) {
        expect(draggedEvent.id).toBe('a')
        expect(draggedEvent.title).toBe('hey')
        expect(draggedEvent.start).toBe(null)
        expect(draggedEvent.end).toBe(null)
        called = true
        return true
      },
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid

    thirdPartyDraggable = new Draggable($dragEl[0], {
      eventData: {
        id: 'a',
        title: 'hey',
      },
    })

    $dragEl.simulate('drag', {
      end: dayGridWrapper.getDayEl('2019-04-02'),
      callback() {
        expect(called).toBe(true)
        done()
      },
    })
  })
})
