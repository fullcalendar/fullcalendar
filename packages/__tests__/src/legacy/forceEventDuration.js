describe('forceEventDuration', function() {

  pushOptions({
    defaultDate: '2014-05-01',
    defaultView: 'dayGridMonth'
  })

  describe('when turned off', function() {
    pushOptions({
      forceEventDuration: false
    })
    it('allows a null end date for all-day and timed events', function() {
      initCalendar({
        events: [
          {
            id: '1',
            start: '2014-05-10'
          },
          {
            id: '2',
            start: '2014-05-10T14:00:00'
          }
        ]
      })
      var events = currentCalendar.getEvents()
      expect(events[0].end).toBeNull()
      expect(events[1].end).toBeNull()
    })
  })

  describe('when turned on', function() {
    pushOptions({
      forceEventDuration: true
    })
    it('allows a null end date for all-day and timed events', function() {
      initCalendar({
        events: [
          {
            id: '1',
            start: '2014-05-10'
          },
          {
            id: '2',
            start: '2014-05-10T14:00:00'
          }
        ]
      })
      var events = currentCalendar.getEvents()
      expect(events[0].id).toEqual('1')
      expect(events[0].end instanceof Date).toEqual(true)
      expect(events[1].id).toEqual('2')
      expect(events[1].end instanceof Date).toEqual(true)
    })
  })

  // NOTE: the actual verification of the correct calculation of the end
  // (using defaultTimedEventDuration and defaultAllDayEventDuration)
  // is done in those test files.

})
