import { getEventEls } from '../event-render/EventRenderUtils'
import { getDayEl } from './DayGridRenderUtils'

describe('timegrid all-day slot', function() {
  pushOptions({
    defaultDate: '2019-04-23',
    defaultView: 'timeGridWeek',
    editable: true
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4616
  it('allows dragging after dynamic event adding', function(done) {
    initCalendar({
      eventDrop(arg) {
        expect(arg.event.start).toEqualDate('2019-04-24')
        done()
      }
    })

    currentCalendar.batchRendering(function() {
      currentCalendar.addEvent({ start: '2019-04-23' })
      currentCalendar.addEvent({ start: '2019-04-23' })
      currentCalendar.addEvent({ start: '2019-04-23' })
    })

    let dayWidth = getDayEl('2019-04-23').width()

    let lastEventEl = getEventEls()[2]
    $(lastEventEl).simulate('drag', {
      localPoint: { left: '50%', top: '99%' },
      dx: dayWidth
    })
  })
})
