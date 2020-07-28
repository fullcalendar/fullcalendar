import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { anyElsIntersect } from '../lib/dom-geom'
import { filterVisibleEls } from '../lib/dom-misc'


describe('dayGrid advanced event rendering', function() {
  pushOptions({
    initialDate: '2020-05-01'
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5408
  it('renders without intersecting', function() {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-05-01',
      events: [
        { start: '2020-05-02', end: '2020-05-04', title: 'event a' },
        { start: '2020-05-02', end: '2020-05-04', title: 'event b' },
        { start: '2020-05-03', end: '2020-05-05', title: 'event c' },
        { start: '2020-05-04', title: 'event d' },
        { start: '2020-05-04', title: 'event e' }
      ]
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()

    expect(anyElsIntersect(eventEls)).toBe(false)
  })

  it('won\'t intersect when doing custom rendering', function() {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-06-01',
      events: [
        { start: '2020-06-04', end: '2020-06-08', title: 'event a' },
        { start: '2020-06-05', end: '2020-06-09', title: 'event b' },
        { start: '2020-06-08T12:00:00', title: 'event c' }
      ],
      eventContent(arg) { // creates varying-height events, which revealed the bug
        return {
          html:`
            <b>${arg.timeText}</b>
            <i>${arg.event.title}</i>
          `
        }
      }
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()

    expect(anyElsIntersect(eventEls)).toBe(false)
  })

  it('renders single-day timed event as list-item', function() {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-05-01',
      eventDisplay: 'auto',
      events: [
        {
          title: 'event 1',
          start: '2020-05-11T22:00:00'
        }
      ]
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]

    expect(dayGridWrapper.isEventListItem(eventEl)).toBe(true)
  })

  it('does not render multi-day event as list-item', function() {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-05-01',
      eventDisplay: 'auto',
      events: [
        {
          title: 'event 1',
          start: '2020-05-11T22:00:00',
          end: '2020-05-12T06:00:00'
        }
      ]
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]

    expect(dayGridWrapper.isEventListItem(eventEl)).toBe(false)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5634
  it('does not render split multi-day event as list-item', function() {
    let calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-05-01',
      eventDisplay: 'auto',
      events: [
        {
          title: 'event',
          start: '2020-05-09T12:00:00',
          end: '2020-05-10T12:00:00'
        }
      ]
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEls = dayGridWrapper.getEventEls()

    expect(eventEls.length).toBe(2)
    expect(dayGridWrapper.isEventListItem(eventEls[0])).toBe(false)
    expect(dayGridWrapper.isEventListItem(eventEls[0])).toBe(false)
  })

  it('render only block when eventDislay:block', function() {
    let calendar = initCalendar({
      eventDisplay: 'block',
      events: [
        { start: '2020-05-02T02:00:00', title: 'event a' }
      ]
    })

    let dayGridWrapper = new DayGridViewWrapper(calendar).dayGrid
    let eventEl = dayGridWrapper.getEventEls()[0]

    expect(dayGridWrapper.isEventListItem(eventEl)).toBe(false)
  })

  it('adjusts more link when getting bigger then smaller with liquid height', function() {
    const LARGE_HEIGHT = 800
    const SMALL_HEIGHT = 500
    let $container = $(
      `<div style="height:${LARGE_HEIGHT}px"><div></div></div>`
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
      ]
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

})
