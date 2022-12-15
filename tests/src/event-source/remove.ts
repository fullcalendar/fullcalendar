import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('event source remove', () => {
  pushOptions({
    initialDate: '2014-08-01',
  })

  it('correctly removes events provided via `eventSources` at initialization', () => {
    let calendar = initCalendar({
      eventSources: [{
        id: '5',
        events: [
          { title: 'event1', start: '2014-08-01' },
          { title: 'event2', start: '2014-08-02' },
        ],
      }],
    })
    let calendarWrapper = new CalendarWrapper(calendar)

    expect(calendar.getEvents().length).toBe(2)
    expect(calendarWrapper.getEventEls().length).toBe(2)

    calendar.getEventSourceById('5').remove()

    expect(calendar.getEvents().length).toBe(0)
    expect(calendarWrapper.getEventEls().length).toBe(0)
  })

  it('won\'t render removed events when subsequent addEventSource', (done) => {
    let source1 = {
      id: '1',
      events(arg, callback) {
        setTimeout(() => {
          callback([{
            title: 'event1',
            className: 'event1',
            start: '2014-08-01T02:00:00',
          }])
        }, 100)
      },
    }

    let source2 = {
      id: '2',
      events(arg, callback) {
        setTimeout(() => {
          callback([{
            title: 'event2',
            className: 'event2',
            start: '2014-08-01T02:00:00',
          }])
        }, 100)
      },
    }

    let calendar = initCalendar({
      eventSources: [source1],
    })

    calendar.getEventSourceById('1').remove()
    calendar.addEventSource(source2)

    setTimeout(() => {
      expect($('.event1').length).toBe(0)
      expect($('.event2').length).toBe(1)
      done()
    }, 101)
  })
})
