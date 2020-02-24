import CalendarWrapper from "../lib/wrappers/CalendarWrapper"

describe('print preview', function() {
  pushOptions({
    defaultDate: '2019-04-08',
    scrollTime: '00:00',
    events: [
      { id: '2', start: '2019-04-08T05:00:00' },
      { id: '1', start: '2019-04-08T01:00:00' }
    ],
    eventRender: function(arg) {
      arg.el.setAttribute('data-id', arg.event.id)
    }
  })

  describeOptions('defaultView', {
    'with timeGrid view': 'timeGridDay',
    'with dayGrid view': 'dayGridDay'
  }, function() {

    it('orders events in DOM by start time', function() {
      let calendar = initCalendar()
      let calendarWrapper = new CalendarWrapper(calendar)
      let eventEls = calendarWrapper.getEventEls()

      let ids = eventEls.map(function(el) {
        return el.getAttribute('data-id')
      })

      expect(ids).toEqual([ '1', '2' ])
    })
  })

})
