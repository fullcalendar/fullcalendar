describe('weekLabel', function() {

  pushOptions({
    weekNumbers: true
  })

  function getRenderedWeekNumberTitle() {
    // works for both kinds of views
    var text = $('th.fc-week-number').text()
    return text.replace(/\d/g, '').trim()
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
          isRtl: false,
          weekLabel: 'YO'
        })
        expect(getRenderedWeekNumberTitle()).toBe('YO')
      })

      it('renders correctly when customized and RTL', function() {
        initCalendar({
          isRtl: true,
          weekLabel: 'YO'
        })
        expect(getRenderedWeekNumberTitle()).toBe('YO')
      })
    })
  })
})
