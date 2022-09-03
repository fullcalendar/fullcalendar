describe('events as a function', () => {
  pushOptions({
    timeZone: 'UTC',
  })

  it('requests the correct dates when days at the start/end of the month are hidden', (done) => {
    initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2013-06-01', // June 2013 has first day as Saturday, and last as Sunday!
      weekends: false,
      fixedWeekCount: false,
      events(arg, callback) {
        expect(arg.start).toEqualDate('2013-06-03T00:00:00Z')
        expect(arg.end).toEqualDate('2013-06-29T00:00:00Z')
        expect(arg.timeZone).toBe('UTC')
        expect(typeof callback).toBe('function')
        done()
      },
    })
  })

  it('does not request dates excluded by showNonCurrentDates:false', (done) => {
    initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2013-06-01',
      showNonCurrentDates: false,
      events(arg, callback) {
        expect(arg.start).toEqualDate('2013-06-01T00:00:00Z')
        expect(arg.end).toEqualDate('2013-07-01T00:00:00Z')
        done()
      },
    })
  })

  it('requests a timed range when slotMinTime is negative', (done) => {
    initCalendar({
      initialView: 'timeGridWeek',
      initialDate: '2017-06-08',
      slotMinTime: { hours: -2 },
      events(arg, callback) {
        expect(arg.start).toEqualDate('2017-06-03T22:00:00Z')
        expect(arg.end).toEqualDate('2017-06-11T00:00:00Z')
        done()
      },
    })
  })

  it('requests a timed range when slotMaxTime exceeds 24 hours', (done) => {
    initCalendar({
      initialView: 'timeGridWeek',
      initialDate: '2017-06-08',
      slotMaxTime: '26:00',
      events(arg, callback) {
        expect(arg.start).toEqualDate('2017-06-04T00:00:00Z')
        expect(arg.end).toEqualDate('2017-06-11T02:00:00Z')
        done()
      },
    })
  })

  it('calls loading callback', (done) => {
    let loadingCallArgs = []

    initCalendar({
      loading(bool) {
        loadingCallArgs.push(bool)
      },
      events(arg, callback) {
        setTimeout(() => {
          expect(loadingCallArgs).toEqual([true])
          callback([])
          setTimeout(() => {
            expect(loadingCallArgs).toEqual([true, false])
            done()
          }, 0)
        }, 0)
      },
    })
  })

  it('calls loading callback only once for multiple sources', (done) => {
    let loadingCallArgs = []

    initCalendar({
      loading(bool) {
        loadingCallArgs.push(bool)
      },
      eventSources: [
        (arg, callback) => {
          setTimeout(() => {
            callback([])
          }, 0)
        },
        (arg, callback) => {
          setTimeout(() => {
            callback([])
          }, 10)
        },
      ],
    })

    setTimeout(() => {
      expect(loadingCallArgs).toEqual([true, false])
      done()
    }, 20)
  })
})
