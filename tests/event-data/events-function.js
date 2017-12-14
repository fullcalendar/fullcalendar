
describe('events as a function', function() {

  it('requests the correct dates when days at the start/end of the month are hidden', function(done) {
    initCalendar({
      defaultView: 'month',
      defaultDate: '2013-06-01', // June 2013 has first day as Saturday, and last as Sunday!
      weekends: false,
      fixedWeekCount: false,
      events: function(start, end, timezone, callback) {
        expect(start).toEqualMoment('2013-06-03')
        expect(end).toEqualMoment('2013-06-29')
        done()
      }
    })
  })

  it('does not request dates excluded by showNonCurrentDates:false', function(done) {
    initCalendar({
      defaultView: 'month',
      defaultDate: '2013-06-01',
      showNonCurrentDates: false,
      events: function(start, end, timezone, callback) {
        expect(start).toEqualMoment('2013-06-01')
        expect(end).toEqualMoment('2013-07-01')
        done()
      }
    })
  })

  it('requests a timed range when minTime is negative', function(done) {
    initCalendar({
      defaultView: 'agendaWeek',
      defaultDate: '2017-06-08',
      minTime: { hours: -2 },
      events: function(start, end, timezone, callback) {
        expect(start).toEqualMoment('2017-06-03T22:00:00')
        expect(end).toEqualMoment('2017-06-11T00:00:00')
        done()
      }
    })
  })

  it('requests a timed range when maxTime exceeds 24 hours', function(done) {
    initCalendar({
      defaultView: 'agendaWeek',
      defaultDate: '2017-06-08',
      maxTime: '26:00',
      events: function(start, end, timezone, callback) {
        expect(start).toEqualMoment('2017-06-04T00:00:00')
        expect(end).toEqualMoment('2017-06-11T02:00:00')
        done()
      }
    })
  })

  it('calls loading callback', function(done) {
    var loadingCallArgs = []

    initCalendar({
      loading: function(bool) {
        loadingCallArgs.push(bool)
      },
      events: function(start, end, timezone, callback) {
        setTimeout(function() {
          expect(loadingCallArgs).toEqual([ true ])
          callback([])
          setTimeout(function() {
            expect(loadingCallArgs).toEqual([ true, false ])
            done()
          }, 0)
        }, 0)
      }
    })
  })

  it('calls loading callback only once for multiple sources', function(done) {
    var loadingCallArgs = []

    initCalendar({
      loading: function(bool) {
        loadingCallArgs.push(bool)
      },
      eventSources: [
        function(start, end, timezone, callback) {
          setTimeout(function() {
            callback([])
          }, 0)
        },
        function(start, end, timezone, callback) {
          setTimeout(function() {
            callback([])
          }, 10)
        }
      ]
    })

    setTimeout(function() {
      expect(loadingCallArgs).toEqual([ true, false ])
      done()
    }, 20)
  })
})
