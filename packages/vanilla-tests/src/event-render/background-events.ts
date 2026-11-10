import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { TimeGridModel } from '../lib/models/time-grid'
import { queryParts } from '../lib/models/events'
import {
  getBgEventEls,
  getContainingDate,
  getCoveredDates,
  getSlotTop,
  getVisibleEventEls,
} from '../lib/models/event-content'
import { waitForSettle } from '../lib/settle'

/*
How many of the elements are in each week row of a dayGrid view.
*/
function countPerRow(root: HTMLElement, els: HTMLElement[]): number[] {
  return queryParts(root, 'dayRow').map((rowEl) => els.filter((el) => rowEl.contains(el)).length)
}

/*
How many of the elements are in each day lane of a timeGrid view.
*/
function countPerLane(root: HTMLElement, els: HTMLElement[]): number[] {
  return queryParts(root, 'dayLane').map((laneEl) => els.filter((el) => laneEl.contains(el)).length)
}

describe('background events', () => {
  describe('in dayGridMonth', () => {
    const options = {
      initialView: 'dayGridMonth',
      initialDate: '2014-11-04', // shows Oct 26 - Dec 7
    }

    it('cover a single day', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ title: 'hi', start: '2014-11-04', display: 'background' }],
      })
      await waitForSettle()

      const bgEls = getBgEventEls(calendar.el)
      expect(bgEls.map(getCoveredDates)).toEqual([['2014-11-04']])
      expect(getVisibleEventEls(calendar.el).length).toBe(0)
    })

    it('split at week boundaries', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ start: '2014-11-04', end: '2014-11-11', display: 'background' }],
      })
      await waitForSettle()

      expect(getBgEventEls(calendar.el).map(getCoveredDates)).toEqual([
        ['2014-11-04', '2014-11-05', '2014-11-06', '2014-11-07', '2014-11-08'],
        ['2014-11-09', '2014-11-10'],
      ])
      expect(getVisibleEventEls(calendar.el).length).toBe(0)
    })

    it('overlap each other', async () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { start: '2014-11-04', end: '2014-11-07', display: 'background' },
          { start: '2014-11-05', end: '2014-11-08', display: 'background' },
        ],
      })
      await waitForSettle()

      expect(getBgEventEls(calendar.el).map(getCoveredDates)).toEqual([
        ['2014-11-04', '2014-11-05', '2014-11-06'],
        ['2014-11-05', '2014-11-06', '2014-11-07'],
      ])
    })

    it('are mirrored in RTL', async () => {
      const calendar = initCalendar({
        ...options,
        direction: 'rtl',
        events: [{ start: '2014-11-04', end: '2014-11-11', display: 'background' }],
      })
      await waitForSettle()

      const bgEls = getBgEventEls(calendar.el)
      expect(bgEls.map(getCoveredDates)).toEqual([
        ['2014-11-04', '2014-11-05', '2014-11-06', '2014-11-07', '2014-11-08'],
        ['2014-11-09', '2014-11-10'],
      ])

      const dayGrid = new DayGridModel(calendar.el)
      expect(bgEls[0].getBoundingClientRect().right)
        .toBeLessThanOrEqual(dayGrid.getDayCell('2014-11-03').getBoundingClientRect().left + 1)
      expect(bgEls[1].getBoundingClientRect().left)
        .toBeGreaterThanOrEqual(dayGrid.getDayCell('2014-11-11').getBoundingClientRect().right - 1)
    })

    it('can be set by the event source', async () => {
      const calendar = initCalendar({
        ...options,
        eventSources: [{ display: 'background', events: [{ start: '2014-11-04' }] }],
      })
      await waitForSettle()

      expect(getBgEventEls(calendar.el).map(getCoveredDates)).toEqual([['2014-11-04']])
      expect(getVisibleEventEls(calendar.el).length).toBe(0)
    })

    it('don\'t render when timed', async () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { start: '2014-11-04T12:00:00', end: '2014-11-04T14:00:00', display: 'background' },
          { start: '2014-11-05', display: 'background' }, // all-day, rendered
        ],
      })
      await waitForSettle()

      expect(getBgEventEls(calendar.el).map(getCoveredDates)).toEqual([['2014-11-05']])
    })

    describe('when inverse', () => {
      it('cover everything but a single day', async () => {
        const calendar = initCalendar({
          ...options,
          events: [{ title: 'hi', start: '2014-11-04', display: 'inverse-background' }],
        })
        await waitForSettle()

        const bgEls = getBgEventEls(calendar.el)
        expect(countPerRow(calendar.el, bgEls)).toEqual([1, 2, 1, 1, 1, 1])
        expect(bgEls.slice(1, 3).map(getCoveredDates)).toEqual([
          ['2014-11-02', '2014-11-03'],
          ['2014-11-05', '2014-11-06', '2014-11-07', '2014-11-08'],
        ])
        expect(getVisibleEventEls(calendar.el).length).toBe(0)
      })

      it('cover everything but a span of days across weeks', async () => {
        const calendar = initCalendar({
          ...options,
          events: [{ start: '2014-11-04', end: '2014-11-11', display: 'inverse-background' }],
        })
        await waitForSettle()

        const bgEls = getBgEventEls(calendar.el)
        expect(countPerRow(calendar.el, bgEls)).toEqual([1, 1, 1, 1, 1, 1])
        expect(bgEls.slice(1, 3).map(getCoveredDates)).toEqual([
          ['2014-11-02', '2014-11-03'],
          ['2014-11-11', '2014-11-12', '2014-11-13', '2014-11-14', '2014-11-15'],
        ])
      })

      it('handle a span starting before the view', async () => {
        const calendar = initCalendar({
          ...options,
          events: [{ start: '2014-10-24', end: '2014-11-06', display: 'inverse-background' }],
        })
        await waitForSettle()

        const bgEls = getBgEventEls(calendar.el)
        expect(countPerRow(calendar.el, bgEls)).toEqual([0, 1, 1, 1, 1, 1])
        expect(getCoveredDates(bgEls[0])).toEqual(['2014-11-06', '2014-11-07', '2014-11-08'])
      })

      it('handle a span ending after the view', async () => {
        const calendar = initCalendar({
          ...options,
          events: [{ start: '2014-11-27', end: '2014-12-08', display: 'inverse-background' }],
        })
        await waitForSettle()

        const bgEls = getBgEventEls(calendar.el)
        expect(countPerRow(calendar.el, bgEls)).toEqual([1, 1, 1, 1, 1, 0])
        expect(getCoveredDates(bgEls[4])).toEqual(['2014-11-23', '2014-11-24', '2014-11-25', '2014-11-26'])
      })

      it('cover everything but the days of a group\'s events, given in reverse order', async () => {
        const calendar = initCalendar({
          ...options,
          events: [
            { groupId: 'hi', start: '2014-11-06', display: 'inverse-background' },
            { groupId: 'hi', start: '2014-11-04', display: 'inverse-background' },
          ],
        })
        await waitForSettle()

        const bgEls = getBgEventEls(calendar.el)
        expect(countPerRow(calendar.el, bgEls)).toEqual([1, 3, 1, 1, 1, 1])
        expect(bgEls.slice(1, 4).map(getCoveredDates)).toEqual([
          ['2014-11-02', '2014-11-03'],
          ['2014-11-05'],
          ['2014-11-07', '2014-11-08'],
        ])
      })

      it('cover everything but a single day in RTL', async () => {
        const calendar = initCalendar({
          ...options,
          direction: 'rtl',
          events: [{ start: '2014-11-04', display: 'inverse-background' }],
        })
        await waitForSettle()

        const bgEls = getBgEventEls(calendar.el)
        expect(countPerRow(calendar.el, bgEls)).toEqual([1, 2, 1, 1, 1, 1])
        expect(bgEls.slice(1, 3).map(getCoveredDates)).toEqual([
          ['2014-11-02', '2014-11-03'],
          ['2014-11-05', '2014-11-06', '2014-11-07', '2014-11-08'],
        ])
      })
    })
  })

  describe('in timeGridWeek', () => {
    const options = {
      initialView: 'timeGridWeek',
      initialDate: '2014-11-04', // shows Nov 2 - 8
      scrollTime: '00:00',
    }

    function expectBetweenTimes(root: HTMLElement, el: HTMLElement, startTime: string, endTime: string): void {
      const rect = el.getBoundingClientRect()
      expect(Math.abs(rect.top - getSlotTop(root, startTime))).toBeLessThanOrEqual(2)
      expect(Math.abs(rect.bottom - getSlotTop(root, endTime))).toBeLessThanOrEqual(2)
    }

    it.each<{ direction: 'ltr' | 'rtl' }>([
      { direction: 'ltr' },
      { direction: 'rtl' },
    ])('cover a time span within a day ($direction)', async ({ direction }) => {
      const calendar = initCalendar({
        ...options,
        direction,
        events: [{ start: '2014-11-04T01:00:00', end: '2014-11-04T05:00:00', display: 'background' }],
      })
      await waitForSettle()

      const bgEls = getBgEventEls(calendar.el)
      expect(bgEls.map(getContainingDate)).toEqual(['2014-11-04'])
      expectBetweenTimes(calendar.el, bgEls[0], '01:00:00', '05:00:00')

      const laneRect = new TimeGridModel(calendar.el).getDayLane('2014-11-04').getBoundingClientRect()
      const bgRect = bgEls[0].getBoundingClientRect()
      expect(bgRect.left).toBeGreaterThanOrEqual(laneRect.left - 1)
      expect(bgRect.right).toBeLessThanOrEqual(laneRect.right + 1)
      expect(getVisibleEventEls(calendar.el).length).toBe(0)
    })

    it('split at midnight', async () => {
      const calendar = initCalendar({
        ...options,
        events: [{ start: '2014-11-04T01:00:00', end: '2014-11-05T05:00:00', display: 'background' }],
      })
      await waitForSettle()

      const bgEls = getBgEventEls(calendar.el)
      expect(bgEls.map(getContainingDate)).toEqual(['2014-11-04', '2014-11-05'])
      expectBetweenTimes(calendar.el, bgEls[1], '00:00:00', '05:00:00')
    })

    it('overlap each other', async () => {
      const calendar = initCalendar({
        ...options,
        events: [
          { start: '2014-11-04T01:00:00', end: '2014-11-05T05:00:00', display: 'background' },
          { start: '2014-11-04T03:00:00', end: '2014-11-05T08:00:00', display: 'background' },
        ],
      })
      await waitForSettle()

      expect(countPerLane(calendar.el, getBgEventEls(calendar.el))).toEqual([0, 0, 2, 2, 0, 0, 0])
    })

    it('can be set by the event source', async () => {
      const calendar = initCalendar({
        ...options,
        eventSources: [{ display: 'background', events: [{ start: '2014-11-04T01:00:00' }] }],
      })
      await waitForSettle()

      expect(getBgEventEls(calendar.el).map(getContainingDate)).toEqual(['2014-11-04'])
      expect(getVisibleEventEls(calendar.el).length).toBe(0)
    })

    describe('when inverse', () => {
      it.each<{ direction: 'ltr' | 'rtl' }>([
        { direction: 'ltr' },
        { direction: 'rtl' },
      ])('cover everything but a time span ($direction)', async ({ direction }) => {
        const calendar = initCalendar({
          ...options,
          direction,
          events: [{ start: '2014-11-04T01:00:00', end: '2014-11-04T05:00:00', display: 'inverse-background' }],
        })
        await waitForSettle()

        const bgEls = getBgEventEls(calendar.el)
        expect(countPerLane(calendar.el, bgEls)).toEqual([1, 1, 2, 1, 1, 1, 1])

        const [beforeEl, afterEl] = bgEls.filter((el) => getContainingDate(el) === '2014-11-04')
        expectBetweenTimes(calendar.el, beforeEl, '00:00:00', '01:00:00')
        expect(Math.abs(afterEl.getBoundingClientRect().top - getSlotTop(calendar.el, '05:00:00'))).toBeLessThanOrEqual(2)
      })

      it('cover everything but a span across days', async () => {
        const calendar = initCalendar({
          ...options,
          events: [{ start: '2014-11-04T01:00:00', end: '2014-11-05T05:00:00', display: 'inverse-background' }],
        })
        await waitForSettle()

        expect(countPerLane(calendar.el, getBgEventEls(calendar.el))).toEqual([1, 1, 1, 1, 1, 1, 1])
      })

      it('handle a span starting before the view', async () => {
        const calendar = initCalendar({
          ...options,
          events: [{ start: '2014-10-30T01:00:00', end: '2014-11-04T05:00:00', display: 'inverse-background' }],
        })
        await waitForSettle()

        expect(countPerLane(calendar.el, getBgEventEls(calendar.el))).toEqual([0, 0, 1, 1, 1, 1, 1])
      })

      it('handle a span ending after the view', async () => {
        const calendar = initCalendar({
          ...options,
          events: [{ start: '2014-11-04T01:00:00', end: '2014-11-12T05:00:00', display: 'inverse-background' }],
        })
        await waitForSettle()

        expect(countPerLane(calendar.el, getBgEventEls(calendar.el))).toEqual([1, 1, 1, 0, 0, 0, 0])
      })

      it('cover everything but a group\'s events, given in reverse order', async () => {
        const calendar = initCalendar({
          ...options,
          events: [
            { groupId: 'hello', start: '2014-11-05T01:00:00', end: '2014-11-05T05:00:00', display: 'inverse-background' },
            { groupId: 'hello', start: '2014-11-03T01:00:00', end: '2014-11-03T05:00:00', display: 'inverse-background' },
          ],
        })
        await waitForSettle()

        expect(countPerLane(calendar.el, getBgEventEls(calendar.el))).toEqual([1, 2, 1, 2, 1, 1, 1])
      })

      it('cover everything but the union of a group\'s nested events', async () => {
        const calendar = initCalendar({
          ...options,
          events: [
            { groupId: 'hello', start: '2014-11-05T01:00:00', end: '2014-11-05T05:00:00', display: 'inverse-background' },
            { groupId: 'hello', start: '2014-11-05T02:00:00', end: '2014-11-05T04:00:00', display: 'inverse-background' },
          ],
        })
        await waitForSettle()

        const bgEls = getBgEventEls(calendar.el)
        expect(countPerLane(calendar.el, bgEls)).toEqual([1, 1, 1, 2, 1, 1, 1])

        const [beforeEl, afterEl] = bgEls.filter((el) => getContainingDate(el) === '2014-11-05')
        expectBetweenTimes(calendar.el, beforeEl, '00:00:00', '01:00:00')
        expect(Math.abs(afterEl.getBoundingClientRect().top - getSlotTop(calendar.el, '05:00:00'))).toBeLessThanOrEqual(2)
      })

      it('cover every day when the event is out of range', async () => {
        const calendar = initCalendar({
          ...options,
          events: [{ start: '2014-01-01T01:00:00', end: '2014-01-01T05:00:00', display: 'inverse-background' }],
        })
        await waitForSettle()

        expect(countPerLane(calendar.el, getBgEventEls(calendar.el))).toEqual([1, 1, 1, 1, 1, 1, 1])
      })
    })
  })
})
