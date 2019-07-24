describe('weekViewRender', function() {

  var nowStr = '2018-05-28'

  pushOptions({
    now: nowStr,
    defaultView: 'timeGridWeek'
  })

  describe('verify th class for today', function() {

    it('should have fc-today class only on "today"', function() {
      initCalendar()
      var foundToday = false

      $('th.fc-day-header', currentCalendar.el).each(function(i, headerNode) {
        var headerEl = $(headerNode)
        var dateMatchesToday = headerEl.data('date') === nowStr
        var hasTodayClass = headerEl.hasClass('fc-today')

        expect(dateMatchesToday).toBe(hasTodayClass)

        if (hasTodayClass) {
          foundToday = true
        }
      })

      expect(foundToday).toBe(true)
    })
  })
})
