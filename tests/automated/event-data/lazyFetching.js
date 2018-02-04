
describe('lazyFetching', function() {
  pushOptions({
    defaultView: 'month',
    defaultDate: '2017-10-04'
  })

  describe('when on', function() {
    pushOptions({
      lazyFetching: true
    })

    it('won\'t fetch weeks already queryied', function() {
      var args
      var options = {
        events: function(start, end, timezone, callback) {
          callback([])
        }
      }
      spyOn(options, 'events')

      initCalendar(options)
      currentCalendar.changeView('agendaWeek')
      currentCalendar.next()
      currentCalendar.next()
      currentCalendar.next()

      expect(options.events.calls.count()).toBe(1)

      args = options.events.calls.argsFor(0)
      expect(args[0]).toEqualMoment('2017-10-01')
      expect(args[1]).toEqualMoment('2017-11-12')
    })
  })

  describe('when off', function() {
    pushOptions({
      lazyFetching: false
    })

    it('will fetch each new week range', function() {
      var args
      var options = {
        events: function(start, end, timezone, callback) {
          callback([])
        }
      }
      spyOn(options, 'events')

      initCalendar(options)
      currentCalendar.changeView('agendaWeek')
      currentCalendar.next()
      currentCalendar.next()
      currentCalendar.next()

      expect(options.events.calls.count()).toBe(5)

      args = options.events.calls.argsFor(0)
      expect(args[0]).toEqualMoment('2017-10-01')
      expect(args[1]).toEqualMoment('2017-11-12')

      args = options.events.calls.argsFor(1)
      expect(args[0]).toEqualMoment('2017-10-01T00:00:00')
      expect(args[1]).toEqualMoment('2017-10-08T00:00:00')

      args = options.events.calls.argsFor(2)
      expect(args[0]).toEqualMoment('2017-10-08T00:00:00')
      expect(args[1]).toEqualMoment('2017-10-15T00:00:00')

      args = options.events.calls.argsFor(3)
      expect(args[0]).toEqualMoment('2017-10-15T00:00:00')
      expect(args[1]).toEqualMoment('2017-10-22T00:00:00')

      args = options.events.calls.argsFor(4)
      expect(args[0]).toEqualMoment('2017-10-22T00:00:00')
      expect(args[1]).toEqualMoment('2017-10-29T00:00:00')
    })
  })
})
