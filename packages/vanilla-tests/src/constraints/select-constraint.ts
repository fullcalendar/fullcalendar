import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { TimeGridModel } from '../lib/models/time-grid'
import { waitForSettle } from '../lib/settle'

/*
selectConstraint, tested by selecting in timeGridWeek (plus dayGridMonth for all-day selections).
Ends are exclusive. Each table mixes allowed and disallowed rows that select the same way, so a
disallowed row can't pass just because the gesture failed.
*/
describe('selectConstraint', () => {
  const options = {
    initialView: 'timeGridWeek',
    initialDate: '2014-11-10',
    scrollTime: '00:00',
    selectable: true,
    dragScroll: false,
  }

  interface SelectCase {
    desc: string
    calendarOptions: object
    start: string
    end: string
    isAllowed: boolean
  }

  async function testSelect({ calendarOptions, start, end, isAllowed }: SelectCase) {
    const select = vi.fn()
    const calendar = initCalendar({ ...options, ...calendarOptions, select })
    await waitForSettle()

    if (start.includes('T')) {
      await new TimeGridModel(calendar.el).selectRange(start, end)
    } else {
      const lastDay = new Date(new Date(end + 'T00:00:00Z').valueOf() - 86400000).toISOString().slice(0, 10)
      await new DayGridModel(calendar.el).selectDates(start, lastDay)
    }

    if (isAllowed) {
      expect(select).toHaveBeenCalledOnce()
      const info = select.mock.calls[0][0]
      expect(info.startStr.slice(0, start.length)).toBe(start)
      expect(info.endStr.slice(0, end.length)).toBe(end)
    } else {
      expect(select).not.toHaveBeenCalled()
    }
  }

  const withRange = (start: string, end: string) => ({ selectConstraint: { start, end } })

  it.each<SelectCase>([
    { desc: 'allows a selection well within a date range', calendarOptions: withRange('2014-11-12T01:00:00', '2014-11-12T20:00:00'), start: '2014-11-12T03:00', end: '2014-11-12T10:00', isAllowed: true },
    { desc: 'allows a selection starting at a date range\'s start', calendarOptions: withRange('2014-11-12T01:00:00', '2014-11-12T20:00:00'), start: '2014-11-12T01:00', end: '2014-11-12T05:00', isAllowed: true },
    { desc: 'allows a selection ending at a date range\'s end', calendarOptions: withRange('2014-11-12T01:00:00', '2014-11-12T05:00:00'), start: '2014-11-12T03:00', end: '2014-11-12T05:00', isAllowed: true },
    { desc: 'disallows a selection across a date range\'s start', calendarOptions: withRange('2014-11-12T03:00:00', '2014-11-12T20:00:00'), start: '2014-11-12T02:00', end: '2014-11-12T04:00', isAllowed: false },
    { desc: 'disallows a selection across a date range\'s end', calendarOptions: withRange('2014-11-12T03:00:00', '2014-11-12T07:00:00'), start: '2014-11-12T04:00', end: '2014-11-12T08:00', isAllowed: false },
    { desc: 'disallows a selection after a date range', calendarOptions: withRange('2014-11-12T03:00:00', '2014-11-12T05:00:00'), start: '2014-11-12T05:00', end: '2014-11-12T07:00', isAllowed: false },
  ])('$desc', testSelect)

  describe('in dayGridMonth', () => {
    it.each<SelectCase>([
      { desc: 'disallows days outside an all-day range', calendarOptions: withRange('2014-11-13', '2014-11-14'), start: '2014-11-12', end: '2014-11-14', isAllowed: false },
      { desc: 'disallows days not covered by a timed range', calendarOptions: withRange('2014-11-12T01:00:00', '2014-11-14T00:00:00'), start: '2014-11-12', end: '2014-11-14', isAllowed: false },
      { desc: 'allows days covered by a timed range', calendarOptions: withRange('2014-11-12T00:00:00', '2014-11-14T00:00:00'), start: '2014-11-12', end: '2014-11-14', isAllowed: true },
    ])('$desc', (testCase) => testSelect({ ...testCase, calendarOptions: { initialView: 'dayGridMonth', ...testCase.calendarOptions } }))
  })

  it.each<SelectCase>([
    { desc: 'allows a selection within a recurring time range', calendarOptions: { selectConstraint: { startTime: '01:00', endTime: '05:00' } }, start: '2014-11-12T02:00', end: '2014-11-12T04:00', isAllowed: true },
    { desc: 'disallows a selection partly outside a recurring time range', calendarOptions: { selectConstraint: { startTime: '01:00', endTime: '05:00' } }, start: '2014-11-12T02:00', end: '2014-11-12T06:00', isAllowed: false },
    { desc: 'disallows a multi-day selection over a recurring time range', calendarOptions: { selectConstraint: { startTime: '01:00', endTime: '05:00' } }, start: '2014-11-12T02:00', end: '2014-11-14T04:00', isAllowed: false },
    // the same multi-day gesture, allowed, so the row above can't pass just because the gesture failed
    { desc: 'allows a multi-day selection within a date range', calendarOptions: withRange('2014-11-12T00:00:00', '2014-11-15T00:00:00'), start: '2014-11-12T02:00', end: '2014-11-14T04:00', isAllowed: true },
  ])('$desc', testSelect)

  describe('with businessHours', () => {
    const businessHours = { startTime: '01:00', endTime: '05:00' }

    it.each<SelectCase>([
      { desc: 'allows a selection within business hours', calendarOptions: { businessHours }, start: '2014-11-12T02:00', end: '2014-11-12T04:00', isAllowed: true },
      { desc: 'disallows a selection partly outside business hours', calendarOptions: { businessHours }, start: '2014-11-12T02:00', end: '2014-11-12T06:00', isAllowed: false },
      {
        desc: 'disallows a selection on a day without business hours',
        calendarOptions: { businessHours: { ...businessHours, daysOfWeek: [1, 2, 4, 5] } },
        start: '2014-11-12T02:00', // a Wednesday
        end: '2014-11-12T04:00',
        isAllowed: false,
      },
    ])('$desc', (testCase) => testSelect({ ...testCase, calendarOptions: { ...testCase.calendarOptions, selectConstraint: 'businessHours' } }))
  })

  describe('with a groupId', () => {
    const groupEvent = { groupId: 'yo', start: '2014-11-12T02:00:00', end: '2014-11-12T05:00:00', display: 'background' }

    it.each<SelectCase>([
      { desc: 'allows a selection within an event of the group', calendarOptions: { events: [groupEvent], selectConstraint: 'yo' }, start: '2014-11-12T03:00', end: '2014-11-12T04:00', isAllowed: true },
      { desc: 'disallows a selection partly outside an event of the group', calendarOptions: { events: [groupEvent], selectConstraint: 'yo' }, start: '2014-11-12T03:00', end: '2014-11-12T06:00', isAllowed: false },
      { desc: 'disallows any selection when no event is in the group', calendarOptions: { selectConstraint: 'yooo' }, start: '2014-11-12T03:00', end: '2014-11-12T06:00', isAllowed: false },
      { desc: 'disallows any selection when no event is in the group, in dayGridMonth', calendarOptions: { initialView: 'dayGridMonth', selectConstraint: 'yooo' }, start: '2014-11-12', end: '2014-11-15', isAllowed: false },
    ])('$desc', testSelect)
  })
})
