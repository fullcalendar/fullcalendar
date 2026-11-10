import { describe, expect, it, vi } from 'vitest'
import { AllowFunc } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { TimeGridModel } from '../lib/models/time-grid'
import { touchPointer } from '../lib/pointer'
import { waitForSettle } from '../lib/settle'

describe('selecting dates in timeGrid', () => {
  const options = {
    initialView: 'timeGridWeek',
    initialDate: '2014-05-25',
    scrollTime: '00:00',
    selectable: true,
    dragScroll: false,
  }

  it.each([
    ['several days', '2014-05-28', '2014-05-29', '2014-05-30'],
    ['a single day', '2014-05-28', '2014-05-28', '2014-05-29'],
  ])('selects %s in the all-day row', async (_desc, first, last, expectedEnd) => {
    const select = vi.fn()
    const calendar = initCalendar({ ...options, select })
    await waitForSettle()

    await new TimeGridModel(calendar.el).allDay.selectDates(first, last)

    const info = select.mock.calls[0][0]
    expect(info.startStr).toBe(first)
    expect(info.endStr).toBe(expectedEnd)
    expect(info.allDay).toBe(true)
  })

  it.each([
    ['several slots', {}, '2014-05-28T09:00', '2014-05-28T10:30'],
    ['a single slot', {}, '2014-05-28T09:00', '2014-05-28T09:30'],
    ['slots across days', {}, '2014-05-28T09:00', '2014-05-29T10:30'],
    // https://github.com/fullcalendar/fullcalendar/issues/4505
    ['slots up to the end of the day', { scrollTime: '24:00' }, '2014-05-28T16:00', '2014-05-29T00:00'],
  ])('selects %s', async (_desc, moreOptions, start, end) => {
    const select = vi.fn()
    const calendar = initCalendar({ ...options, ...moreOptions, select })
    await waitForSettle()

    await new TimeGridModel(calendar.el).selectRange(start, end)

    const info = select.mock.calls[0][0]
    expect(info.startStr).toBe(start + ':00Z')
    expect(info.endStr).toBe(end + ':00Z')
    expect(info.allDay).toBe(false)
  })

  it('selects at snapDuration granularity', async () => {
    const select = vi.fn()
    const calendar = initCalendar({ ...options, slotDuration: '00:30', snapDuration: '00:15', select })
    await waitForSettle()

    await new TimeGridModel(calendar.el).selectRange('2014-05-28T04:15', '2014-05-28T07:45')

    const info = select.mock.calls[0][0]
    expect(info.startStr).toBe('2014-05-28T04:15:00Z')
    expect(info.endStr).toBe('2014-05-28T07:45:00Z')
  })

  it('selects slots in RTL', async () => {
    const select = vi.fn()
    const calendar = initCalendar({ ...options, direction: 'rtl', select })
    await waitForSettle()

    await new TimeGridModel(calendar.el).selectRange('2014-05-28T09:00', '2014-05-29T10:30')

    const info = select.mock.calls[0][0]
    expect(info.startStr).toBe('2014-05-28T09:00:00Z')
    expect(info.endStr).toBe('2014-05-29T10:30:00Z')
  })

  it('selects slots after a long touch press', async () => {
    const select = vi.fn()
    const calendar = initCalendar({ ...options, longPressDelay: 50, select })
    await waitForSettle()

    const timeGrid = new TimeGridModel(calendar.el)
    await touchPointer.press(timeGrid.pointForDateTime('2014-05-28T09:00'), 150, async () => {
      await touchPointer.move(timeGrid.pointForDateTimeEnd('2014-05-28T10:30'))
      await waitForSettle()
    })
    await waitForSettle()

    const info = select.mock.calls[0][0]
    expect(info.startStr).toBe('2014-05-28T09:00:00Z')
    expect(info.endStr).toBe('2014-05-28T10:30:00Z')
  })

  it('renders a selectMirror event through the event render hooks', async () => {
    const eventDidMount = vi.fn()
    const calendar = initCalendar({ ...options, selectMirror: true, eventDidMount })
    await waitForSettle()

    const timeGrid = new TimeGridModel(calendar.el)
    await timeGrid.selectRange('2014-05-26T01:00', '2014-05-26T04:00')

    const mirrorEls = timeGrid.getMirrorEls()
    expect(mirrorEls).toHaveLength(1)
    expect(timeGrid.getDayLane('2014-05-26').contains(mirrorEls[0])).toBe(true)
    expect(eventDidMount).toHaveBeenCalled()
    expect(eventDidMount.mock.calls.every(([info]) => info.isMirror)).toBe(true)
  })

  describe('selectAllow', () => {
    it.each([
      ['selects when it returns true', true],
      ['doesn\'t select when it returns false', false],
    ])('%s', async (_desc, isAllowed) => {
      const selectAllow = vi.fn<AllowFunc>(() => isAllowed)
      const select = vi.fn()
      const calendar = initCalendar({ ...options, initialDate: '2016-09-04', selectAllow, select })
      await waitForSettle()

      await new TimeGridModel(calendar.el).selectRange('2016-09-04T01:00', '2016-09-04T05:00')

      const allowInfo = selectAllow.mock.calls.at(-1)![0]
      expect(allowInfo.startStr).toBe('2016-09-04T01:00:00Z')
      expect(allowInfo.endStr).toBe('2016-09-04T05:00:00Z')
      expect(select).toHaveBeenCalledTimes(isAllowed ? 1 : 0)
    })
  })

  /*
  TimeGrid is a wall-clock view: DST days still render 48 half-hour slots. A selection edge in the
  spring-forward gap resolves forward to a time that exists, in its Date and its string alike.
  */
  describe('across DST', () => {
    const dstOptions = { ...options, timeZone: 'America/New_York', initialView: 'timeGridDay' }

    it('gives selection edges in the spring-forward gap the instants of their Dates', async () => {
      const select = vi.fn()
      const calendar = initCalendar({ ...dstOptions, initialDate: '2024-03-10', select })
      await waitForSettle()

      const timeGrid = new TimeGridModel(calendar.el)
      expect(timeGrid.getSlotLanes()).toHaveLength(48)
      await timeGrid.selectRange('2024-03-10T02:30', '2024-03-10T03:30')

      // 02:30 doesn't exist, and resolves forward to 03:30 EDT
      const info = select.mock.calls[0][0]
      expect([info.startStr, info.endStr]).toEqual(['2024-03-10T03:30:00-04:00', '2024-03-10T03:30:00-04:00'])
      expect([info.start.toISOString(), info.end.toISOString()]).toEqual(['2024-03-10T07:30:00.000Z', '2024-03-10T07:30:00.000Z'])
    })

    it('resolves an ambiguous fall-back edge to the first occurrence', async () => {
      const select = vi.fn()
      const calendar = initCalendar({ ...dstOptions, initialDate: '2024-11-03', select })
      await waitForSettle()

      const timeGrid = new TimeGridModel(calendar.el)
      expect(timeGrid.getSlotLanes()).toHaveLength(48)
      await timeGrid.selectRange('2024-11-03T01:30', '2024-11-03T02:30')

      const info = select.mock.calls[0][0]
      expect(info.start.toISOString()).toBe('2024-11-03T05:30:00.000Z')
      expect(info.end.toISOString()).toBe('2024-11-03T07:30:00.000Z')
      expect(info.startStr).toBe('2024-11-03T01:30:00-04:00')
      expect(info.endStr).toBe('2024-11-03T02:30:00-05:00')
    })
  })
})
