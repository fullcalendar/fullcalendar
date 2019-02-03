import { getEventEls } from '../event-render/EventRenderUtils'

describe('nextDayThreshold', function() {

  // when a view object exposes its nextDayThreshold value (after some refactoring)...
  //   TODO: detect the default of 9am
  //   TODO: detect 2 or more different types of Duration-ish parsing

  it('renders an event before the threshold', function() {
    initCalendar({
      nextDayThreshold: '10:00:00',
      defaultDate: '2014-06',
      defaultView: 'dayGridMonth',
      events: [
        {
          title: 'event1',
          start: '2014-06-08T22:00:00',
          end: '2014-06-10T09:00:00'
        }
      ]
    })
    expect(renderedDayCount()).toBe(2)
  })

  it('renders an event equal to the threshold', function() {
    initCalendar({
      nextDayThreshold: '10:00:00',
      defaultDate: '2014-06',
      defaultView: 'dayGridMonth',
      events: [
        {
          title: 'event1',
          start: '2014-06-08T22:00:00',
          end: '2014-06-10T10:00:00'
        }
      ]
    })
    expect(renderedDayCount()).toBe(3)
  })

  it('renders an event after the threshold', function() {
    initCalendar({
      nextDayThreshold: '10:00:00',
      defaultDate: '2014-06',
      defaultView: 'dayGridMonth',
      events: [
        {
          title: 'event1',
          start: '2014-06-08T22:00:00',
          end: '2014-06-10T11:00:00'
        }
      ]
    })
    expect(renderedDayCount()).toBe(3)
  })

  it('won\'t render an event that ends before the first day\'s threshold', function() {
    initCalendar({
      defaultView: 'dayGridMonth',
      defaultDate: '2017-10-01',
      nextDayThreshold: '09:00:00',
      events: [ {
        start: '2017-09-30T08:00:00',
        end: '2017-10-01T08:00:00'
      } ]
    })

    expect(getEventEls().length).toBe(0)
  })


  function renderedDayCount() { // assumes only one event on the calendar
    var cellWidth = $('.fc-sun').outerWidth() // works with dayGrid and timeGrid
    var totalWidth = 0
    $('.fc-event').each(function() {
      totalWidth += $(this).outerWidth()
    })
    return Math.round(totalWidth / cellWidth)
  }

})
