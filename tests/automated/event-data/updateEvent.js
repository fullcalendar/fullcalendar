
describe('updateEvent', function() {

  describe('when changing an event\'s ID', function() {
    pushOptions({
      defaultView: 'month',
      now: '2017-07-14',
      events: [
        { id: '2', start: '2017-07-14', end: '2017-07-19' }
      ]
    })

    it('reflects the ID change on the event object', function(done) {
      var allRenderCnt = 0

      initCalendar({
        eventAfterAllRender: function() {
          var eventObjs
          var eventObj

          allRenderCnt++

          if (allRenderCnt === 1) {
            eventObjs = currentCalendar.clientEvents()
            expect(eventObjs.length).toBe(1)

            eventObj = eventObjs[0]
            eventObj.id = '3'
            currentCalendar.updateEvent(eventObj)

            eventObjs = currentCalendar.clientEvents()
            expect(eventObjs.length).toBe(1)
            eventObj = eventObjs[0]
            expect(eventObj.id).toBe('3')

            done()
          }
        }
      })
    })

    it('reflects the ID change during event rendering', function(done) {
      var allRenderCnt = 0
      var renderCnt = 0

      initCalendar({
        eventRender: function(eventObj) {
          if (allRenderCnt === 1) {
            expect(eventObj.id).toBe('3')
            renderCnt++
          }
        },
        eventAfterAllRender: function() {
          var eventObjs
          var eventObj

          allRenderCnt++

          if (allRenderCnt === 1) {
            eventObjs = currentCalendar.clientEvents()
            expect(eventObjs.length).toBe(1)

            eventObj = eventObjs[0]
            eventObj.id = '3'
            currentCalendar.updateEvent(eventObj)
          } else if (allRenderCnt === 2) {
            expect(renderCnt).toBe(2)
            done()
          }
        }
      })
    })
  })

  describe('when changing an event from timed to all-day', function() {
    pushOptions({
      defaultView: 'month',
      now: '2017-07-14',
      events: [
        { id: '2', start: '2017-07-14T08:00:00Z', end: '2017-07-14T12:00:00Z' }
      ]
    })

    it('reflects the change on the event object', function(done) {
      var allRenderCnt = 0

      initCalendar({
        eventAfterAllRender: function() {
          var eventObj

          allRenderCnt++

          if (allRenderCnt === 1) {
            eventObj = currentCalendar.clientEvents('2')[0]

            expect(eventObj.allDay).toBe(false)

            eventObj.allDay = true
            eventObj.start = '2017-07-14'
            eventObj.end = '2017-07-15'
            currentCalendar.updateEvent(eventObj)

            eventObj = currentCalendar.clientEvents('2')[0]

            expect(eventObj.allDay).toBe(true)
            expect(eventObj.start.format()).toBe('2017-07-14')
            expect(eventObj.end.format()).toBe('2017-07-15')

            done()
          }
        }
      })
    })
  })

  describe('when changing an event from all-day to timed', function() {

    it('accepts all new properties as-is', function() {
      var event

      initCalendar({
        defaultView: 'month',
        defaultDate: '2016-04-29',
        events: [
          {
            title: 'Test event',
            start: '2016-04-29'
          }
        ]
      })

      event = currentCalendar.clientEvents()[0]

      event.allDay = false
      event.start = '2016-04-29T12:00:00' // 12 noon
      event.end = '2016-04-29T14:00:00' // 2pm
      currentCalendar.updateEvent(event)

      event = currentCalendar.clientEvents()[0]
      expect(event.allDay).toBe(false)
      expect(moment.isMoment(event.start)).toBe(true)
      expect(moment.isMoment(event.end)).toBe(true)
      expect(event.start).toEqualMoment('2016-04-29T12:00:00')
      expect(event.end).toEqualMoment('2016-04-29T14:00:00')
    })
  })

  describe('when adding a new misc object property', function() {

    it('accepts the new property', function() {
      var event

      initCalendar({
        now: '2017-10-05',
        events: [
          { title: 'event 0', start: '2017-10-05' }
        ]
      })

      event = currentCalendar.clientEvents()[0]
      event.user = { fname: 'Adam' }
      currentCalendar.updateEvent(event)

      event = currentCalendar.clientEvents()[0]
      expect(typeof event.user).toBe('object')
      expect(event.user.fname).toBe('Adam')
    })
  })

  describe('when modifying an existing misc object property', function() {

    it('accepts the new property', function() {
      var event

      initCalendar({
        now: '2017-10-05',
        events: [
          { title: 'event 0', start: '2017-10-05', user: { fname: 'Adam' } }
        ]
      })

      event = currentCalendar.clientEvents()[0]
      expect(typeof event.user).toBe('object')
      expect(event.user.fname).toBe('Adam')

      event.user = { fname: 'John' }
      currentCalendar.updateEvent(event)

      event = currentCalendar.clientEvents()[0]
      expect(typeof event.user).toBe('object')
      expect(event.user.fname).toBe('John')
    })
  })

  describe('with className', function() {

    describe('when not modified', function() {
      it('maintains classNames for individual event defs', function() {
        var eventA, eventB

        initCalendar({
          now: '2017-10-05',
          events: [
            { id: '1', title: 'event1', start: '2017-10-05', otherId: 'a', customProp: 'asdf', className: 'myclassA' },
            { id: '1', title: 'event1', start: '2017-10-12', otherId: 'b', customProp: 'asdf', className: 'myclassB' }
          ]
        })

        eventA = currentCalendar.clientEvents(function(eventDef) {
          return eventDef.otherId === 'a'
        })[0]

        eventA.customProp = 'qwer'
        currentCalendar.updateEvent(eventA)

        eventA = currentCalendar.clientEvents(function(eventDef) {
          return eventDef.otherId === 'a'
        })[0]

        eventB = currentCalendar.clientEvents(function(eventDef) {
          return eventDef.otherId === 'b'
        })[0]

        expect(eventA.customProp).toBe('qwer')
        expect(eventA.className).toEqual([ 'myclassA' ])
        expect(eventB.customProp).toBe('qwer')
        expect(eventB.className).toEqual([ 'myclassB' ])
      })
    })

    describe('when modified', function() {
      it('changes classNames for all similar event defs', function() {
        var eventA, eventB

        initCalendar({
          now: '2017-10-05',
          events: [
            { id: '1', title: 'event1', start: '2017-10-05', otherId: 'a', className: 'myclassA' },
            { id: '1', title: 'event1', start: '2017-10-12', otherId: 'b', className: 'myclassB' }
          ]
        })

        eventA = currentCalendar.clientEvents(function(eventDef) {
          return eventDef.otherId === 'a'
        })[0]

        eventA.className = [ 'otherClass' ]
        currentCalendar.updateEvent(eventA)

        eventA = currentCalendar.clientEvents(function(eventDef) {
          return eventDef.otherId === 'a'
        })[0]

        eventB = currentCalendar.clientEvents(function(eventDef) {
          return eventDef.otherId === 'b'
        })[0]

        expect(eventA.className).toEqual([ 'otherClass' ])
        expect(eventB.className).toEqual([ 'otherClass' ])
      })
    })
  })
})
