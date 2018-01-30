describe('weekNumberTitle', function() {

  var options

  beforeEach(function() {
    affix('#cal')
    options = {
      weekNumbers: true
    }
  })

  function getRenderedWeekNumberTitle() {
    // works for both kinds of views
    var text = $('th.fc-week-number').text()
    return text.replace(/\d/g, '')
  }

  [ 'basicWeek', 'agendaWeek' ].forEach(function(viewName) {
    describe('when views is ' + viewName, function() {

      beforeEach(function() {
        options.defaultView = viewName
      })

      it('renders correctly by default', function() {
        $('#cal').fullCalendar(options)
        expect(getRenderedWeekNumberTitle()).toBe('W')
      })

      it('renders correctly when unspecified and when locale is customized', function() {
        options.locale = 'es'
        $('#cal').fullCalendar(options)
        expect(getRenderedWeekNumberTitle()).toBe('Sm')
      })

      it('renders correctly when customized and LTR', function() {
        options.isRTL = false
        options.weekNumberTitle = 'YO'
        $('#cal').fullCalendar(options)
        expect(getRenderedWeekNumberTitle()).toBe('YO')
      })

      it('renders correctly when customized and RTL', function() {
        options.isRTL = true
        options.weekNumberTitle = 'YO'
        $('#cal').fullCalendar(options)
        expect(getRenderedWeekNumberTitle()).toBe('YO')
      })
    })
  })
})
