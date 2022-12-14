import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('rerenderDelay', () => {
  it('batches together many event renders', (done) => {
    let eventSource1 = [
      { title: 'event1', start: '2016-12-04T01:00:00', className: 'event1' },
      { title: 'event2', start: '2016-12-04T02:00:00', className: 'event2' },
    ]
    let eventSource2 = [
      { title: 'event3', start: '2016-12-04T03:00:00', className: 'event3' },
      { title: 'event4', start: '2016-12-04T04:00:00', className: 'event4' },
    ]
    let extraEvent1 = { title: 'event5', start: '2016-12-04T05:00:00', className: 'event5', id: '5' }
    let extraEvent2 = { title: 'event6', start: '2016-12-04T06:00:00', className: 'event6', id: '6' }

    let calendar = initCalendar({
      initialDate: '2016-12-04',
      initialView: 'timeGridDay',
      events: eventSource1,
      rerenderDelay: 0, // will still debounce despite being zero
    })
    let calendarWrapper = new CalendarWrapper(calendar)

    expect(calendarWrapper.getEventEls().length).toBe(2)

    currentCalendar.addEventSource(eventSource2)
    expect(calendarWrapper.getEventEls().length).toBe(2)

    currentCalendar.addEvent(extraEvent1)
    expect(calendarWrapper.getEventEls().length).toBe(2)

    let refined2 = currentCalendar.addEvent(extraEvent2)
    expect(calendarWrapper.getEventEls().length).toBe(2)

    refined2.remove()
    expect(calendarWrapper.getEventEls().length).toBe(2)

    setTimeout(() => { // after rendered
      expect($('.event1').length).toBe(1)
      expect($('.event2').length).toBe(1)
      expect($('.event3').length).toBe(1)
      expect($('.event4').length).toBe(1)
      expect($('.event5').length).toBe(1)
      expect($('.event6').length).toBe(0) // got removed
      done()
    }, 1)
  })
})
