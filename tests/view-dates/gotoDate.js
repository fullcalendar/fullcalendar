
describe('gotoDate', function() {

  describe('when asynchronicity', function() {
    pushOptions({
      events: function(start, end, timezone, callback) {
        setTimeout(function() {
          callback([])
        }, 0)
      }
    })

    it('works when called right after initialization', function() {
      initCalendar({
        defaultView: 'month',
        defaultDate: '2017-03-30'
      })
      currentCalendar.gotoDate('2017-06-01')
    })

    it('works when called right after initialization when date already in range', function() {
      initCalendar({
        defaultView: 'month',
        defaultDate: '2017-03-30'
      })
      currentCalendar.gotoDate('2017-03-01')
    })
  })
})
