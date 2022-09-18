import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('print preview', () => {
  pushOptions({
    initialDate: '2019-04-08',
    scrollTime: '00:00',
    events: [
      { id: '2', start: '2019-04-08T05:00:00' },
      { id: '1', start: '2019-04-08T01:00:00' },
    ],
    eventDidMount(arg) {
      arg.el.setAttribute('data-id', arg.event.id)
    },
  })

  describeOptions('initialView', {
    'with timeGrid view': 'timeGridDay',
    'with dayGrid view': 'dayGridDay',
  }, () => {
    it('orders events in DOM by start time', () => {
      let calendar = initCalendar()
      let calendarWrapper = new CalendarWrapper(calendar)
      let eventEls = calendarWrapper.getEventEls()

      let ids = eventEls.map((el) => el.getAttribute('data-id'))

      expect(ids).toEqual(['1', '2'])
    })
  })

  describeOptions('initialView', {
    'with timeGrid view': 'timeGridWeek',
    'with dayGrid view': 'dayGridDay',
  }, () => {
    // https://github.com/fullcalendar/fullcalendar/issues/5709
    it('orders by start time when in actually printing', (done) => {
      let calendar = initCalendar()
      calendar.trigger('_beforeprint')

      setTimeout(() => {
        let calendarWrapper = new CalendarWrapper(calendar)
        let eventEls = calendarWrapper.getEventEls()

        let ids = eventEls.map((el) => el.getAttribute('data-id'))

        expect(ids).toEqual(['1', '2'])
        done()
      })
    })
  })
})
