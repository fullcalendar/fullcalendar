import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('addEventSource', () => {
  let eventArray = [
    { id: '0', title: 'event zero', start: '2014-06-24', className: 'event-zero' },
    { id: '1', title: 'event one', start: '2014-06-24', className: 'event-non-zero event-one' },
    { id: '2', title: 'event two', start: '2014-06-24', className: 'event-non-zero event-two' },
  ]

  pushOptions({
    initialDate: '2014-06-24',
    initialView: 'dayGridMonth',
  })

  it('correctly adds an array source', (done) => {
    go(
      (calendar) => {
        calendar.addEventSource(eventArray)
      },
      null,
      done,
    )
  })

  it('correctly adds a function source', (done) => {
    go(
      (calendar) => {
        calendar.addEventSource((arg, callback) => {
          callback(eventArray)
        })
      },
      null,
      done,
    )
  })

  it('correctly adds an extended array source', (done) => {
    go(
      (calendar) => {
        calendar.addEventSource({
          className: 'arraysource',
          events: eventArray,
        })
      },
      () => {
        expect($('.arraysource').length).toEqual(3)
      },
      done,
    )
  })

  it('correctly adds an extended func source', (done) => {
    go(
      (calendar) => {
        calendar.addEventSource({
          className: 'funcsource',
          events(arg, callback) {
            callback(eventArray)
          },
        })
      },
      () => {
        expect($('.funcsource').length).toEqual(3)
      },
      done,
    )
  })

  function go(addFunc, extraTestFunc, doneFunc) {
    let calendar = initCalendar()
    addFunc(calendar)

    checkAllEvents(calendar)
    if (extraTestFunc) {
      extraTestFunc()
    }

    // move the calendar back out of view, then back in (for issue 2191)
    calendar.next()
    calendar.prev()

    // otherwise, prev/next would be cancelled out by doneFunc's calendar destroy
    setTimeout(() => {
      checkAllEvents(calendar)
      if (extraTestFunc) {
        extraTestFunc()
      }

      doneFunc()
    }, 0)
  }

  // Checks to make sure all events have been rendered and that the calendar
  // has internal info on all the events.
  function checkAllEvents(calendar) {
    expect(calendar.getEvents().length).toEqual(3)

    let calendarWrapper = new CalendarWrapper(calendar)
    expect(calendarWrapper.getEventEls().length).toEqual(3)
  }
})
