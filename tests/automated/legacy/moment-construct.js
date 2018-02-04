describe('moment constructor', function() {

  describe('$.fullCalendar.moment', function() {
    testDefaultProcessing($.fullCalendar.moment)
  })

  describe('$.fullCalendar.moment.utc', function() {
    testForcedUTCProcessing($.fullCalendar.moment.utc)
  })

  describe('$.fullCalendar.moment.parseZone', function() {
    testLiteralProcessing($.fullCalendar.moment.parseZone)
  })

  describe('Calendar::moment', function() {
    [
      {
        description: 'when there is no timezone',
        timezone: false,
        testMethod: testLiteralProcessing
      },
      {
        description: 'when timezone is local',
        timezone: 'local',
        testMethod: testForcedLocalProcessing
      },
      {
        description: 'when timezone is UTC',
        timezone: 'UTC',
        testMethod: testForcedUTCProcessing
      },
      {
        description: 'when timezone is custom',
        timezone: 'America/Unknown',
        testMethod: testLiteralProcessing
      }
    ]
      .forEach(function(scenario) {
        describe(scenario.description, function() {
          scenario.testMethod(function() {
            initCalendar({
              timezone: scenario.timezone
            })
            return currentCalendar.moment.apply(currentCalendar, arguments)
          })
        })
      })
  })

  function testDefaultProcessing(construct) {

    describe('when given an ISO8601 string', function() {

      it('is local regardless of inputted zone', function() {
        var mom = construct('2014-06-08T10:00:00+0130')
        var simpleMoment = moment('2014-06-08T10:00:00+0130')
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(true)
        expect(mom.utcOffset()).toBe(simpleMoment.utcOffset())
      })

      it('parses as local when no zone', function() {
        var mom = construct('2014-06-08T10:00:00')
        var dateEquiv = new Date(2014, 5, 8, 10)
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 10, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(true)
        expect(mom.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
      })

      it('accepts an ambiguous time', function() {
        var mom = construct('2014-06-08')
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 0, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(false)
        expect(mom.hasZone()).toBe(false)
        expect(mom.utcOffset()).toBe(0)
      })

      it('assumes first-of-month and ambiguous time when no date-of-month', function() {
        var mom = construct('2014-06')
        expect(mom.toArray()).toEqual([ 2014, 5, 1, 0, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(false)
        expect(mom.hasZone()).toBe(false)
        expect(mom.utcOffset()).toBe(0)
      })
    })

    it('parses string/format combo as local', function() {
      var mom = construct('12-25-1995', 'MM-DD-YYYY')
      var dateEquiv = new Date(1995, 11, 25)
      expect(mom.toArray()).toEqual([ 1995, 11, 25, 0, 0, 0, 0 ])
      expect(mom.hasZone()).toBe(true)
      expect(mom.hasTime()).toBe(true)
      expect(mom.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
    })

    it('is local when given no arguments', function() {
      var mom = construct()
      var dateEquiv = new Date()
      expect(mom.hasTime()).toBe(true)
      expect(mom.hasZone()).toBe(true)
      expect(mom.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
    })

    it('is local when given a native Date', function() {
      var date = new Date()
      var mom = construct(date)
      expect(mom.hasTime()).toBe(true)
      expect(mom.hasZone()).toBe(true)
      expect(mom.utcOffset()).toBe(-date.getTimezoneOffset())
    })

    describe('when given an array', function() {

      it('is local and has a time when given hours/minutes/seconds', function() {
        var a = [ 2014, 5, 8, 11, 0, 0 ]
        var dateEquiv = new Date(2014, 5, 8, 11, 0, 0)
        var mom = construct(a)
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 11, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(true)
        expect(mom.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
      })

      it('is local and has a time even when no hours/minutes/seconds', function() {
        var a = [ 2014, 5, 8 ]
        var dateEquiv = new Date(2014, 5, 8)
        var mom = construct(a)
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 0, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(true)
        expect(mom.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
      })
    })

    describe('when given an existing FullCalendar moment', function() {

      it('remains ambiguously-zoned', function() {
        var noTzMoment = $.fullCalendar.moment.parseZone('2014-05-28T00:00:00')
        var newMoment = construct(noTzMoment)
        expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
        expect(newMoment.hasTime()).toBe(true)
        expect(newMoment.hasZone()).toBe(false)
        expect(newMoment.utcOffset()).toBe(0)
      })

      it('remains ambiguously-timed', function() {
        var noTimeMoment = $.fullCalendar.moment('2014-05-28')
        var newMoment = construct(noTimeMoment)
        expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
        expect(newMoment.hasTime()).toBe(false)
        expect(newMoment.hasZone()).toBe(false)
        expect(newMoment.utcOffset()).toBe(0)
      })
    });

    [
      { description: 'when given an existing FullCalendar moment', moment: $.fullCalendar.moment },
      { description: 'when given an existing basic moment', moment: moment }
    ]
      .forEach(function(scenario) {
        describe(scenario.description, function() {

          it('remains local', function() {
            var localMoment = scenario.moment('2014-05-28T00:00:00')
            var newMoment = construct(localMoment)
            expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
            expect(newMoment.hasTime()).toBe(true)
            expect(newMoment.hasZone()).toBe(true)
            expect(newMoment.utcOffset()).toBe(localMoment.utcOffset())
          })

          it('remains UTC', function() {
            var utcMoment = scenario.moment.utc('2014-05-28T00:00:00')
            var newMoment = construct(utcMoment)
            expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
            expect(newMoment.hasTime()).toBe(true)
            expect(newMoment.hasZone()).toBe(true)
            expect(newMoment.utcOffset()).toBe(0)
          })

          it('remains in a custom timezone', function() {
            var tzMoment = scenario.moment.parseZone('2014-05-28T00:00:00+13:00')
            var newMoment = construct(tzMoment)
            expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
            expect(newMoment.hasTime()).toBe(true)
            expect(newMoment.hasZone()).toBe(true)
            expect(newMoment.utcOffset()).toBe(780)
          })

          it('produces a new moment that is in no way bound to the old', function() {
            var oldMoment = scenario.moment()
            var newMoment = construct(oldMoment)
            expect(newMoment).not.toBe(oldMoment)
            expect(+newMoment).toBe(+oldMoment)
            newMoment.add(1, 'months')
            expect(+newMoment).not.toBe(+oldMoment)
          })
        })
      })
  }

  function testForcedLocalProcessing(construct) {

    describe('when given an ISO8601 string', function() {

      it('is local regardless of inputted zone', function() {
        var mom = construct('2014-06-08T10:00:00+0130')
        var simpleMoment = moment('2014-06-08T10:00:00+0130')
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(true)
        expect(mom.utcOffset()).toBe(simpleMoment.utcOffset())
      })

      it('parses as local when no zone', function() {
        var mom = construct('2014-06-08T10:00:00')
        var dateEquiv = new Date(2014, 5, 8, 10)
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 10, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(true)
        expect(mom.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
      })

      it('accepts an ambiguous time', function() {
        var mom = construct('2014-06-08')
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 0, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(false)
        expect(mom.hasZone()).toBe(false)
        expect(mom.utcOffset()).toBe(0)
      })

      it('assumes first-of-month and ambiguous time when no date-of-month', function() {
        var mom = construct('2014-06')
        expect(mom.toArray()).toEqual([ 2014, 5, 1, 0, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(false)
        expect(mom.hasZone()).toBe(false)
        expect(mom.utcOffset()).toBe(0)
      })
    })

    it('parses string/format combo as local', function() {
      var mom = construct('12-25-1995', 'MM-DD-YYYY')
      var dateEquiv = new Date(1995, 11, 25)
      expect(mom.toArray()).toEqual([ 1995, 11, 25, 0, 0, 0, 0 ])
      expect(mom.hasZone()).toBe(true)
      expect(mom.hasTime()).toBe(true)
      expect(mom.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
    })

    it('is local when given no arguments', function() {
      var mom = construct()
      var dateEquiv = new Date()
      expect(mom.hasTime()).toBe(true)
      expect(mom.hasZone()).toBe(true)
      expect(mom.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
    })

    it('is local when given a native Date', function() {
      var date = new Date()
      var mom = construct(date)
      expect(mom.hasTime()).toBe(true)
      expect(mom.hasZone()).toBe(true)
      expect(mom.utcOffset()).toBe(-date.getTimezoneOffset())
    })

    describe('when given an array', function() {

      it('is local and has a time when given hours/minutes/seconds', function() {
        var a = [ 2014, 5, 8, 11, 0, 0 ]
        var dateEquiv = new Date(2014, 5, 8, 11, 0, 0)
        var mom = construct(a)
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 11, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(true)
        expect(mom.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
      })

      it('is local and has a time even when no hours/minutes/seconds', function() {
        var a = [ 2014, 5, 8 ]
        var dateEquiv = new Date(2014, 5, 8)
        var mom = construct(a)
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 0, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(true)
        expect(mom.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
      })
    })

    describe('when given an existing FullCalendar moment', function() {

      it('converts to local when ambiguously-zoned', function() {
        var noTzMoment = $.fullCalendar.moment.parseZone('2014-05-28T00:00:00')
        var newMoment = construct(noTzMoment)
        var dateEquiv = new Date(2014, 4, 28)
        expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
        expect(newMoment.hasTime()).toBe(true)
        expect(newMoment.hasZone()).toBe(true)
        expect(newMoment.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
      })

      it('remains ambiguously-timed', function() {
        var noTimeMoment = $.fullCalendar.moment('2014-05-28')
        var newMoment = construct(noTimeMoment)
        expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
        expect(newMoment.hasTime()).toBe(false)
        expect(newMoment.hasZone()).toBe(false)
        expect(newMoment.utcOffset()).toBe(0)
      })
    });

    [
      { description: 'when given an existing FullCalendar moment', moment: $.fullCalendar.moment },
      { description: 'when given an existing basic moment', moment: moment }
    ]
      .forEach(function(scenario) {
        describe(scenario.description, function() {

          it('remains local', function() {
            var localMoment = scenario.moment('2014-05-28T00:00:00')
            var newMoment = construct(localMoment)
            expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
            expect(newMoment.hasTime()).toBe(true)
            expect(newMoment.hasZone()).toBe(true)
            expect(newMoment.utcOffset()).toBe(localMoment.utcOffset())
          })

          it('converts to local when UTC', function() {
            var utcMoment = scenario.moment.utc('2014-05-28T00:00:00')
            var newMoment = construct(utcMoment)
            var dateEquiv = new Date(Date.UTC(2014, 4, 28))
            expect(+newMoment).toBe(+dateEquiv)
            expect(newMoment.hasTime()).toBe(true)
            expect(newMoment.hasZone()).toBe(true)
            expect(newMoment.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
          })

          it('converts to local when in a custom zone', function() {
            var tzMoment = scenario.moment.parseZone('2014-05-28T00:00:00+13:00')
            var dateEquiv = tzMoment.toDate()
            var newMoment = construct(tzMoment)
            expect(+newMoment).toBe(+dateEquiv)
            expect(newMoment.hasTime()).toBe(true)
            expect(newMoment.hasZone()).toBe(true)
            expect(newMoment.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
          })

          it('produces a new moment that is in no way bound to the old', function() {
            var oldMoment = scenario.moment()
            var newMoment = construct(oldMoment)
            expect(newMoment).not.toBe(oldMoment)
            expect(+newMoment).toBe(+oldMoment)
            newMoment.add(1, 'months')
            expect(+newMoment).not.toBe(+oldMoment)
          })
        })
      })
  }

  function testForcedUTCProcessing(construct) {

    describe('when given an ISO8601 string', function() {

      it('is UTC regardless of inputted zone', function() {
        var mom = construct('2014-06-08T10:00:00+0130')
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(true)
        expect(mom.utcOffset()).toBe(0)
      })

      it('parses as UTC when no zone', function() {
        var mom = construct('2014-06-08T10:00:00')
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 10, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(true)
        expect(mom.utcOffset()).toBe(0)
      })

      it('accepts an ambiguous time', function() {
        var mom = construct('2014-06-08')
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 0, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(false)
        expect(mom.hasZone()).toBe(false)
        expect(mom.utcOffset()).toBe(0)
      })

      it('assumes first-of-month and ambiguous time when no date-of-month', function() {
        var mom = construct('2014-06')
        expect(mom.toArray()).toEqual([ 2014, 5, 1, 0, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(false)
        expect(mom.hasZone()).toBe(false)
        expect(mom.utcOffset()).toBe(0)
      })
    })

    it('parses string/format combo as UTC', function() {
      var mom = construct('12-25-1995', 'MM-DD-YYYY')
      expect(mom.toArray()).toEqual([ 1995, 11, 25, 0, 0, 0, 0 ])
      expect(mom.hasZone()).toBe(true)
      expect(mom.hasTime()).toBe(true)
      expect(mom.utcOffset()).toBe(0)
    })

    it('is UTC when given no arguments', function() {
      var mom = construct()
      expect(mom.hasTime()).toBe(true)
      expect(mom.hasZone()).toBe(true)
      expect(mom.utcOffset()).toBe(0)
    })

    it('is UTC when given a native Date', function() {
      var date = new Date()
      var mom = construct(date)
      expect(mom.hasTime()).toBe(true)
      expect(mom.hasZone()).toBe(true)
      expect(mom.utcOffset()).toBe(0)
    })

    describe('when given an array', function() {

      it('is UTC and has a time when given hours/minutes/seconds', function() {
        var a = [ 2014, 5, 8, 11, 0, 0 ]
        var mom = construct(a)
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 11, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(true)
        expect(mom.utcOffset()).toBe(0)
      })

      it('is UTC and has a time even when no hours/minutes/seconds', function() {
        var a = [ 2014, 5, 8 ]
        var mom = construct(a)
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 0, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(true)
        expect(mom.utcOffset()).toBe(0)
      })
    })

    describe('when given an existing FullCalendar moment', function() {

      it('converts to UTC when ambiguously-zoned', function() {
        var noTzMoment = $.fullCalendar.moment.utc('2014-05-28T00:00:00')
        var newMoment = construct(noTzMoment)
        expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
        expect(newMoment.hasTime()).toBe(true)
        expect(newMoment.hasZone()).toBe(true)
        expect(newMoment.utcOffset()).toBe(0)
      })

      it('remains ambiguously-timed', function() {
        var noTimeMoment = $.fullCalendar.moment('2014-05-28')
        var newMoment = construct(noTimeMoment)
        expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
        expect(newMoment.hasTime()).toBe(false)
        expect(newMoment.hasZone()).toBe(false)
        expect(newMoment.utcOffset()).toBe(0)
      })
    });

    [
      { description: 'when given an existing FullCalendar moment', moment: $.fullCalendar.moment },
      { description: 'when given an existing basic moment', moment: moment }
    ]
      .forEach(function(scenario) {
        describe(scenario.description, function() {

          it('converts to UTC when local', function() {
            var localMoment = scenario.moment('2014-05-28T00:00:00')
            var newMoment = construct(localMoment)
            expect(+newMoment).toBe(+localMoment) // same point in time
            expect(newMoment.hasTime()).toBe(true)
            expect(newMoment.hasZone()).toBe(true)
            expect(newMoment.utcOffset()).toBe(0)
          })

          it('remains UTC', function() {
            var utcMoment = scenario.moment.utc('2014-05-28T00:00:00')
            var newMoment = construct(utcMoment)
            expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
            expect(newMoment.hasTime()).toBe(true)
            expect(newMoment.hasZone()).toBe(true)
            expect(newMoment.utcOffset()).toBe(0)
          })

          it('converts to UTC when in a custom zone', function() {
            var tzMoment = scenario.moment.parseZone('2014-05-28T00:00:00+13:00')
            var newMoment = construct(tzMoment)
            expect(+newMoment).toBe(+tzMoment) // same point in time
            expect(newMoment.hasTime()).toBe(true)
            expect(newMoment.hasZone()).toBe(true)
            expect(newMoment.utcOffset()).toBe(0)
          })

          it('produces a new moment that is in no way bound to the old', function() {
            var oldMoment = scenario.moment.utc()
            var newMoment = construct(oldMoment)
            expect(newMoment).not.toBe(oldMoment)
            expect(+newMoment).toBe(+oldMoment)
            newMoment.add(1, 'months')
            expect(+newMoment).not.toBe(+oldMoment)
          })
        })
      })
  }

  function testLiteralProcessing(construct) {

    describe('when given an ISO8601 string', function() {

      it('retains the inputted zone', function() {
        var mom = construct('2014-06-08T11:00:00+0130')
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 11, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(true)
        expect(mom.utcOffset()).toBe(90)
      })

      it('accepts an ambiguous zone', function() {
        var mom = construct('2014-06-08T11:00:00')
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 11, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(false)
        expect(mom.utcOffset()).toBe(0)
      })

      it('accepts an ambiguous time', function() {
        var mom = construct('2014-06-08')
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 0, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(false)
        expect(mom.hasZone()).toBe(false)
        expect(mom.utcOffset()).toBe(0)
      })

      it('assumes first-of-month and ambiguous time when no date-of-month', function() {
        var mom = construct('2014-06')
        expect(mom.toArray()).toEqual([ 2014, 5, 1, 0, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(false)
        expect(mom.hasZone()).toBe(false)
        expect(mom.utcOffset()).toBe(0)
      })
    })

    it('parses string/format combo as UTC', function() {
      var mom = construct('12-25-1995', 'MM-DD-YYYY')
      expect(mom.toArray()).toEqual([ 1995, 11, 25, 0, 0, 0, 0 ])
      expect(mom.hasZone()).toBe(true)
      expect(mom.hasTime()).toBe(true)
      expect(mom.utcOffset()).toBe(0)
    })

    it('is local when given no arguments', function() {
      var mom = construct()
      var dateEquiv = new Date()
      expect(mom.hasTime()).toBe(true)
      expect(mom.hasZone()).toBe(true)
      expect(mom.utcOffset()).toBe(-dateEquiv.getTimezoneOffset())
    })

    it('is local when given a native Date', function() {
      var date = new Date()
      var mom = construct(date)
      expect(mom.hasTime()).toBe(true)
      expect(mom.hasZone()).toBe(true)
      expect(mom.utcOffset()).toBe(-date.getTimezoneOffset())
    })

    describe('when given an array', function() {

      it('is ambiguously-zoned and has a time when given hours/minutes/seconds', function() {
        var a = [ 2014, 5, 8, 11, 0, 0 ]
        var mom = construct(a)
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 11, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(false)
        expect(mom.utcOffset()).toBe(0)
      })

      it('is ambiguously-zoned and has a time even when no hours/minutes/seconds', function() {
        var a = [ 2014, 5, 8 ]
        var mom = construct(a)
        expect(mom.toArray()).toEqual([ 2014, 5, 8, 0, 0, 0, 0 ])
        expect(mom.hasTime()).toBe(true)
        expect(mom.hasZone()).toBe(false)
        expect(mom.utcOffset()).toBe(0)
      })
    })

    describe('when given an existing FullCalendar moment', function() {

      it('remains ambiguously-zoned', function() {
        var noTzMoment = $.fullCalendar.moment.parseZone('2014-05-28T00:00:00')
        var newMoment = construct(noTzMoment)
        expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
        expect(newMoment.hasTime()).toBe(true)
        expect(newMoment.hasZone()).toBe(false)
        expect(newMoment.utcOffset()).toBe(0)
      })

      it('remains ambiguously-timed', function() {
        var noTimeMoment = $.fullCalendar.moment('2014-05-28')
        var newMoment = construct(noTimeMoment)
        expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
        expect(newMoment.hasTime()).toBe(false)
        expect(newMoment.hasZone()).toBe(false)
        expect(newMoment.utcOffset()).toBe(0)
      })
    });

    [
      { description: 'when given an existing FullCalendar moment', moment: $.fullCalendar.moment },
      { description: 'when given an existing basic moment', moment: moment }
    ]
      .forEach(function(scenario) {
        describe(scenario.description, function() {

          it('remains local', function() {
            var localMoment = scenario.moment('2014-05-28T00:00:00')
            var newMoment = construct(localMoment)
            expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
            expect(newMoment.hasTime()).toBe(true)
            expect(newMoment.hasZone()).toBe(true)
            expect(newMoment.utcOffset()).toBe(localMoment.utcOffset())
          })

          it('remains UTC', function() {
            var utcMoment = scenario.moment.utc('2014-05-28T00:00:00')
            var newMoment = construct(utcMoment)
            expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
            expect(newMoment.hasTime()).toBe(true)
            expect(newMoment.hasZone()).toBe(true)
            expect(newMoment.utcOffset()).toBe(0)
          })

          it('remains in a custom timezone', function() {
            var tzMoment = scenario.moment.parseZone('2014-05-28T00:00:00+13:00')
            var newMoment = construct(tzMoment)
            expect(newMoment.toArray()).toEqual([ 2014, 4, 28, 0, 0, 0, 0 ])
            expect(newMoment.hasTime()).toBe(true)
            expect(newMoment.hasZone()).toBe(true)
            expect(newMoment.utcOffset()).toBe(780)
          })

          it('produces a new moment that is in no way bound to the old', function() {
            var oldMoment = scenario.moment()
            var newMoment = construct(oldMoment)
            expect(newMoment).not.toBe(oldMoment)
            expect(+newMoment).toBe(+oldMoment)
            newMoment.add(1, 'months')
            expect(+newMoment).not.toBe(+oldMoment)
          })

        })
      })
  }

})
