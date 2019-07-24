import esLocale from '@fullcalendar/core/locales/es'

describe('weekLabel', function() {

  pushOptions({
    weekNumbers: true
  })

  function getRenderedWeekNumberTitle() {
    // works for both kinds of views
    var text = $('th.fc-week-number').text()
    return text.replace(/\d/g, '').trim()
  }

  [ 'dayGridWeek', 'timeGridWeek' ].forEach(function(viewName) {
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
          locale: esLocale
        })
        expect(getRenderedWeekNumberTitle()).toBe('Sm')
      })

      it('renders correctly when customized and LTR', function() {
        initCalendar({
          dir: 'ltr',
          weekLabel: 'YO'
        })
        expect(getRenderedWeekNumberTitle()).toBe('YO')
      })

      it('renders correctly when customized and RTL', function() {
        initCalendar({
          dir: 'rtl',
          weekLabel: 'YO'
        })
        expect(getRenderedWeekNumberTitle()).toBe('YO')
      })
    })
  })
})
