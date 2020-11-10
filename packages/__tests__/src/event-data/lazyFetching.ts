describe('lazyFetching', () => {
  pushOptions({
    timeZone: 'UTC',
    initialView: 'dayGridMonth',
    initialDate: '2017-10-04',
  })

  describe('when on', () => {
    pushOptions({
      lazyFetching: true,
    })

    it('won\'t fetch weeks already queried', () => {
      let options = {
        events(fetchInfo, callback) {
          callback([])
        },
      }
      spyOn(options, 'events').and.callThrough()

      initCalendar(options)
      currentCalendar.changeView('timeGridWeek')
      currentCalendar.next()
      currentCalendar.next()
      currentCalendar.next()

      expect(options.events.calls.count()).toBe(1)

      let arg = options.events.calls.argsFor(0)[0]
      expect(arg.start).toEqualDate('2017-10-01T00:00:00Z')
      expect(arg.end).toEqualDate('2017-11-12T00:00:00Z')
    })
  })

  describe('when off', () => {
    pushOptions({
      lazyFetching: false,
    })

    it('will fetch each new week range', () => {
      let options = {
        events(fetchInfo, callback) {
          callback([])
        },
      }
      spyOn(options, 'events')

      initCalendar(options)
      currentCalendar.changeView('timeGridWeek')
      currentCalendar.next()
      currentCalendar.next()
      currentCalendar.next()

      expect(options.events.calls.count()).toBe(5)

      let arg = options.events.calls.argsFor(0)[0]
      expect(arg.start).toEqualDate('2017-10-01T00:00:00Z')
      expect(arg.end).toEqualDate('2017-11-12T00:00:00Z')

      arg = options.events.calls.argsFor(1)[0]
      expect(arg.start).toEqualDate('2017-10-01T00:00:00Z')
      expect(arg.end).toEqualDate('2017-10-08T00:00:00Z')

      arg = options.events.calls.argsFor(2)[0]
      expect(arg.start).toEqualDate('2017-10-08T00:00:00Z')
      expect(arg.end).toEqualDate('2017-10-15T00:00:00Z')

      arg = options.events.calls.argsFor(3)[0]
      expect(arg.start).toEqualDate('2017-10-15T00:00:00Z')
      expect(arg.end).toEqualDate('2017-10-22T00:00:00Z')

      arg = options.events.calls.argsFor(4)[0]
      expect(arg.start).toEqualDate('2017-10-22T00:00:00Z')
      expect(arg.end).toEqualDate('2017-10-29T00:00:00Z')
    })
  })
})
