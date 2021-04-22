import { TimeGridViewWrapper } from '../lib/wrappers/TimeGridViewWrapper'
import { anyElsObscured } from '../lib/dom-geom'

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
  it('renders without intersecting when sorted by title', () => {
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
})
