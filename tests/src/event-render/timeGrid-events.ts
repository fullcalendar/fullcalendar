import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper.js'
import { anyElsObscured } from '../lib/dom-geom.js'

describe('timeGrid event rendering', () => {
  // https://github.com/fullcalendar/fullcalendar/issues/6019
  it('renders without intersecting when sorted by title', () => {
    let calendar = initCalendar({
      initialView: 'timeGridWeek',
      initialDate: '2020-12-15',
      scrollTime: '05:00',
      eventOrder: 'title,-allDay,start,-duration',
      slotEventOverlap: false,
      events: [
        {
          title: 'a',
          start: '2020-12-15 15:00:00',
          end: '2020-12-15 18:00:00',
        },
        {
          title: 'b',
          start: '2020-12-15 05:00:00',
          end: '2020-12-15 08:00:00',
        },
        {
          title: 'c',
          start: '2020-12-15 09:00:00',
          end: '2020-12-15 12:00:00',
        },
        {
          title: 'd',
          start: '2020-12-15 05:00:00',
          end: '2020-12-15 09:00:00',
        },
        {
          title: 'e',
          start: '2020-12-15 05:00:00',
          end: '2020-12-15 08:00:00',
        },
        {
          color: 'red',
          title: 'f',
          start: '2020-12-15 08:00:00',
          end: '2020-12-15 12:00:00',
        },
        {
          title: 'g',
          start: '2020-12-15 08:00:00',
          end: '2020-12-15 17:30:00',
        },
      ],
    })

    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    let eventEls = timeGridWrapper.getEventEls()
    let obscured = anyElsObscured(eventEls)

    expect(obscured).toBe(false)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/2758
  it('renders without intersecting for certain arrangement', () => {
    let calendar = initCalendar({
      initialDate: '2015-04-22',
      initialView: 'timeGridDay',
      scrollTime: '09:00',
      slotEventOverlap: false,
      editable: true,
      events: [
        {
          title: 'A',
          start: '2015-04-22 10:00:00',
          end: '2015-04-22 13:00:00',
        },
        {
          title: 'B',
          start: '2015-04-22 13:00:00',
          end: '2015-04-22 13:30:00',
        },
        {
          title: 'C',
          start: '2015-04-22 10:00:00',
          end: '2015-04-22 11:00:00',
        },
        {
          title: 'D',
          start: '2015-04-22 22:00:00',
          end: '2015-04-22 23:00:00',
        },
        {
          title: 'E',
          start: '2015-04-22 10:00:00',
          end: '2015-04-22 14:00:00',
        },
        {
          title: 'F',
          start: '2015-04-22 14:00:00',
          end: '2015-04-22 15:30:00',
        },
        {
          title: 'G',
          start: '2015-04-22 22:00:00',
          end: '2015-04-22 23:00:00',
        },
        {
          title: 'H',
          start: '2015-04-22 22:00:00',
          end: '2015-04-22 23:00:00',
        },
        {
          title: 'I',
          start: '2015-04-22 15:00:00',
          end: '2015-04-22 23:30:00',
        },
        {
          title: 'J',
          start: '2015-04-22 10:00:00',
          end: '2015-04-22 15:30:00',
        },
        {
          title: 'K',
          start: '2015-04-22 22:00:00',
          end: '2015-04-22 23:00:00',
        },
        {
          title: 'L',
          start: '2015-04-22 12:00:00',
          end: '2015-04-22 15:00:00',
        },
      ],
    })

    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    let eventEls = timeGridWrapper.getEventEls()
    let obscured = anyElsObscured(eventEls)

    expect(obscured).toBe(false)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5004
  it('renders event widths somewhat equally', () => {
    let calendar = initCalendar({
      initialView: 'timeGridDay',
      initialDate: '2019-08-01',
      slotDuration: '00:15:00',
      slotEventOverlap: false,
      events: [
        { start: '2019-08-01 08:00', end: '2019-08-01 09:00' },
        { start: '2019-08-01 08:00', end: '2019-08-01 09:00' },
        { start: '2019-08-01 08:30', end: '2019-08-01 09:30' },
        { start: '2019-08-01 09:00', end: '2019-08-01 10:00' },
        { start: '2019-08-01 09:00', end: '2019-08-01 10:00' },
        { start: '2019-08-01 09:30', end: '2019-08-01 10:30' },
        { start: '2019-08-01 09:30', end: '2019-08-01 10:30' },
        { start: '2019-08-01 10:00', end: '2019-08-01 11:00' },
        { start: '2019-08-01 10:00', end: '2019-08-01 11:00' },
        { start: '2019-08-01 10:00', end: '2019-08-01 11:00' },
        { start: '2019-08-01 10:00', end: '2019-08-01 11:00' },
        { start: '2019-08-01 10:00', end: '2019-08-01 11:00' },
        { start: '2019-08-01 10:00', end: '2019-08-01 11:00' },
        { start: '2019-08-01 10:00', end: '2019-08-01 11:00' },
      ],
    })
    let timeGridWrapper = new TimeGridViewWrapper(calendar).timeGrid
    let eventEls = timeGridWrapper.getEventEls()
    let eventWidths = eventEls.map((eventEl) => eventEl.getBoundingClientRect().width)
    eventWidths.sort() // sorts highest to lowest
    eventWidths.splice(0, 1) // remove first item, which is exceptionally wide event
    expect(Math.abs(eventWidths[0] - eventWidths[eventWidths.length - 1])).toBeLessThan(1)
  })
})
