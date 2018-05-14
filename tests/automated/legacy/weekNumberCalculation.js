describe('weekNumberCalculation', function() {

  pushOptions({
    weekNumbers: true
  })

  function getRenderedWeekText() {
    // works for both kinds of views
    return $('.fc-agenda-view .fc-week-number, .fc-week:first .fc-content-skeleton .fc-week-number').text()
  }

  function getRenderedWeekNumber() {
    var text = getRenderedWeekText() || ''
    return parseInt(text.replace(/\D/g, ''), 10)
  }

  [ 'basicDay', 'agendaDay' ].forEach(function(viewType) {
    describe('when in ' + viewType + ' view', function() {
      pushOptions({
        defaultView: viewType
      })

      it('should display the American standard when using \'local\'', function() {
        initCalendar({
          defaultDate: '2013-11-23', // a Saturday
          weekNumberCalculation: 'local'
        })
        expect(getRenderedWeekNumber()).toBe(47)
      })

      it('should display a locale-specific local week number', function() {
        initCalendar({
          defaultDate: '2013-11-23', // a Saturday
          locale: 'ar',
          weekNumberCalculation: 'local'
        })
        expect(getRenderedWeekText()).toMatch(/٤٨|48/)
      })

      // another local test, but to make sure it is different from ISO
      it('should display the American standard when using \'local\'', function() {
        initCalendar({
          defaultDate: '2013-11-17', // a Sunday
          weekNumberCalculation: 'local'
        })
        expect(getRenderedWeekNumber()).toBe(47)
      })

      it('should display ISO standard when using \'ISO\'', function() {
        initCalendar({
          defaultDate: '2013-11-17', // a Sunday
          weekNumberCalculation: 'ISO'
        })
        expect(getRenderedWeekNumber()).toBe(46)
      })

      it('should display the calculated number when a custom function', function() {
        initCalendar({
          weekNumberCalculation: function() {
            return 4
          }
        })
        expect(getRenderedWeekNumber()).toBe(4)
      })
    })
  })
})
