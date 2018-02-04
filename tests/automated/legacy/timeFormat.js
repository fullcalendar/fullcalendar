describe('timeFormat', function() {

  var options

  beforeEach(function() {
    affix('#cal')
    options = {
      defaultDate: '2014-06-04',
      events: [ {
        title: 'my event',
        start: '2014-06-04T15:00:00',
        end: '2014-06-04T17:00:00'
      } ]
    }
  })

  function getRenderedEventTime() {
    return $('.fc-event:first .fc-time').text()
  }

  describe('when in month view', function() {

    beforeEach(function() {
      options.defaultView = 'month'
    })

    it('renders correctly when default', function() {
      $('#cal').fullCalendar(options)
      expect(getRenderedEventTime()).toBe('3p')
    })

    it('renders correctly when default and the locale is customized', function() {
      options.locale = 'en-gb'
      $('#cal').fullCalendar(options)
      expect(getRenderedEventTime()).toBe('15')
    })

    it('renders correctly when customized', function() {
      options.timeFormat = 'Hh:mm:mm'
      $('#cal').fullCalendar(options)
      expect(getRenderedEventTime()).toBe('153:00:00')
    })
  })

  describe('when in agendaWeek view', function() {

    beforeEach(function() {
      options.defaultView = 'agendaWeek'
    })

    it('renders correctly when default', function() {
      $('#cal').fullCalendar(options)
      expect(getRenderedEventTime()).toBe('3:00 - 5:00')
    })

    it('renders correctly when default and the locale is customized', function() {
      options.locale = 'en-gb'
      $('#cal').fullCalendar(options)
      expect(getRenderedEventTime()).toBe('15:00 - 17:00')
    })

    it('renders correctly when customized', function() {
      options.timeFormat = 'Hh:mm:mm'
      $('#cal').fullCalendar(options)
      expect(getRenderedEventTime()).toBe('153:00:00 - 175:00:00')
    })
  })

  describe('when in multi-day custom basic view', function() {

    beforeEach(function() {
      options.views = {
        basicTwoDay: {
          type: 'basic',
          duration: { days: 2 }
        }
      }
      options.defaultView = 'basicTwoDay'
    })

    it('defaults to no end time', function() {
      $('#cal').fullCalendar(options)
      expect(getRenderedEventTime()).toBe('3p')
    })
  })

  describe('when in basicDay view', function() {

    beforeEach(function() {
      options.defaultView = 'basicDay'
    })

    it('defaults to showing the end time', function() {
      $('#cal').fullCalendar(options)
      expect(getRenderedEventTime()).toBe('3p - 5p')
    })
  })
})
