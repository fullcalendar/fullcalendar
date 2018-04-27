describe('weekNumberTitle', function() {

  pushOptions({
    weekNumbers: true
  })

  function getRenderedWeekNumberTitle() {
    // works for both kinds of views
    var text = $('th.fc-week-number').text()
    return text.replace(/\d/g, '')
  }

  [ 'basicWeek', 'agendaWeek' ].forEach(function(viewName) {
    describe('when views is ' + viewName, function() {

      pushOptions({
        defaultView: viewName
      })

      it('renders correctly by default', function() {
        initCalendar()
        expect(getRenderedWeekNumberTitle()).toBe('W')
      })

      it('renders correctly when unspecified and when locale is customized', function() {
        initCalendar({
          locale: 'es'
        })
        expect(getRenderedWeekNumberTitle()).toBe('Sm')
      })

      it('renders correctly when customized and LTR', function() {
        initCalendar({
          isRTL: false,
          weekNumberTitle: 'YO'
        })
        expect(getRenderedWeekNumberTitle()).toBe('YO')
      })

      it('renders correctly when customized and RTL', function() {
        initCalendar({
          isRTL: true,
          weekNumberTitle: 'YO'
        })
        expect(getRenderedWeekNumberTitle()).toBe('YO')
      })
    })
  })
})
