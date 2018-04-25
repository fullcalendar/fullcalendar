describe('updateEvent', function() {

  pushOptions({
    defaultDate: '2014-05-01',
    defaultView: 'month'
  })

  function getMainEvent() {
    return currentCalendar.clientEvents(function(event) {
      return event.className[0] === 'mainEvent'
    })[0]
  }

  function getRelatedEvent() {
    return currentCalendar.clientEvents(function(event) {
      return event.className[0] === 'relatedEvent'
    })[0]
  }

  describe('when moving an all-day event\'s start', function() {
    describe('when a related event doesn\'t have an end', function() {
      it('should move the start by the delta and leave the end as null', function() {
        var event, relatedEvent

        initCalendar({
          events: [
            { id: '1', start: '2014-05-01', allDay: true, className: 'mainEvent' },
            { id: '1', start: '2014-05-10', allDay: true, className: 'relatedEvent' }
          ]
        })

        event = getMainEvent()
        event.start.add(2, 'days')
        currentCalendar.updateEvent(event)

        event = getMainEvent()
        expect(event.start).toEqualMoment('2014-05-03')
        expect(event.end).toBeNull()

        relatedEvent = getRelatedEvent()
        expect(relatedEvent.start).toEqualMoment('2014-05-12')
        expect(relatedEvent.end).toBeNull()
      })
    })
    describe('when a related event has an end', function() {
      it('should move the start and end by the delta', function() {
        var event, relatedEvent

        initCalendar({
          events: [
            { id: '1', start: '2014-05-01', allDay: true, className: 'mainEvent' },
            { id: '1', start: '2014-05-10', end: '2014-05-12', allDay: true, className: 'relatedEvent' }
          ]
        })

        event = getMainEvent()
        event.start.add(2, 'days')
        expect(event.start).toEqualMoment('2014-05-03')
        expect(event.end).toBeNull()
        currentCalendar.updateEvent(event)

        relatedEvent = getRelatedEvent()
        expect(relatedEvent.start).toEqualMoment('2014-05-12')
        expect(relatedEvent.end).toEqualMoment('2014-05-14')
      })
    })
  })

  describe('when moving an timed event\'s start', function() {
    describe('when a related event doesn\'t have an end', function() {
      it('should move the start by the delta and leave the end as null', function() {
        var event, relatedEvent

        initCalendar({
          events: [
            { id: '1', start: '2014-05-01T12:00:00', allDay: false, className: 'mainEvent' },
            { id: '1', start: '2014-05-10T06:00:00', allDay: false, className: 'relatedEvent' }
          ]
        })

        event = getMainEvent()
        event.start.add({ days: 2, hours: 2 })
        currentCalendar.updateEvent(event)
        expect(event.start).toEqualMoment('2014-05-03T14:00:00')
        expect(event.end).toBeNull()

        relatedEvent = getRelatedEvent()
        expect(relatedEvent.start).toEqualMoment('2014-05-12T08:00:00')
        expect(relatedEvent.end).toBeNull()
      })
    })
    describe('when a related event has an end', function() {
      it('should move the start and end by the delta', function() {
        var event, relatedEvent

        initCalendar({
          events: [
            { id: '1', start: '2014-05-01T12:00:00', allDay: false, className: 'mainEvent' },
            { id: '1', start: '2014-05-10T06:00:00', end: '2014-05-12T08:00:00', allDay: false, className: 'relatedEvent' }
          ]
        })

        event = getMainEvent()
        event.start.add({ days: 2, hours: 2 })
        currentCalendar.updateEvent(event)

        event = getMainEvent()
        expect(event.start).toEqualMoment('2014-05-03T14:00:00')
        expect(event.end).toBeNull()

        relatedEvent = getRelatedEvent()
        expect(relatedEvent.start).toEqualMoment('2014-05-12T08:00:00')
        expect(relatedEvent.end).toEqualMoment('2014-05-14T10:00:00')
      })
    })
  })

  describe('when moving an all-day event\'s end', function() {
    describe('when a related event doesn\'t have an end', function() {
      it('should give the end a default duration plus the delta', function() {
        var event, relatedEvent

        initCalendar({
          defaultAllDayEventDuration: { days: 2 },
          events: [
            { id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true, className: 'mainEvent' },
            { id: '1', start: '2014-05-10', allDay: true, className: 'relatedEvent' }
          ]
        })

        event = getMainEvent()
        event.end.add(1, 'days')
        currentCalendar.updateEvent(event)

        event = getMainEvent()
        expect(event.start).toEqualMoment('2014-05-01')
        expect(event.end).toEqualMoment('2014-05-04')

        relatedEvent = getRelatedEvent()
        expect(relatedEvent.start).toEqualMoment('2014-05-10')
        expect(relatedEvent.end).toEqualMoment('2014-05-13')
      })
    })
    describe('when a related event has an end', function() {
      it('should move the end by the delta', function() {
        var event, relatedEvent

        initCalendar({
          events: [
            { id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true, className: 'mainEvent' },
            { id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true, className: 'relatedEvent' }
          ]
        })

        event = getMainEvent()
        event.end.add(1, 'days')
        currentCalendar.updateEvent(event)

        event = getMainEvent()
        expect(event.start).toEqualMoment('2014-05-01')
        expect(event.end).toEqualMoment('2014-05-04')

        relatedEvent = getRelatedEvent()
        expect(relatedEvent.start).toEqualMoment('2014-05-10')
        expect(relatedEvent.end).toEqualMoment('2014-05-14')
      })
    })
  })

  describe('when moving a timed event\'s end', function() {
    describe('when a related event doesn\'t have an end', function() {
      describe('when forceEventDuration is off', function() {
        it('should give the end a default duration plus the delta', function() {
          var event, relatedEvent

          initCalendar({
            forceEventDuration: false,
            defaultTimedEventDuration: { hours: 2 },
            events: [
              { id: '1', start: '2014-05-01T12:00:00', end: '2014-05-01T15:00:00', allDay: false, className: 'mainEvent' },
              { id: '1', start: '2014-05-10T16:00:00', allDay: false, className: 'relatedEvent' }
            ]
          })

          event = getMainEvent()
          event.end.add({ days: 1, hours: 1 })
          currentCalendar.updateEvent(event)

          event = getMainEvent()
          expect(event.start).toEqualMoment('2014-05-01T12:00:00')
          expect(event.end).toEqualMoment('2014-05-02T16:00:00')

          relatedEvent = getRelatedEvent()
          expect(relatedEvent.start).toEqualMoment('2014-05-10T16:00:00')
          expect(relatedEvent.end).toEqualMoment('2014-05-11T19:00:00')
        })
      })
      describe('when forceEventDuration is on', function() {
        it('should reset end based on defaultTimedEventDuration', function() {
          var event, relatedEvent

          initCalendar({
            forceEventDuration: true,
            defaultTimedEventDuration: { hours: 2 },
            events: [
              { id: '1', start: '2014-05-01T12:00:00', end: '2014-05-01T15:00:00', allDay: false, className: 'mainEvent' },
              { id: '1', start: '2014-05-10T16:00:00', end: '2014-05-10T19:00:00', allDay: false, className: 'relatedEvent' }
            ]
          })

          event = getMainEvent()
          event.start.add({ days: 1, hours: -12 })
          event.end = null
          currentCalendar.updateEvent(event)

          event = getMainEvent()
          expect(event.start).toEqualMoment('2014-05-02T00:00:00')
          expect(event.end).toEqualMoment('2014-05-02T02:00:00')

          relatedEvent = getRelatedEvent()
          expect(relatedEvent.start).toEqualMoment('2014-05-11T04:00:00')
          expect(relatedEvent.end).toEqualMoment('2014-05-11T06:00:00')
        })
      })
      describe('when forceEventDuration is turned on late', function() {
        it('should force a duration when updateEvent called', function() {
          var event

          initCalendar({
            defaultTimedEventDuration: { hours: 1 },
            events: [
              { id: '1', start: '2014-05-01T12:00:00', allDay: false, className: 'mainEvent' }
            ]
          })

          event = getMainEvent()
          expect(event.start).toEqualMoment('2014-05-01T12:00:00')
          expect(event.end).toBeNull()

          currentCalendar.option({
            forceEventDuration: true
          })

          // should stay the same
          event = getMainEvent()
          expect(event.start).toEqualMoment('2014-05-01T12:00:00')
          expect(event.end).toBeNull()

          event.start.add({ days: 1, hours: -12 })
          currentCalendar.updateEvent(event)

          // should generate an end
          event = getMainEvent()
          expect(event.start).toEqualMoment('2014-05-02T00:00:00')
          expect(event.end).toEqualMoment('2014-05-02T01:00:00')
        })
      })
    })
    describe('when a related event has an end', function() {
      it('should move the end by the delta', function() {
        var event, relatedEvent

        initCalendar({
          events: [
            { id: '1', start: '2014-05-01T12:00:00', end: '2014-05-01T14:00:00', allDay: false, className: 'mainEvent' },
            { id: '1', start: '2014-05-10T16:00:00', end: '2014-05-10T19:00:00', allDay: false, className: 'relatedEvent' }
          ]
        })

        event = getMainEvent()
        event.end.add({ days: 1, hours: 1 })
        currentCalendar.updateEvent(event)

        event = getMainEvent()
        expect(event.start).toEqualMoment('2014-05-01T12:00:00')
        expect(event.end).toEqualMoment('2014-05-02T15:00:00')

        relatedEvent = getRelatedEvent()
        expect(relatedEvent.start).toEqualMoment('2014-05-10T16:00:00')
        expect(relatedEvent.end).toEqualMoment('2014-05-11T20:00:00')
      })
    })
  })

  describe('when moving an all-day event\'s start and end', function() {
    it('should move the start and end of related events', function() {
      var event, relatedEvent

      initCalendar({
        events: [
          { id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true, className: 'mainEvent' },
          { id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true, className: 'relatedEvent' }
        ]
      })

      event = getMainEvent()
      event.start.add(2, 'days')
      event.end.add(3, 'day')
      currentCalendar.updateEvent(event)

      event = getMainEvent()
      expect(event.start).toEqualMoment('2014-05-03')
      expect(event.end).toEqualMoment('2014-05-06')

      relatedEvent = getRelatedEvent()
      expect(relatedEvent.start).toEqualMoment('2014-05-12')
      expect(relatedEvent.end).toEqualMoment('2014-05-16')
    })
  })

  describe('when moving a timed event\'s start and end', function() {
    it('should move the start and end of related events', function() {
      var event, relatedEvent

      initCalendar({
        events: [
          { id: '1', start: '2014-05-01T06:00:00', end: '2014-05-03T06:00:00', allDay: false, className: 'mainEvent' },
          { id: '1', start: '2014-05-10T06:00:00', end: '2014-05-13T06:00:00', allDay: false, className: 'relatedEvent' }
        ]
      })

      event = getMainEvent()
      event.start.add({ days: 2, hours: 1 })
      event.end.add({ days: 3, hours: 2 })
      currentCalendar.updateEvent(event)

      event = getMainEvent()
      expect(event.start).toEqualMoment('2014-05-03T07:00:00')
      expect(event.end).toEqualMoment('2014-05-06T08:00:00')

      relatedEvent = getRelatedEvent()
      expect(relatedEvent.start).toEqualMoment('2014-05-12T07:00:00')
      expect(relatedEvent.end).toEqualMoment('2014-05-16T08:00:00')
    })
  })

  describe('when giving a time to an all-day event\'s start', function() {
    it('should erase the start\'s time and keep the event all-day', function() {
      var event, relatedEvent

      initCalendar({
        events: [
          { id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true, className: 'mainEvent' },
          { id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true, className: 'relatedEvent' }
        ]
      })

      event = getMainEvent()
      event.start.time('18:00')
      currentCalendar.updateEvent(event)

      event = getMainEvent()
      expect(event.allDay).toEqual(true)
      expect(event.start).toEqualMoment('2014-05-01')
      expect(event.end).toEqualMoment('2014-05-03')

      relatedEvent = getRelatedEvent()
      expect(relatedEvent.allDay).toEqual(true)
      expect(relatedEvent.start).toEqualMoment('2014-05-10')
      expect(relatedEvent.end).toEqualMoment('2014-05-13')
    })
  })

  // issue 2194
  describe('when accidentally giving a time to an all-day event with moment()', function() {
    it('should erase the start and end\'s times and keep the event all-day', function() {
      var event

      initCalendar({
        events: [
          { id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true, className: 'mainEvent' }
        ]
      })

      event = getMainEvent()
      event.start = moment('2014-05-01') // won't have an ambig time
      event.end = moment('2014-05-03') // "
      currentCalendar.updateEvent(event)

      event = getMainEvent()
      expect(event.allDay).toEqual(true)
      expect(event.start).toEqualMoment('2014-05-01')
      expect(event.end).toEqualMoment('2014-05-03')
    })
  })

  describe('when changing an event from all-day to timed', function() {
    describe('when the event\'s dates remain all-day', function() {
      it('should make the event and related events allDay=false and 00:00', function() {
        var event, relatedEvent

        initCalendar({
          events: [
            { id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true, className: 'mainEvent' },
            { id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true, className: 'relatedEvent' }
          ]
        })

        event = getMainEvent()
        event.allDay = false
        currentCalendar.updateEvent(event)

        event = getMainEvent()
        expect(event.allDay).toEqual(false)
        expect(event.start).toEqualMoment('2014-05-01T00:00:00')
        expect(event.end).toEqualMoment('2014-05-03T00:00:00')

        relatedEvent = getRelatedEvent()
        expect(relatedEvent.allDay).toEqual(false)
        expect(relatedEvent.start).toEqualMoment('2014-05-10T00:00:00')
        expect(relatedEvent.end).toEqualMoment('2014-05-13T00:00:00')
      })
    })
    describe('when the event\'s dates are set to a time', function() {
      it('should adjust the event and related event\'s allDay/start/end', function() {
        var event, relatedEvent

        initCalendar({
          events: [
            { id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true, className: 'mainEvent' },
            { id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true, className: 'relatedEvent' }
          ]
        })

        event = getMainEvent()
        event.allDay = false
        event.start.time('14:00')
        currentCalendar.updateEvent(event)

        event = getMainEvent()
        expect(event.allDay).toEqual(false)
        expect(event.start).toEqualMoment('2014-05-01T14:00:00')
        expect(event.end).toEqualMoment('2014-05-03T00:00:00')

        relatedEvent = getRelatedEvent()
        expect(relatedEvent.allDay).toEqual(false)
        expect(relatedEvent.start).toEqualMoment('2014-05-10T14:00:00')
        expect(relatedEvent.end).toEqualMoment('2014-05-13T00:00:00')
      })
    })
    describe('when the event\'s start is also moved', function() {
      it('should adjust the event and related event\'s allDay/start/end', function() {
        var event, relatedEvent

        initCalendar({
          events: [
            { id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true, className: 'mainEvent' },
            { id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true, className: 'relatedEvent' }
          ]
        })

        event = getMainEvent()
        event.allDay = false
        event.start.add(1, 'days')
        currentCalendar.updateEvent(event)

        event = getMainEvent()
        expect(event.allDay).toEqual(false)
        expect(event.start).toEqualMoment('2014-05-02T00:00:00')
        expect(event.end).toEqualMoment('2014-05-03T00:00:00')

        relatedEvent = getRelatedEvent()
        expect(relatedEvent.allDay).toEqual(false)
        expect(relatedEvent.start).toEqualMoment('2014-05-11T00:00:00')
        expect(relatedEvent.end).toEqualMoment('2014-05-13T00:00:00')
      })
    })
  })

  describe('when changing an event from timed to all-day', function() {
    it('should adjust the event and related event\'s allDay/start/end', function() {
      var event, relatedEvent

      initCalendar({
        events: [
          { id: '1', start: '2014-05-01T06:00:00', end: '2014-05-03T06:00:00', allDay: false, className: 'mainEvent' },
          { id: '1', start: '2014-05-10T06:00:00', end: '2014-05-13T06:00:00', allDay: false, className: 'relatedEvent' }
        ]
      })

      event = getMainEvent()
      event.allDay = true
      currentCalendar.updateEvent(event)

      event = getMainEvent()
      expect(event.allDay).toEqual(true)
      expect(event.start).toEqualMoment('2014-05-01')
      expect(event.end).toEqualMoment('2014-05-03')

      relatedEvent = getRelatedEvent()
      expect(relatedEvent.allDay).toEqual(true)
      expect(relatedEvent.start).toEqualMoment('2014-05-10')
      expect(relatedEvent.end).toEqualMoment('2014-05-13')
    })
    it('should adjust the event and related event\'s allDay/start/end and account for a new start', function() {
      var event, relatedEvent

      initCalendar({
        events: [
          { id: '1', start: '2014-05-01T06:00:00', end: '2014-05-03T06:00:00', allDay: false, className: 'mainEvent' },
          { id: '1', start: '2014-05-10T06:00:00', end: '2014-05-13T06:00:00', allDay: false, className: 'relatedEvent' }
        ]
      })

      event = getMainEvent()
      event.allDay = true
      event.start.add(1, 'days')
      currentCalendar.updateEvent(event)

      event = getMainEvent()
      expect(event.allDay).toEqual(true)
      expect(event.start).toEqualMoment('2014-05-02')
      expect(event.end).toEqualMoment('2014-05-03')

      relatedEvent = getRelatedEvent()
      expect(relatedEvent.allDay).toEqual(true)
      expect(relatedEvent.start).toEqualMoment('2014-05-11')
      expect(relatedEvent.end).toEqualMoment('2014-05-13')
    })
  })

  it('should accept moments that have unnormalized start/end', function() {
    var event, relatedEvent

    initCalendar({
      events: [
        { id: '1', start: '2014-05-01T06:00:00', end: '2014-05-03T06:00:00', allDay: false, className: 'mainEvent' },
        { id: '1', start: '2014-05-10T06:00:00', end: '2014-05-13T06:00:00', allDay: false, className: 'relatedEvent' }
      ]
    })

    event = getMainEvent()
    event.start = '2014-05-02T06:00:00' // move by 1 day
    event.end = '2014-05-05T06:00:00' // increase duration by 1 day
    currentCalendar.updateEvent(event)

    event = getMainEvent()
    expect(event.allDay).toEqual(false)
    expect(moment.isMoment(event.start)).toEqual(true)
    expect(event.start).toEqualMoment('2014-05-02T06:00:00')
    expect(moment.isMoment(event.end)).toEqual(true)
    expect(event.end).toEqualMoment('2014-05-05T06:00:00')

    relatedEvent = getRelatedEvent()
    expect(relatedEvent.allDay).toEqual(false)
    expect(moment.isMoment(relatedEvent.start)).toEqual(true)
    expect(relatedEvent.start).toEqualMoment('2014-05-11T06:00:00')
    expect(moment.isMoment(relatedEvent.end)).toEqual(true)
    expect(relatedEvent.end).toEqualMoment('2014-05-15T06:00:00')
  })

  it('should copy color-related properties to related events', function() {
    var event, relatedEvent

    initCalendar({
      events: [
        { id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true, className: 'mainEvent' },
        { id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true, className: 'relatedEvent' }
      ]
    })

    event = getMainEvent()
    event.color = 'red'
    currentCalendar.updateEvent(event)

    relatedEvent = getRelatedEvent()
    expect(relatedEvent.color).toBe('red')
  })

  it('should copy non-standard properties to related events', function() {
    var event, relatedEvent
    var specialObj = {}

    initCalendar({
      events: [
        { id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true, className: 'mainEvent' },
        { id: '1', start: '2014-05-10', end: '2014-05-13', allDay: true, className: 'relatedEvent' }
      ]
    })

    event = getMainEvent()
    event.someForeignKey = '123'
    event.myObj = specialObj
    currentCalendar.updateEvent(event)

    relatedEvent = getRelatedEvent()
    expect(relatedEvent.someForeignKey).toBe('123')
    expect(relatedEvent.myObj).toBe(specialObj)
  })

  function whenMovingStart(should) {
    describe('when moving an timed event\'s start', function() {
      beforeEach(function() {
        var event

        initCalendar({
          events: [
            { id: '1', start: '2014-05-01T06:00:00+05:00', end: '2014-05-03T06:00:00+05:00', allDay: false, className: 'mainEvent' },
            { id: '1', start: '2014-05-11T06:00:00+05:00', end: '2014-05-13T06:00:00+05:00', allDay: false, className: 'relatedEvent' }
          ]
        })

        event = getMainEvent()
        event.start.add(2, 'hours')
        currentCalendar.updateEvent(event)
      })
      should()
    })
  }

  function whenMovingEnd(should) {
    describe('when moving a timed event\'s end', function() {
      beforeEach(function() {
        var event

        initCalendar({
          events: [
            { id: '1', start: '2014-05-01T06:00:00+05:00', end: '2014-05-03T06:00:00+05:00', allDay: false, className: 'mainEvent' },
            { id: '1', start: '2014-05-11T06:00:00+05:00', end: '2014-05-13T06:00:00+05:00', allDay: false, className: 'relatedEvent' }
          ]
        })

        event = getMainEvent()
        event.end.add(2, 'hours')
        currentCalendar.updateEvent(event)
      })
      should()
    })
  }

  function whenMovingToTimed(should) {
    describe('when moving an all-day event to timed', function() {
      beforeEach(function() {
        var event

        initCalendar({
          events: [
            { id: '1', start: '2014-05-01', end: '2014-05-03', allDay: true, className: 'mainEvent' },
            { id: '1', start: '2014-05-11', end: '2014-05-13', allDay: true, className: 'relatedEvent' }
          ]
        })

        event = getMainEvent()
        event.allDay = false
        currentCalendar.updateEvent(event)
      })
      should()
    })
  }

  function shouldBeAmbiguouslyZoned() {
    it('should make the events ambiguously zoned', function() {
      var event = getMainEvent()
      var relatedEvent = getRelatedEvent()

      expect(event.start.hasZone()).toEqual(false)
      if (event.end) {
        expect(event.end.hasZone()).toEqual(false)
      }

      expect(relatedEvent.start.hasZone()).toEqual(false)
      if (relatedEvent.end) {
        expect(relatedEvent.end.hasZone()).toEqual(false)
      }
    })
  }

  function shouldBeLocal() {
    it('should make the events local', function() {
      var event = getMainEvent()
      var relatedEvent = getRelatedEvent()

      expect(event.start.hasZone()).toEqual(true)
      expect(event.start._isUTC).toEqual(false)
      if (event.end) {
        expect(event.end.hasZone()).toEqual(true)
        expect(event.end._isUTC).toEqual(false)
      }

      expect(relatedEvent.start.hasZone()).toEqual(true)
      expect(relatedEvent.start._isUTC).toEqual(false)
      if (relatedEvent.end) {
        expect(relatedEvent.end.hasZone()).toEqual(true)
        expect(relatedEvent.end._isUTC).toEqual(false)
      }
    })
  }

  function shouldBeUTC() {
    it('should make the events UTC', function() {
      var event = getMainEvent()
      var relatedEvent = getRelatedEvent()

      expect(event.start.hasZone()).toEqual(true)
      expect(event.start._isUTC).toEqual(true)
      if (event.end) {
        expect(event.end.hasZone()).toEqual(true)
        expect(event.end._isUTC).toEqual(true)
      }

      expect(event.start.hasZone()).toEqual(true)
      expect(event.start._isUTC).toEqual(true)
      if (relatedEvent.end) {
        expect(relatedEvent.end.hasZone()).toEqual(true)
        expect(relatedEvent.end._isUTC).toEqual(true)
      }
    })
  }

  describe('when calendar has no timezone', function() {
    pushOptions({
      timezone: false
    })
    whenMovingStart(shouldBeAmbiguouslyZoned)
    whenMovingEnd(shouldBeAmbiguouslyZoned)
    whenMovingToTimed(shouldBeAmbiguouslyZoned)
  })

  describe('when calendar has a local timezone', function() {
    pushOptions({
      timezone: 'local'
    })
    whenMovingStart(shouldBeLocal)
    whenMovingEnd(shouldBeLocal)
    whenMovingToTimed(shouldBeLocal)
  })

  describe('when calendar has a UTC timezone', function() {
    pushOptions({
      timezone: 'UTC'
    })
    whenMovingStart(shouldBeUTC)
    whenMovingEnd(shouldBeUTC)
    whenMovingToTimed(shouldBeUTC)
  })

  describe('when calendar has a custom timezone', function() {
    pushOptions({
      timezone: 'America/Chicago'
    })
    whenMovingStart(shouldBeAmbiguouslyZoned)
    whenMovingEnd(shouldBeAmbiguouslyZoned)
    whenMovingToTimed(shouldBeAmbiguouslyZoned)
  })

})
