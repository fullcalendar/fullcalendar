import { EventInput } from '@fullcalendar/core'
import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('removeEvents', () => {
  pushOptions({
    initialDate: '2014-06-24',
    initialView: 'dayGridMonth',
  })

  function buildEventsWithoutIds(): EventInput[] {
    return [
      { title: 'event zero', start: '2014-06-24', className: 'event-zero' },
      { title: 'event one', start: '2014-06-24', className: 'event-non-zero event-one' },
      { title: 'event two', start: '2014-06-24', className: 'event-non-zero event-two' },
    ]
  }

  function buildEventsWithIds() {
    let events = buildEventsWithoutIds()
    let i

    for (i = 0; i < events.length; i += 1) {
      events[i].id = i
    }

    return events
  }

  $.each({
    'when events without IDs': buildEventsWithoutIds,
    'when events with IDs': buildEventsWithIds,
  }, (desc, eventGenerator) => {
    describe(desc, () => {
      it('can remove all events if no args specified', (done) => {
        go(
          eventGenerator(),
          () => {
            currentCalendar.removeAllEvents()
          },
          () => {
            expect(currentCalendar.getEvents().length).toEqual(0)
            let calendarWrapper = new CalendarWrapper(currentCalendar)
            expect(calendarWrapper.getEventEls().length).toEqual(0)
          },
          done,
        )
      })

      it('can remove events individually', (done) => {
        go(
          eventGenerator(),
          () => {
            currentCalendar.getEvents().forEach((event) => {
              if ($.inArray('event-one', event.classNames) !== -1) {
                event.remove()
              }
            })
          },
          () => {
            expect(currentCalendar.getEvents().length).toEqual(2)
            let calendarWrapper = new CalendarWrapper(currentCalendar)
            expect(calendarWrapper.getEventEls().length).toEqual(2)
            expect($('.event-zero').length).toEqual(1)
            expect($('.event-two').length).toEqual(1)
          },
          done,
        )
      })
    })
  })

  it('can remove events with a numeric ID', (done) => {
    go(
      buildEventsWithIds(),
      () => {
        currentCalendar.getEventById(1 as any).remove()
      },
      () => {
        expect(currentCalendar.getEvents().length).toEqual(2)
        let calendarWrapper = new CalendarWrapper(currentCalendar)
        expect(calendarWrapper.getEventEls().length).toEqual(2)
        expect($('.event-zero').length).toEqual(1)
        expect($('.event-two').length).toEqual(1)
      },
      done,
    )
  })

  it('can remove events with a string ID', (done) => {
    go(
      buildEventsWithIds(),
      () => {
        currentCalendar.getEventById('1').remove()
      },
      () => {
        expect(currentCalendar.getEvents().length).toEqual(2)
        let calendarWrapper = new CalendarWrapper(currentCalendar)
        expect(calendarWrapper.getEventEls().length).toEqual(2)
        expect($('.event-zero').length).toEqual(1)
        expect($('.event-two').length).toEqual(1)
      },
      done,
    )
  })

  it('can remove an event with ID 0', (done) => { // for issue 2082
    go(
      buildEventsWithIds(),
      () => {
        currentCalendar.getEventById(0 as any).remove()
      },
      () => {
        expect(currentCalendar.getEvents().length).toEqual(2)
        let calendarWrapper = new CalendarWrapper(currentCalendar)
        expect(calendarWrapper.getEventEls().length).toEqual(2)
        expect($('.event-zero').length).toEqual(0)
        expect($('.event-non-zero').length).toEqual(2)
      },
      done,
    )
  })

  // Verifies the actions in removeFunc executed correctly by calling checkFunc.
  function go(events, removeFunc, checkFunc, doneFunc) {
    initCalendar({
      events,
    })

    checkAllEvents() // make sure all events initially rendered correctly
    removeFunc() // remove the events
    setTimeout(() => { // because the event rerender will be queued because we're a level deep
      checkFunc() // check correctness

      // move the calendar back out of view, then back in
      currentCalendar.next()
      currentCalendar.prev()

      // array event sources should maintain the same state
      // whereas "dynamic" event sources should refetch and reset the state
      if ($.isArray(events)) {
        checkFunc() // for issue 2187
      } else {
        checkAllEvents()
      }

      doneFunc()
    }, 0)
  }

  // Checks to make sure all events have been rendered and that the calendar
  // has internal info on all the events.
  function checkAllEvents() {
    expect(currentCalendar.getEvents().length).toEqual(3)
    let calendarWrapper = new CalendarWrapper(currentCalendar)
    expect(calendarWrapper.getEventEls().length).toEqual(3)
  }
})
