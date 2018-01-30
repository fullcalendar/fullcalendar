describe('FCMoment::time', function() {

  describe('getter', function() {

    // the scenario where an ambiguously-timed moment's 00:00 time is checked
    // is taken care of in moment-ambig.js

    it('should return 00:00 for a moment with 00:00 time', function() {
      var mom = $.fullCalendar.moment.utc('2014-06-08T00:00:00')
      var time = mom.time()
      expect(time).toEqualDuration('00:00')
    })

    it('should return the time of a moment with a time', function() {
      var mom = $.fullCalendar.moment.utc('2014-06-08T07:30:00')
      var time = mom.time()
      expect(time).toEqualDuration('07:30')
    })
  })

  describe('setter', function() {

    // the scenario where an ambiguously-timed moment is given a time via the setter
    // is taken care of in moment-ambig.js

    describe('when setting with a Duration', function() {

      it('should give a moment with 00:00 a time', function() {
        var mom = $.fullCalendar.moment.utc('2014-06-08T00:00:00')
        var dur = moment.duration('13:25')
        mom.time(dur)
        expect(mom).toEqualMoment('2014-06-08T13:25:00+00:00')
      })

      it('should overwrite the time of a moment with a time', function() {
        var mom = $.fullCalendar.moment.utc('2014-06-08T05:00:00')
        var dur = moment.duration('13:25')
        mom.time(dur)
        expect(mom).toEqualMoment('2014-06-08T13:25:00+00:00')
      })

      it('should move to next day if greater than 24 hours', function() {
        var mom = $.fullCalendar.moment.utc('2014-06-08T00:00:00')
        var dur = moment.duration('1.01:00:00') // 1 day, 1 hour
        mom.time(dur)
        expect(mom).toEqualMoment('2014-06-09T01:00:00+00:00')
      })
    })

    describe('when setting with another Moment', function() {

      it('should give a moment with 00:00 a time', function() {
        var mom1 = $.fullCalendar.moment.utc('2014-06-09T00:00:00')
        var mom2 = $.fullCalendar.moment.utc('2014-07-22T05:30:00') // a Tues, so .days() -> 2
        mom1.time(mom2)
        expect(mom1).toEqualMoment('2014-06-09T05:30:00+00:00')
      })

      it('should overwrite the time of a moment with a time', function() {
        var mom1 = $.fullCalendar.moment.utc('2014-06-09T04:15:00')
        var mom2 = $.fullCalendar.moment.utc('2014-07-22T05:30:00') // a Tues, so .days() -> 2
        mom1.time(mom2)
        expect(mom1).toEqualMoment('2014-06-09T05:30:00+00:00')
      })
    })
  })
})

describe('FCMoment::week', function() {

  it('computes based on a weekNumberCalculation function', function() {
    initCalendar({
      weekNumberCalculation: function(date) {
        expect(moment.isMoment(date)).toBe(true)
        return 999
      }
    })
    var mom = currentCalendar.moment()
    expect(mom.week()).toBe(999)
  })

  it('computes based on a weekNumberCalculation "ISO" value', function() {
    initCalendar({
      weekNumberCalculation: 'ISO'
    })
    var mom = currentCalendar.moment('2015-02-22') // is 9 local week, 8 ISO week
    expect(mom.week()).toBe(8)
  })

  it('computes based on a weekNumberCalculation "local" value', function() {
    initCalendar({
      weekNumberCalculation: 'local'
    })
    var mom = currentCalendar.moment('2015-02-22') // is 9 local week, 8 ISO week
    expect(mom.week()).toBe(9)
  })
})
