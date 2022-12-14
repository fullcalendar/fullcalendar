import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'

describe('timegrid all-day slot', () => {
  pushOptions({
    initialDate: '2019-04-23',
    initialView: 'timeGridWeek',
    editable: true,
  })

  // https://github.com/fullcalendar/fullcalendar/issues/4616
  it('allows dragging after dynamic event adding', (done) => {
    let calendar = initCalendar({
      eventDrop(arg) {
        expect(arg.event.start).toEqualDate('2019-04-24')
        done()
      },
    })

    calendar.batchRendering(() => {
      calendar.addEvent({ start: '2019-04-23' })
      calendar.addEvent({ start: '2019-04-23' })
      calendar.addEvent({ start: '2019-04-23' })
    })

    let dayGridWrapper = new TimeGridViewWrapper(calendar).dayGrid
    let dayWidth = $(dayGridWrapper.getDayEls('2019-04-23')).width()
    let lastEventEl = dayGridWrapper.getEventEls()[2]

    $(lastEventEl).simulate('drag', {
      localPoint: { left: '50%', top: '99%' },
      dx: dayWidth,
    })
  })
})
