import enGbLocale from '@fullcalendar/core/locales/en-gb'

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
      defaultView: 'dayGridMonth'
    })

    it('renders correctly when default', function() {
      initCalendar()
      expect(getRenderedEventTime()).toBe('3p')
    })

    it('renders correctly when default and the locale is customized', function() {
      initCalendar({
        locale: enGbLocale
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

  describe('when in week view', function() {

    pushOptions({
      defaultView: 'timeGridWeek'
    })

    it('renders correctly when default', function() {
      initCalendar()
      expect(getRenderedEventTime()).toBe('3:00 - 5:00')
    })

    it('renders correctly when default and the locale is customized', function() {
      initCalendar({
        locale: enGbLocale
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

  describe('when in multi-day custom dayGrid view', function() {

    pushOptions({
      views: {
        dayGridTwoDay: {
          type: 'dayGrid',
          duration: { days: 2 }
        }
      },
      defaultView: 'dayGridTwoDay'
    })

    it('defaults to no end time', function() {
      initCalendar()
      expect(getRenderedEventTime()).toBe('3p')
    })
  })

  describe('when in dayGridDay view', function() {

    pushOptions({
      defaultView: 'dayGridDay'
    })


    it('defaults to showing the end time', function() {
      initCalendar()
      expect(getRenderedEventTime()).toBe('3p - 5p')
    })
  })
})
