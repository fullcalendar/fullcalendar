describe('eventTimeFormat', function() {

  pushOptions({
    defaultDate: '2014-06-04',
    events: [ {
      title: 'my event',
      start: '2014-06-04T15:00:00',
      end: '2014-06-04T17:00:00'
    } ]
  })

  function getRenderedEventTime() {
    return $('.fc-event:first .fc-time').text()
  }

  describe('when in month view', function() {

    pushOptions({
      defaultView: 'month'
    })

    it('renders correctly when default', function() {
      initCalendar()
      expect(getRenderedEventTime()).toBe('3p')
    })

    it('renders correctly when default and the locale is customized', function() {
      initCalendar({
        locale: 'en-gb'
      })
      expect(getRenderedEventTime()).toBe('15')
    })

    it('renders correctly when customized', function() {
      initCalendar({
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
      })
      expect(getRenderedEventTime()).toBe('15:00:00')
    })
  })

  describe('when in agendaWeek view', function() {

    pushOptions({
      defaultView: 'agendaWeek'
    })

    it('renders correctly when default', function() {
      initCalendar()
      expect(getRenderedEventTime()).toBe('3:00 - 5:00')
    })

    it('renders correctly when default and the locale is customized', function() {
      initCalendar({
        locale: 'en-gb'
      })
      expect(getRenderedEventTime()).toBe('15:00 - 17:00')
    })

    it('renders correctly when customized', function() {
      initCalendar({
        eventTimeFormat: { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
      })
      expect(getRenderedEventTime()).toBe('15:00:00 - 17:00:00')
    })
  })

  describe('when in multi-day custom basic view', function() {

    pushOptions({
      views: {
        basicTwoDay: {
          type: 'basic',
          duration: { days: 2 }
        }
      },
      defaultView: 'basicTwoDay'
    })

    it('defaults to no end time', function() {
      initCalendar()
      expect(getRenderedEventTime()).toBe('3p')
    })
  })

  describe('when in basicDay view', function() {

    pushOptions({
      defaultView: 'basicDay'
    })


    it('defaults to showing the end time', function() {
      initCalendar()
      expect(getRenderedEventTime()).toBe('3p - 5p')
    })
  })
})
