import { describe, expect, it, vi } from 'vitest'
import { EventChangeInfo, EventResizeDoneInfo, EventResizeStartInfo, EventResizeStopInfo } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { getResizerEl } from '../lib/models/resize'
import { getRectCenter, pointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

/*
Resize behavior that doesn't depend on the view's geometry, tested once on dayGrid.
*/
describe('event resizing callbacks', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-06-11',
    editable: true,
    dragScroll: false,
    events: [{ id: '1', start: '2014-06-11' }],
  }

  it('calls eventResizeStart, eventResizeStop, eventResize, then eventChange, with their arguments', async () => {
    const calls: string[] = []
    const eventResizeStart = vi.fn((_info: EventResizeStartInfo) => { calls.push('eventResizeStart') })
    const eventResizeStop = vi.fn((_info: EventResizeStopInfo) => { calls.push('eventResizeStop') })
    const eventResize = vi.fn((_info: EventResizeDoneInfo) => { calls.push('eventResize') })
    const eventChange = vi.fn((_info: EventChangeInfo) => { calls.push('eventChange') })
    const calendar = initCalendar({ ...options, eventResizeStart, eventResizeStop, eventResize, eventChange })
    await waitForSettle()

    const dayGrid = new DayGridModel(calendar.el)
    const eventEl = dayGrid.getEventEls('1')[0]
    await dayGrid.resizeEvent('1', 'end', '2014-06-11', '2014-06-13')

    expect(calls).toEqual(['eventResizeStart', 'eventResizeStop', 'eventResize', 'eventChange'])

    for (const spy of [eventResizeStart, eventResizeStop]) {
      const info = spy.mock.calls[0][0]
      expect(info.el).toBe(eventEl)
      expect(info.event.id).toBe('1')
      expect(info.jsEvent).toBeInstanceOf(MouseEvent)
      expect(info.view.type).toBe('dayGridMonth')
    }

    const resizeInfo = eventResize.mock.calls[0][0]
    expect(resizeInfo.el).toBe(eventEl)
    expect(resizeInfo.event.endStr).toBe('2014-06-14')
    expect(resizeInfo.oldEvent.end).toBeNull()
    expect(resizeInfo.startDelta.days).toBe(0)
    expect(resizeInfo.relatedEvents).toEqual([])
    expect(resizeInfo.jsEvent).toBeInstanceOf(MouseEvent)

    expect(eventChange.mock.calls[0][0].event.endStr).toBe('2014-06-14')
  })

  it.each([
    ['no end', { id: '1', start: '2014-06-11' }, '2014-06-11', null],
    ['an explicit end', { id: '1', start: '2014-06-10', end: '2014-06-12' }, '2014-06-11', '2014-06-12'],
  ])('reverts the resize of an event with %s when eventResize calls revert()', async (_desc, event, lastDay, origEndStr) => {
    const eventResize = vi.fn((info) => {
      expect(info.event.endStr).toBe('2014-06-14')
      info.revert()
    })
    const calendar = initCalendar({ ...options, events: [event], eventResize })
    await waitForSettle()

    await new DayGridModel(calendar.el).resizeEvent('1', 'end', lastDay, '2014-06-13')

    expect(eventResize).toHaveBeenCalledOnce()
    const reverted = calendar.getEventById('1')!
    expect(reverted.startStr).toBe(event.start)
    expect(reverted.end && reverted.endStr).toBe(origEndStr)
  })

  it.each([
    ['editable:false', { editable: false }],
    ['eventDurationEditable:false', { eventDurationEditable: false }],
    ['the event\'s durationEditable:false', { events: [{ ...options.events[0], durationEditable: false }] }],
  ])('offers no resize handle with %s', async (_desc, moreOptions) => {
    const calendar = initCalendar({ ...options, ...moreOptions })
    await waitForSettle()

    const eventEl = new DayGridModel(calendar.el).getEventEls('1')[0]
    await pointer.move(getRectCenter(eventEl.getBoundingClientRect()), 1) // handles appear on hover
    await waitForSettle()

    expect(getResizerEl(eventEl, 'end')).toBeNull()
  })
})
