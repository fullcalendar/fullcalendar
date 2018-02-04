describe('removeEventSources', function() {

  pushOptions({
    defaultDate: '2014-08-01',
    defaultView: 'agendaDay',
    eventSources: [
      buildEventSource(1),
      buildEventSource(2),
      buildEventSource(3)
    ]
  })

  describe('when called with no arguments', function() {
    it('removes all sources', function() {

      initCalendar()
      expect($('.fc-event').length).toBe(3)

      currentCalendar.removeEventSources()
      expect($('.fc-event').length).toBe(0)
    })
  })

  describe('when called with specific IDs', function() {
    it('removes only events with matching sources', function() {

      initCalendar()
      expect($('.fc-event').length).toBe(3)

      currentCalendar.removeEventSources([ 1, 3 ])
      expect($('.fc-event').length).toBe(1)
      expect($('.event2').length).toBe(1)
    })
  })

  function buildEventSource(id) {
    return {
      id: id,
      events: function(start, end, timezone, callback) {
        callback([ {
          title: 'event' + id,
          className: 'event' + id,
          start: '2014-08-01T02:00:00'
        } ])
      }
    }
  }
})
