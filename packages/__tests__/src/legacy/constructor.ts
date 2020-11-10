import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('constructor', () => {
  it('should not modify the options object', () => {
    let options = {
      initialView: 'timeGridWeek',
      scrollTime: '09:00:00',
      slotDuration: { minutes: 45 },
    }
    let optionsCopy = $.extend({}, options, true)
    initCalendar(options)
    expect(options).toEqual(optionsCopy)
  })

  it('should not modify the events array', () => {
    let options = {
      initialView: 'dayGridMonth',
      initialDate: '2014-05-27',
      events: [
        {
          title: 'mytitle',
          start: '2014-05-27',
        },
      ],
    }
    let optionsCopy = $.extend(true, {}, options) // recursive copy
    initCalendar(options)
    expect(options).toEqual(optionsCopy)
  })

  it('should not modify the eventSources array', () => {
    let options = {
      initialView: 'dayGridMonth',
      initialDate: '2014-05-27',
      eventSources: [
        { events: [
          {
            title: 'mytitle',
            start: '2014-05-27',
          },
        ] },
      ],
    }
    let optionsCopy = $.extend(true, {}, options) // recursive copy
    initCalendar(options)
    expect(options).toEqual(optionsCopy)
  })

  describe('when called on a div', () => {
    it('should contain a toolbar', () => {
      let calendar = initCalendar()
      let calendarWrapper = new CalendarWrapper(calendar)
      expect(calendarWrapper.toolbar).toBeTruthy()
    })

    it('should contain a view-container el', () => {
      let calendar = initCalendar()
      let calendarWrapper = new CalendarWrapper(calendar)
      expect(calendarWrapper.getViewContainerEl()).toBeTruthy()
    })
  })
})
