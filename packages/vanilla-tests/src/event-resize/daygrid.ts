import { describe, expect, it, vi } from 'vitest'
import { createDuration, strictModeFactor } from 'fullcalendar/protected-api'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { getResizerEl } from '../lib/models/resize'
import { getRectCenter, pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

describe('event resizing in dayGrid', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-06-11',
    editable: true,
    dragScroll: false,
  }

  it('extends an all-day event\'s end by whole days', async () => {
    const eventResize = vi.fn()
    const calendar = initCalendar({ ...options, events: [{ id: '1', start: '2014-06-11' }], eventResize })
    await waitForSettle()

    await new DayGridModel(calendar.el).resizeEvent('1', 'end', '2014-06-11', '2014-06-16')

    const info = eventResize.mock.calls[0][0]
    expect(info.endDelta).toEqual(createDuration({ day: 5 }))
    expect(info.event.startStr).toBe('2014-06-11')
    expect(info.event.endStr).toBe('2014-06-17')
  })

  it('moves the start with eventResizableFromStart', async () => {
    const calendar = initCalendar({
      ...options,
      initialDate: '2019-08-26',
      eventResizableFromStart: true,
      events: [{ id: '1', start: '2019-08-27' }],
    })
    await waitForSettle()

    await new DayGridModel(calendar.el).resizeEvent('1', 'start', '2019-08-27', '2019-08-26')

    const event = calendar.getEventById('1')!
    expect(event.startStr).toBe('2019-08-26')
    expect(event.endStr).toBe('2019-08-28')
  })

  it('extends the end by whole days in RTL', async () => {
    const calendar = initCalendar({ ...options, direction: 'rtl', events: [{ id: '1', start: '2014-06-11' }] })
    await waitForSettle()

    await new DayGridModel(calendar.el).resizeEvent('1', 'end', '2014-06-11', '2014-06-13')

    expect(calendar.getEventById('1')!.endStr).toBe('2014-06-14')
  })

  it('offers no resize handle for a timed event', async () => {
    const calendar = initCalendar({ ...options, events: [{ id: '1', start: '2014-06-11T08:00:00' }] })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    const eventEl = dayGrid.getEventEls('1')[0]
    await pointer.move(getRectCenter(eventEl.getBoundingClientRect()), 1) // handles appear on hover
    await waitForSettle()

    expect(getResizerEl(eventEl, 'end')).toBeNull()
  })

  it('won\'t resize into days outside validRange', async () => {
    const eventResizeStart = vi.fn()
    const eventResize = vi.fn()
    const calendar = initCalendar({
      ...options,
      initialDate: '2017-06-01',
      validRange: { end: '2017-06-09' },
      events: [{ id: '1', start: '2017-06-04', end: '2017-06-07' }],
      eventResizeStart,
      eventResize,
    })
    await waitForSettle()

    await new DayGridModel(calendar.el).resizeEvent('1', 'end', '2017-06-06', '2017-06-09') // Jun 9 is disabled

    expect(eventResizeStart).toHaveBeenCalledOnce()
    expect(eventResize).not.toHaveBeenCalled()
    expect(calendar.getEventById('1')!.endStr).toBe('2017-06-07')
  })

  describe('mirror', () => {
    it('keeps the event\'s vertical position', async () => {
      const calendar = initCalendar({
        ...options,
        initialDate: '2019-08-26',
        eventOrder: 'title',
        events: [
          { id: '0', start: '2019-08-27', title: 'event0' },
          { id: '1', start: '2019-08-27', title: 'event1' },
        ],
      })
      await waitForSettle()

      const dayGrid = new DayGridModel(calendar.el)
      const eventTop = dayGrid.getEventEls('1')[0].getBoundingClientRect().top
      await dayGrid.resizeEvent('1', 'end', '2019-08-27', '2019-08-28', async () => {
        const mirrorEls = dayGrid.getMirrorEls()
        expect(mirrorEls).toHaveLength(1)
        expect(mirrorEls[0].getBoundingClientRect().top).toBe(eventTop)
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
        events: [{ id: '1', start: '2018-12-03' }],
        eventDragMinDistance: 0,
        eventDidMount: (info) => { mountCnt += Number(info.isMirror) },
        eventContent: (info) => { contentCnt += Number(info.isMirror) },
        eventWillUnmount: (info) => { unmountCnt += Number(info.isMirror) },
      })
      await waitForSettle()

      await new DayGridModel(calendar.el).resizeEvent('1', 'end', '2018-12-03', '2018-12-05') // across 2 days

      expect(mountCnt).toBe(1 * strictModeFactor)
      expect(contentCnt).toBe(3 * strictModeFactor)
      expect(unmountCnt).toBe(1 * strictModeFactor)
    })
  })

  // https://github.com/fullcalendar/fullcalendar/issues/3118
  it.each([true, false])('resizes with touch after a long press selects the event (eventStartEditable:%s)', async (eventStartEditable) => {
    const eventResize = vi.fn()
    const calendar = initCalendar({
      ...options,
      longPressDelay: 50,
      eventStartEditable,
      events: [{ id: '1', start: '2014-06-11' }],
      eventResize,
    })
    await waitForSettle()

    await new DayGridModel(calendar.el).resizeEvent('1', 'end', '2014-06-11', '2014-06-16', undefined, { holdMs: 150 })

    expect(eventResize).toHaveBeenCalledTimes(1)
    const info = eventResize.mock.calls[0][0]
    expect(info.endDelta).toEqual(createDuration({ day: 5 }))
    expect(info.event.startStr).toBe('2014-06-11')
    expect(info.event.endStr).toBe('2014-06-17')

    info.revert()
    await waitForSettle()

    const event = calendar.getEventById('1')!
    expect(event.startStr).toBe('2014-06-11')
    expect(event.end).toBeNull()
  })
})
