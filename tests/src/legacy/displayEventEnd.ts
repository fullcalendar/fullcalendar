import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper.js'

describe('displayEventEnd', () => {
  pushOptions({
    initialDate: '2014-06-13',
    timeZone: 'UTC',
    eventTimeFormat: { hour: 'numeric', minute: '2-digit' },
  })

  describeOptions('initialView', {
    'when in month view': 'dayGridMonth',
    'when in week view': 'timeGridWeek',
  }, () => {
    describe('when off', () => {
      pushOptions({
        displayEventEnd: false,
      })

      describe('with an all-day event', () => {
        it('displays no time text', () => {
          let calendar = initCalendar({
            events: [{
              title: 'timed event',
              start: '2014-06-13',
              end: '2014-06-13',
              allDay: true,
            }],
          })
          expectEventTimeText(calendar, '')
        })
      })

      describe('with a timed event with no end time', () => {
        it('displays only the start time text', () => {
          let calendar = initCalendar({
            events: [{
              title: 'timed event',
              start: '2014-06-13T01:00:00',
              allDay: false,
            }],
          })
          expectEventTimeText(calendar, '1:00 AM')
        })
      })

      describe('with a timed event with an end time', () => {
        it('displays only the start time text', () => {
          let calendar = initCalendar({
            events: [{
              title: 'timed event',
              start: '2014-06-13T01:00:00',
              end: '2014-06-13T02:00:00',
              allDay: false,
            }],
          })
          expectEventTimeText(calendar, '1:00 AM')
        })
      })
    })

    describe('when on', () => {
      pushOptions({
        displayEventEnd: true,
      })

      describe('with an all-day event', () => {
        it('displays no time text', () => {
          let calendar = initCalendar({
            events: [{
              title: 'timed event',
              start: '2014-06-13',
              end: '2014-06-13',
              allDay: true,
            }],
          })
          expectEventTimeText(calendar, '')
        })
      })

      describe('with a timed event with no end time', () => {
        it('displays only the start time text', () => {
          let calendar = initCalendar({
            events: [{
              title: 'timed event',
              start: '2014-06-13T01:00:00',
              allDay: false,
            }],
          })
          expectEventTimeText(calendar, '1:00 AM')
        })
      })

      describe('with a timed event given an invalid end time', () => {
        it('displays only the start time text', () => {
          let calendar = initCalendar({
            events: [{
              title: 'timed event',
              start: '2014-06-13T01:00:00',
              end: '2014-06-13T01:00:00',
              allDay: false,
            }],
          })
          expectEventTimeText(calendar, '1:00 AM')
        })
      })

      describe('with a timed event with an end time', () => {
        it('displays both the start and end time text', () => {
          let calendar = initCalendar({
            events: [{
              title: 'timed event',
              start: '2014-06-13T01:00:00',
              end: '2014-06-13T02:00:00',
              allDay: false,
            }],
          })
          expectEventTimeText(calendar, '1:00 AM - 2:00 AM')
        })
      })
    })
  })

  function expectEventTimeText(calendar, timeText) {
    let calendarWrapper = new CalendarWrapper(calendar)
    let eventEl = calendarWrapper.getFirstEventEl()
    let eventInfo = calendarWrapper.getEventElInfo(eventEl)

    expect(eventInfo.timeText).toBe(timeText)
  }
})
