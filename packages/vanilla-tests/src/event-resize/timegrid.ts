import { describe, expect, it, vi } from 'vitest'
import { createDuration, strictModeFactor } from 'fullcalendar/protected-api'
import { initCalendar } from '../lib/calendar'
import { TimeGridModel } from '../lib/models/time-grid'
import { waitForSettle } from '../lib/settle'

describe('event resizing in timeGrid', () => {
  const options = {
    initialView: 'timeGridWeek',
    initialDate: '2014-06-11',
    scrollTime: 0,
    editable: true,
    dragScroll: false,
  }
  const timedEvent = { id: '1', start: '2014-06-11T05:00:00', end: '2014-06-11T07:00:00' }

  it('extends a timed event\'s end', async () => {
    const eventResize = vi.fn()
    const calendar = initCalendar({ ...options, events: [timedEvent], eventResize })
    await waitForSettle()

    await new TimeGridModel(calendar.el).resizeEvent('1', 'end', '2014-06-11T07:00', '2014-06-11T09:30')

    const info = eventResize.mock.calls[0][0]
    expect(info.endDelta).toEqual(createDuration({ hour: 2, minute: 30 }))
    expect(info.event.startStr).toBe('2014-06-11T05:00:00Z')
    expect(info.event.endStr).toBe('2014-06-11T09:30:00Z')
  })

  it('extends a timed event\'s end onto another day', async () => {
    const eventResize = vi.fn()
    const calendar = initCalendar({ ...options, events: [timedEvent], eventResize })
    await waitForSettle()

    await new TimeGridModel(calendar.el).resizeEvent('1', 'end', '2014-06-11T07:00', '2014-06-12T09:30')

    const info = eventResize.mock.calls[0][0]
    expect(info.endDelta).toEqual(createDuration({ day: 1, hour: 2, minute: 30 }))
    expect(info.event.endStr).toBe('2014-06-12T09:30:00Z')
  })

  it('extends a timed event\'s end with timeZone:local', async () => {
    const calendar = initCalendar({ ...options, timeZone: 'local', events: [timedEvent] })
    await waitForSettle()

    await new TimeGridModel(calendar.el).resizeEvent('1', 'end', '2014-06-11T07:00', '2014-06-11T09:30')

    const end = calendar.getEventById('1')!.end!
    expect([end.getDate(), end.getHours(), end.getMinutes()]).toEqual([11, 9, 30])
  })

  it('extends an all-day event\'s end by whole days in the all-day row', async () => {
    const eventResize = vi.fn()
    const calendar = initCalendar({ ...options, events: [{ id: '1', start: '2014-06-11' }], eventResize })
    await waitForSettle()

    await new TimeGridModel(calendar.el).allDay.resizeEvent('1', 'end', '2014-06-11', '2014-06-13')

    const info = eventResize.mock.calls[0][0]
    expect(info.endDelta).toEqual(createDuration({ day: 2 }))
    expect(info.event.endStr).toBe('2014-06-14')
  })

  it('extends the end in RTL', async () => {
    const calendar = initCalendar({ ...options, direction: 'rtl', events: [timedEvent] })
    await waitForSettle()

    await new TimeGridModel(calendar.el).resizeEvent('1', 'end', '2014-06-11T07:00', '2014-06-12T09:30')

    expect(calendar.getEventById('1')!.endStr).toBe('2014-06-12T09:30:00Z')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/7099
  it('handles two consecutive resizes', async () => {
    const calendar = initCalendar({ ...options, events: [timedEvent] })
    await waitForSettle()

    const timeGrid = new TimeGridModel(calendar.el)
    await timeGrid.resizeEvent('1', 'end', '2014-06-11T07:00', '2014-06-11T12:00')
    expect(calendar.getEventById('1')!.endStr).toBe('2014-06-11T12:00:00Z')

    await timeGrid.resizeEvent('1', 'end', '2014-06-11T12:00', '2014-06-11T09:00')
    expect(calendar.getEventById('1')!.endStr).toBe('2014-06-11T09:00:00Z')
  })

  describe('mirror', () => {
    it.each([
      ['an end', timedEvent, {}],
      ['no end, using defaultTimedEventDuration', { id: '1', start: '2014-06-11T05:00:00' }, { defaultTimedEventDuration: '02:00' }],
    ])('shows the new time range for an event with %s', async (_desc, event, moreOptions) => {
      const calendar = initCalendar({ ...options, ...moreOptions, events: [event] })
      await waitForSettle()

      const timeGrid = new TimeGridModel(calendar.el)
      await timeGrid.resizeEvent('1', 'end', '2014-06-11T07:00', '2014-06-11T09:30', async () => {
        const mirrorEls = timeGrid.getMirrorEls()
        expect(mirrorEls).toHaveLength(1)
        expect(mirrorEls[0].textContent).toMatch(/5:00\s*–\s*9:30/)
      })
    })

    // the mirror renders on press (eventDragMinDistance:0), then once per day/snap crossed
    it('goes through the event render hooks, once per changed hit', async () => {
      let mountCnt = 0
      let contentCnt = 0
      let unmountCnt = 0
      const calendar = initCalendar({
        ...options,
        initialDate: '2018-12-25',
        slotDuration: '01:00',
        snapDuration: '01:00',
        events: [{ id: '1', start: '2018-12-25T01:00:00', end: '2018-12-25T02:00:00' }],
        eventDragMinDistance: 0,
        eventDidMount: (info) => { mountCnt += Number(info.isMirror) },
        eventContent: (info) => { contentCnt += Number(info.isMirror) },
        eventWillUnmount: (info) => { unmountCnt += Number(info.isMirror) },
      })
      await waitForSettle()

      // across 2 snaps
      await new TimeGridModel(calendar.el).resizeEvent('1', 'end', '2018-12-25T02:00', '2018-12-25T04:00')

      expect(mountCnt).toBe(1 * strictModeFactor)
      expect(contentCnt).toBe(3 * strictModeFactor)
      expect(unmountCnt).toBe(1 * strictModeFactor)
    })
  })

  it('resizes with touch after a long press selects the event', async () => {
    const calendar = initCalendar({ ...options, longPressDelay: 50, events: [timedEvent] })
    await waitForSettle()

    await new TimeGridModel(calendar.el).resizeEvent('1', 'end', '2014-06-11T07:00', '2014-06-11T09:30', undefined, { holdMs: 150 })

    expect(calendar.getEventById('1')!.endStr).toBe('2014-06-11T09:30:00Z')
  })

  it.each([
    ['to midnight', '2014-06-11T07:00', '2014-06-12T00:00', { id: '1', start: '2014-06-11T05:00:00', end: '2014-06-11T07:00:00' }],
    ['from midnight', '2014-06-12T00:00', '2014-06-11T22:00', { id: '1', start: '2014-06-11T05:00:00', end: '2014-06-12T00:00:00' }],
  ])('resizes an end %s', async (_desc, from, to, event) => {
    const calendar = initCalendar({ ...options, scrollTime: '18:00', events: [event] })
    await waitForSettle()

    await new TimeGridModel(calendar.el).resizeEvent('1', 'end', from, to)

    expect(calendar.getEventById('1')!.endStr).toBe(to + ':00Z')
  })
})
