import { CalendarWrapper } from '../lib/wrappers/CalendarWrapper'

describe('TimeGrid event rendering', () => {
  pushOptions({
    initialDate: '2014-08-23',
    initialView: 'timeGridWeek',
    scrollTime: '00:00:00',
  })

  it('renders the start and end time of an event that spans only 1 day', () => {
    let calendar = initCalendar({
      events: [{
        title: 'event1',
        start: '2014-08-18T02:00:00',
        end: '2014-08-18T22:00:00',
      }],
    })

    let calendarWrapper = new CalendarWrapper(calendar)
    let eventEl = calendarWrapper.getFirstEventEl()
    let eventText = calendarWrapper.getEventElInfo(eventEl).timeText

    expect(eventText).toBe('2:00 - 10:00')
  })

  it('renders time to/from midnight for an event that spans two days', () => {
    let calendar = initCalendar({
      events: [{
        title: 'event1',
        start: '2014-08-18T02:00:00',
        end: '2014-08-19T22:00:00',
      }],
    })

    let calendarWrapper = new CalendarWrapper(calendar)
    let eventEls = calendarWrapper.getEventEls()
    let eventText0 = calendarWrapper.getEventElInfo(eventEls[0]).timeText
    let eventText1 = calendarWrapper.getEventElInfo(eventEls[1]).timeText

    expect(eventText0).toBe('2:00 - 12:00')
    expect(eventText1).toBe('12:00 - 10:00')
  })

  it('renders no time on an event segment that spans through an entire day', () => {
    let calendar = initCalendar({
      events: [{
        title: 'event1',
        start: '2014-08-18T02:00:00',
        end: '2014-08-20T22:00:00',
      }],
    })

    let calendarWrapper = new CalendarWrapper(calendar)
    let eventEls = calendarWrapper.getEventEls()
    let eventText1 = calendarWrapper.getEventElInfo(eventEls[1]).timeText

    expect(eventText1).toBe('')
  })

  it('renders an event with no url with no <a> href', () => {
    let calendar = initCalendar({
      events: [{
        title: 'event1',
        start: '2014-08-18T02:00:00',
      }],
    })

    let calendarWrapper = new CalendarWrapper(calendar)
    let eventEl = calendarWrapper.getFirstEventEl()

    expect(eventEl).not.toHaveAttr('href')
  })

  it('renders an event with a url with an <a> href', () => {
    let calendar = initCalendar({
      events: [{
        title: 'event1',
        start: '2014-08-18T02:00:00',
        url: 'http://google.com/',
      }],
    })

    let calendarWrapper = new CalendarWrapper(calendar)
    let eventEl = calendarWrapper.getFirstEventEl()

    expect(eventEl).toHaveAttr('href')
  })
})
