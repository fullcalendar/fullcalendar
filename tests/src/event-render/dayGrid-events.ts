import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper.js'
import { anyElsIntersect } from '../lib/dom-geom.js'
import { filterVisibleEls } from '../lib/dom-misc.js'

describe('dayGrid advanced event rendering', () => {
  pushOptions({
    initialDate: '2020-05-01',
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5408
  it('renders without intersecting', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-05-01',
      events: [
        { start: '2020-05-02', end: '2020-05-04', title: 'event a' },
        { start: '2020-05-02', end: '2020-05-04', title: 'event b' },
        { start: '2020-05-03', end: '2020-05-05', title: 'event c' },
        { start: '2020-05-04', title: 'event d' },
        { start: '2020-05-04', title: 'event e' },
      ],
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()

    expect(anyElsIntersect(eventEls)).toBe(false)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5771
  it('renders more-links correctly when first obscured event is longer than event before it', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-08-01',
      dayMaxEventRows: 3,
      events: [
        { title: 'big1', start: '2020-07-23', end: '2020-07-28' },
        { title: 'small1', start: '2020-07-24', end: '2020-07-27' },
        { title: 'small2', start: '2020-07-24', end: '2020-07-27' },
        { title: 'big2', start: '2020-07-25', end: '2020-07-28' },
      ],
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()
    let visibleEventEls = filterVisibleEls(eventEls)
    let moreLinkEls = dayGridWrapper.getMoreEls()

    expect(visibleEventEls.length).toBe(3)
    expect(moreLinkEls.length).toBe(1)
    expect(anyElsIntersect(visibleEventEls.concat(moreLinkEls))).toBe(false)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5790
  it('positions more-links correctly in columns that have empty space', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-09-01',
      dayMaxEventRows: 4,
      events: [
        { start: '2020-08-30', end: '2020-09-04' },
        { start: '2020-08-31', end: '2020-09-03' },
        { start: '2020-09-01', end: '2020-09-04' },
        { start: '2020-09-02', end: '2020-09-04' },
        { start: '2020-09-02', end: '2020-09-04' },
      ],
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()
    let visibleEventEls = filterVisibleEls(eventEls)
    let moreLinkEls = dayGridWrapper.getMoreEls()

    expect(visibleEventEls.length).toBe(3)
    expect(moreLinkEls.length).toBe(2)
    expect(anyElsIntersect(visibleEventEls.concat(moreLinkEls))).toBe(false)

    expect(Math.abs(
      moreLinkEls[0].getBoundingClientRect().top -
      moreLinkEls[1].getBoundingClientRect().top,
    )).toBeLessThan(1)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5883
  it('it renders without gaps when ordered by title', () => {
    let calendar = initCalendar({
      initialDate: '2020-10-01',
      eventOrder: 'title',
      dayMaxEventRows: 3,
      events: [
        {
          title: 'b1',
          start: '2020-10-20',
          end: '2020-10-22',
        },
        {
          title: 'b2',
          start: '2020-10-21',
          end: '2020-10-22',
        },
        {
          title: 'b3',
          start: '2020-10-20',
          end: '2020-10-23',
        },
        {
          title: 'b4',
          start: '2020-10-20',
          end: '2020-10-23',
        },
      ],
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()
    let visibleEventEls = filterVisibleEls(eventEls)
    let moreLinkEls = dayGridWrapper.getMoreEls()

    expect(visibleEventEls.length).toBe(2)
    expect(moreLinkEls.length).toBe(3)
    expect(anyElsIntersect(visibleEventEls.concat(moreLinkEls))).toBe(false)
  })

  it('won\'t intersect when doing custom rendering', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-06-01',
      events: [
        { start: '2020-06-04', end: '2020-06-08', title: 'event a' },
        { start: '2020-06-05', end: '2020-06-09', title: 'event b' },
        { start: '2020-06-08T12:00:00', title: 'event c' },
      ],
      eventContent(arg) { // creates varying-height events, which revealed the bug
        return {
          html: `
            <b>${arg.timeText}</b>
            <i>${arg.event.title}</i>
          `,
        }
      },
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()

    expect(anyElsIntersect(eventEls)).toBe(false)
  })

  it('renders single-day timed event as list-item', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-05-01',
      eventDisplay: 'auto',
      events: [
        {
          title: 'event 1',
          start: '2020-05-11T22:00:00',
        },
      ],
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]

    expect(dayGridWrapper.isEventListItem(eventEl)).toBe(true)
  })

  it('does not render multi-day event as list-item', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-05-01',
      eventDisplay: 'auto',
      events: [
        {
          title: 'event 1',
          start: '2020-05-11T22:00:00',
          end: '2020-05-12T06:00:00',
        },
      ],
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]

    expect(dayGridWrapper.isEventListItem(eventEl)).toBe(false)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5634
  it('does not render split multi-day event as list-item', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-05-01',
      eventDisplay: 'auto',
      events: [
        {
          title: 'event',
          start: '2020-05-09T12:00:00',
          end: '2020-05-10T12:00:00',
        },
      ],
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()

    expect(eventEls.length).toBe(2)
    expect(dayGridWrapper.isEventListItem(eventEls[0])).toBe(false)
    expect(dayGridWrapper.isEventListItem(eventEls[0])).toBe(false)
  })

  it('render only block when eventDislay:block', () => {
    let calendar = initCalendar({
      eventDisplay: 'block',
      events: [
        { start: '2020-05-02T02:00:00', title: 'event a' },
      ],
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]

    expect(dayGridWrapper.isEventListItem(eventEl)).toBe(false)
  })

  it('adjusts more link when getting bigger then smaller with liquid height', () => {
    const LARGE_HEIGHT = 800
    const SMALL_HEIGHT = 500
    let $container = $(
      `<div style="height:${LARGE_HEIGHT}px"><div></div></div>`,
    ).appendTo('body')

    let calendar = initCalendar({
      height: '100%',
      dayMaxEvents: true, // will cause visible event count to vary
      events: [
        { start: '2020-05-02', end: '2020-05-03', title: 'event a' },
        { start: '2020-05-02', end: '2020-05-03', title: 'event b' },
        { start: '2020-05-02', end: '2020-05-03', title: 'event c' },
        { start: '2020-05-02', end: '2020-05-03', title: 'event d' },
        { start: '2020-05-02', end: '2020-05-03', title: 'event e' },
        { start: '2020-05-02', end: '2020-05-03', title: 'event f' },
      ],
    }, $container.find('div'))

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let origEventCnt = filterVisibleEls(dayGridWrapper.getEventEls()).length

    $container.css('height', SMALL_HEIGHT)
    calendar.updateSize()
    let smallEventCnt = filterVisibleEls(dayGridWrapper.getEventEls()).length
    expect(smallEventCnt).not.toBe(origEventCnt)

    $container.css('height', LARGE_HEIGHT)
    calendar.updateSize()
    let largeEventCnt = filterVisibleEls(dayGridWrapper.getEventEls()).length
    expect(largeEventCnt).toBe(origEventCnt)

    $container.remove()
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5850
  it('does not have JS error when dayMaxEventRows and almost no height', () => {
    initCalendar({
      height: '100%',
      eventDisplay: 'block',
      dayMaxEventRows: true,
      events: [
        { start: '2020-05-02T02:00:00', title: 'event a' },
      ],
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5863
  it('does not have JS error when dayMaxEventRows and almost no height', () => {
    let $container = $('<div style="width:100px" />').appendTo('body')
    initCalendar({
      height: '100%',
      eventDisplay: 'block',
      dayMaxEventRows: true,
      events: [
        { start: '2020-05-02T02:00:00', title: 'event a' },
      ],
    }, $container[0])
    $container.remove()
  })

  it('doesn\'t create more-link while positioning events with temporary unknown dimensions', () => {
    let renderedMoreLink = false
    initCalendar({
      initialView: 'dayGridMonth',
      moreLinkDidMount() {
        renderedMoreLink = true
      },
      events: [
        { id: '1', start: '2020-05-05' },
      ],
    })
    expect(renderedMoreLink).toBe(false)
  })

  it('can render events with strict ordering', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      eventOrder: 'id',
      eventOrderStrict: true,
      events: [
        { id: '1', start: '2020-05-05' },
        { id: '2', start: '2020-05-03', end: '2020-05-08' },
        { id: '3', start: '2020-05-04' },
      ],
      eventDidMount(arg) {
        arg.el.setAttribute('data-event-id', arg.event.id) // TODO: more formal system for this
      },
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()
    let visibleEventEls = filterVisibleEls(eventEls)
    expect(anyElsIntersect(visibleEventEls)).toBe(false)

    let el1 = document.querySelector('[data-event-id="1"]')
    let el2 = document.querySelector('[data-event-id="2"]')
    let el3 = document.querySelector('[data-event-id="3"]')
    let top1 = el1.getBoundingClientRect().top
    let top2 = el2.getBoundingClientRect().top
    let top3 = el3.getBoundingClientRect().top
    expect(top1).toBeLessThan(top2)
    expect(top2).toBeLessThan(top3)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5767
  it('consumes empty gaps in space when strict ordering', () => {
    let calendar = initCalendar({
      initialDate: '2020-08-23',
      initialView: 'dayGridWeek',
      eventOrder: 'title',
      eventOrderStrict: true,
      dayMaxEventRows: 4,
      eventDidMount(arg) {
        arg.el.setAttribute('data-event-id', arg.event.id) // TODO: more formal system for this
      },
      events: [
        {
          title: 'a',
          id: 'a',
          start: '2020-08-24',
          end: '2020-08-27',
        },
        {
          title: 'b',
          id: 'b',
          start: '2020-08-24',
          end: '2020-08-27',
        },
        {
          title: 'c',
          id: 'c',
          start: '2020-08-28',
          end: '2020-08-29',
        },
        {
          title: 'd',
          id: 'd',
          start: '2020-08-24',
          end: '2020-08-29',
        },
        {
          title: 'e',
          id: 'e',
          start: '2020-08-27',
          end: '2020-08-29',
        },
        { // will cause 'e' to hide
          title: 'f',
          id: 'f',
          start: '2020-08-24',
          end: '2020-08-29',
        },
      ],
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()
    let visibleEventEls = filterVisibleEls(eventEls)
    expect(anyElsIntersect(visibleEventEls)).toBe(false)

    let rect0 = document.querySelector('[data-event-id="d"]').getBoundingClientRect()
    let rect1 = document.querySelector('[data-event-id="f"]').getBoundingClientRect()
    expect(rect1.top - rect0.bottom).toBeLessThan(2)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6393
  it('doesn\'t overlap with eventOrderStrict', () => {
    let calendar = initCalendar({
      initialDate: '2021-06-21',
      initialView: 'dayGridWeek',
      eventOrderStrict: true,
      events: [
        {
          title: 'Busy1',
          start: '2021-06-21T10:00:00Z',
          end: '2021-06-21T11:00:00Z',
        },
        {
          title: 'Busy2',
          start: '2021-06-21T08:00:00Z',
          end: '2021-06-21T10:00:00Z',
        },
        {
          title: 'Busy3',
          start: '2021-06-22T11:00:00Z',
          end: '2021-06-22T12:00:00Z',
        },
        {
          title: 'Busy4',
          start: '2021-06-24T08:30:00Z',
          end: '2021-06-24T11:00:00Z',
        },
        {
          title: 'Busy5',
          start: '2021-06-24T16:00:00Z',
          end: '2021-06-24T16:30:00Z',
        },
      ],
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()
    let visibleEventEls = filterVisibleEls(eventEls)
    expect(anyElsIntersect(visibleEventEls)).toBe(false)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6397
  it('doesn\'t show duplicate events in popover when eventOrder by start date', (done) => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2021-07-07',
      eventOrder: 'start',
      dayMaxEventRows: 4,
      events: [
        {
          title: 'Ariana Florescu',
          start: '2021-07-02',
          end: '2021-07-03',
        },
        {
          title: 'Alan Leaclaire',
          start: '2021-07-02',
          end: '2021-07-10',
        },
        {
          title: 'Divya Sundavaridevelu',
          start: '2021-07-05',
          end: '2021-07-06',
        },
        {
          title: 'Phyllis Benoussan',
          start: '2021-07-05',
          end: '2021-07-06',
        },
        {
          title: 'Allison Olsen',
          start: '2021-07-05',
          end: '2021-07-10',
        },
        {
          title: 'Justin Sinnaeve',
          start: '2021-07-05',
          end: '2021-07-10',
        },
        {
          title: 'Sylwia Pitel',
          start: '2021-07-07',
          end: '2021-07-08',
        },
        {
          title: 'Derrick Leach',
          start: '2021-07-07',
          end: '2021-07-10',
        },
        {
          title: 'Sebastien Pillon',
          start: '2021-07-08',
          end: '2021-07-13',
        },
        {
          title: 'Nishat Ayub',
          start: '2021-07-08',
          end: '2021-07-10',
        },
        {
          title: 'Ognjen Stoisavljevic',
          start: '2021-07-09',
          end: '2021-07-10',
        },
        {
          title: 'Slobodan Stojanovic',
          start: '2021-07-09',
          end: '2021-07-10',
        },
        {
          title: 'Phyllis Benoussan',
          start: '2021-07-09',
          end: '2021-07-10',
        },
      ],
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    dayGridWrapper.openMorePopover(4) // on July 9th
    setTimeout(() => {
      let eventEls = dayGridWrapper.getMorePopoverEventEls()
      expect(eventEls.length).toBe(9)
      done()
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/7447
  it('Doesn\'t error or overlap event positions when white-space:normal', () => {
    let calendar = initCalendar({
      initialView: 'dayGridWeek',
      initialDate: '2023-04-09',
      dayMaxEvents: 4,
      eventContent() {
        return {
          html: '<div style="white-space: normal">' +
            '<strong>AAAAAAAAAA</strong> <strong>BBBBBBBBB</strong></div>',
        }
      },
      events: [
        {
          id: 'a',
          start: '2023-04-14',
          end: '2023-04-21',
        },
        {
          id: 'b',
          start: '2023-04-13',
          end: '2023-04-22',
        },
        {
          id: 'c',
          start: '2023-04-06',
          end: '2023-04-15',
        },
        {
          id: 'd',
          start: '2023-04-11',
          end: '2023-04-14',
        },
        {
          id: 'e',
          start: '2023-04-14',
          end: '2023-04-19',
        },
        {
          id: 'f',
          start: '2023-04-13',
          end: '2023-04-19',
        },
        {
          id: 'g',
          start: '2023-04-05',
          end: '2023-04-14',
        },
        {
          id: 'h',
          start: '2023-04-06',
          end: '2023-04-15',
        },
        {
          id: 'i',
          start: '2023-04-13',
          end: '2023-04-15',
        },
        {
          id: 'j',
          start: '2023-04-12',
          end: '2023-04-15',
        },
      ],
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()
    let visibleEventEls = filterVisibleEls(eventEls)
    expect(anyElsIntersect(visibleEventEls)).toBe(false)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6486
  it('renders events starting yesterday, ending at midnight, as "past"', () => {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2023-04-09', // "today"
      now: '2023-04-09', // "today"
      events: [{
        start: '2023-04-08', // yesterday
        allDay: true,
      }],
    })
    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()

    expect(eventEls[0]).toHaveClass('fc-event-past')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/7462
  it('Cannot infinitely recurse with dayMaxEventRows and many hidden event rows', () => {
    initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2023-09-01',
      dayMaxEventRows: 6,
      events: [
        {
          start: '2023-09-28T00:00:00',
          end: '2023-10-01T00:00:00',
        },
        {
          start: '2023-09-26T00:00:00',
          end: '2023-09-27T00:00:00',
        },
        {
          start: '2023-09-20T17:00:00',
          end: '2023-09-27T17:00:00',
        },
        {
          start: '2023-09-21T16:00:00',
          end: '2023-09-25T14:00:00',
        },
        {
          start: '2023-09-21T16:00:00',
          end: '2023-09-25T11:00:00',
        },
        {
          start: '2023-09-28T10:00:00',
          end: '2023-09-28T15:00:00',
        },
        {
          start: '2023-09-27T08:00:00',
          end: '2023-10-04T18:00:00',
        },
        {
          start: '2023-09-20T13:00:00',
          end: '2023-09-29T12:00:00',
        },
        {
          start: '2023-09-20T12:00:00',
          end: '2023-09-29T12:00:00',
        },
        {
          start: '2023-09-27T11:00:00',
          end: '2023-09-28T18:00:00',
        },
        {
          start: '2023-03-29T23:00:00',
          end: '2024-03-29T22:00:00',
        },
        {
          start: '2023-09-25T02:00:00',
          end: '2023-09-29T12:00:00',
        },
        {
          start: '2023-09-22T14:00:00',
          end: '2023-09-29T12:00:00',
        },
        {
          start: '2023-09-22T14:00:00',
          end: '2023-09-28T12:00:00',
        },
        {
          start: '2023-09-19T13:00:00',
          end: '2023-09-30T13:00:00',
        },
      ],
    })
  })

  it('will limit events to dayMaxEventRows:1', () => {
    const calendar = initCalendar({
      initialDate: '2021-10-31',
      dayMaxEventRows: 1,
      events: [
        { title: 'A', start:'2021-10-31', end:'2021-11-02' },
        { title: 'B', start:'2021-10-29', end:'2021-11-02' },
        { title: 'C', start:'2021-10-28 12:00:00', end:'2021-10-31 12:00:00' },
      ],
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let visibleEventEls = filterVisibleEls(dayGridWrapper.getEventEls())
    let moreEls = dayGridWrapper.getMoreEls()
    let allEls = [...visibleEventEls, ...moreEls]
    let offsetTopHash = {}

    for (let el of allEls) {
      offsetTopHash[Math.round(el.getBoundingClientRect().top)] = true
    }

    // two weeks, two distinct lines of events (one per week)
    expect(Object.keys(offsetTopHash).length).toBe(2)
  })
})
