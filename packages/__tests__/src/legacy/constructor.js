import CalendarWrapper from "../lib/wrappers/CalendarWrapper"

describe('constructor', function() {

  it('should not modify the options object', function() {
    var options = {
      initialView: 'timeGridWeek',
      scrollTime: '09:00:00',
      slotDuration: { minutes: 45 }
    }
    var optionsCopy = $.extend({}, options, true)
    initCalendar(options)
    expect(options).toEqual(optionsCopy)
  })

  it('should not modify the events array', function() {
    var options = {
      initialView: 'dayGridMonth',
      initialDate: '2014-05-27',
      events: [
        {
          title: 'mytitle',
          start: '2014-05-27'
        }
      ]
    }
    var optionsCopy = $.extend(true, {}, options) // recursive copy
    initCalendar(options)
    expect(options).toEqual(optionsCopy)
  })

  it('should not modify the eventSources array', function() {
    var options = {
      initialView: 'dayGridMonth',
      initialDate: '2014-05-27',
      eventSources: [
        { events: [
          {
            title: 'mytitle',
            start: '2014-05-27'
          }
        ] }
      ]
    }
    var optionsCopy = $.extend(true, {}, options) // recursive copy
    initCalendar(options)
    expect(options).toEqual(optionsCopy)
  })

  describe('when called on a div', function() {

    it('should contain a toolbar', function() {
      let calendar = initCalendar()
      let calendarWrapper = new CalendarWrapper(calendar)
      expect(calendarWrapper.toolbar).toBeTruthy()
    })

    it('should contain a view-container el', function() {
      let calendar = initCalendar()
      let calendarWrapper = new CalendarWrapper(calendar)
      expect(calendarWrapper.getViewContainerEl()).toBeTruthy()
    })
  })
})
