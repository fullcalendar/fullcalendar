
describe('eventDataTransform', function() {
  var transform = function(raw) {
    return $.extend({}, raw, {
      was_processed: true
    })
  }

  describeOptions({
    'when on the calendar': {
      events: [
        { start: '2017-10-23' }
      ],
      eventDataTransform: transform
    },
    'when on an event source': {
      eventSources: [ {
        events: [
          { start: '2017-10-23' }
        ],
        eventDataTransform: transform
      } ]
    }
  }, function() {
    it('affects parsing of the event', function() {
      initCalendar()
      var eventObj = currentCalendar.getEvents()[0]
      expect(eventObj.extendedProps.was_processed).toBe(true)
    })
  })

})
