
describe('gotoDate', function() {

  it('will update calendar\'s date even if no navigation', function() {
    initCalendar({
      defaultDate: '2018-12-25',
      defaultView: 'dayGridMonth'
    })

    expect(currentCalendar.getDate()).toEqualDate('2018-12-25')
    currentCalendar.gotoDate('2018-12-30')
    expect(currentCalendar.getDate()).toEqualDate('2018-12-30')
  })

  describe('when asynchronicity', function() {
    pushOptions({
      events: function(arg, callback) {
        setTimeout(function() {
          callback([])
        }, 0)
      }
    })

    it('works when called right after initialization', function() {
      initCalendar({
        defaultView: 'dayGridMonth',
        defaultDate: '2017-03-30'
      })
      currentCalendar.gotoDate('2017-06-01')
    })

    it('works when called right after initialization when date already in range', function() {
      initCalendar({
        defaultView: 'dayGridMonth',
        defaultDate: '2017-03-30'
      })
      currentCalendar.gotoDate('2017-03-01')
    })
  })
})
