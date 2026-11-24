import { describe, expect, it, vi } from 'vitest'
import { DayCellInfo } from 'fullcalendar'
import bnLocale from 'fullcalendar/locales/bn'
import { createCalendarElement, initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { queryPart, queryParts } from '../lib/models/events'
import { getVerticalScroller } from '../lib/models/slots'
import { waitForSettle } from '../lib/settle'

function getDayNumberText(model: DayGridModel, date: string): string {
  return queryPart(model.getDayCell(date), 'dayCellTopInner')!.textContent!
}

/*
Day-cell labels that name the month, which mark where months start, as [date, text] pairs.
Other cells show only the day number.
*/
function getMonthStartLabels(root: HTMLElement): [string, string][] {
  return queryParts(root, 'dayCell')
    .map((cellEl): [string, string] => [
      cellEl.getAttribute('data-date')!,
      queryPart(cellEl, 'dayCellTopInner')?.textContent || '',
    ])
    .filter(([, text]) => /\D/.test(text))
}

describe('dayGrid day cells', () => {
  // (the legacy test used ar, which current browsers format with Latin digits)
  it('render day numbers in the locale\'s numerals', async () => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2018-01-01', locale: bnLocale })
    await waitForSettle()

    expect(getDayNumberText(new DayGridModel(calendar.el), '2018-01-01')).toBe('১')
  })

  describe('dayCellDidMount', () => {
    it('is called for each cell, with its date and element', async () => {
      const dayCellDidMount = vi.fn((_info: DayCellInfo) => undefined)
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2014-05-01',
        fixedWeekCount: true,
        dayCellDidMount,
      })
      await waitForSettle()

      const cellEls = queryParts(calendar.el, 'dayCell')
      expect(cellEls.length).toBe(42)
      expect(dayCellDidMount).toHaveBeenCalledTimes(42)

      for (const [info] of dayCellDidMount.mock.calls) {
        expect(cellEls).toContain(info.el)
        expect(info.date.toISOString().slice(0, 10)).toBe(info.el.getAttribute('data-date'))
      }
    })

    it('can modify the element', async () => {
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2014-05-01',
        dayCellDidMount(info) {
          if (info.date.toISOString().startsWith('2014-05-01')) {
            info.el.classList.add('custom')
          }
        },
      })
      await waitForSettle()

      const customEls = queryParts(calendar.el, 'dayCell').filter((el) => el.classList.contains('custom'))
      expect(customEls.map((el) => el.getAttribute('data-date'))).toEqual(['2014-05-01'])
    })

    it.each([
      ['another week', '2014-05-04', 7],
      ['the same week', '2014-05-02', 0],
    ])('when navigating to %s, is called for each new cell', async (_desc, date, count) => {
      const dayCellDidMount = vi.fn()
      const dayCellWillUnmount = vi.fn()
      const calendar = initCalendar({
        initialView: 'dayGridWeek',
        initialDate: '2014-05-01',
        dayCellDidMount,
        dayCellWillUnmount,
      })
      await waitForSettle()
      expect(dayCellDidMount).toHaveBeenCalledTimes(7)
      dayCellDidMount.mockClear()

      calendar.gotoDate(date)
      await waitForSettle()

      expect(dayCellDidMount).toHaveBeenCalledTimes(count)
      expect(dayCellWillUnmount).toHaveBeenCalledTimes(count)
    })
  })

  describe('in a multi-week dayGrid', () => {
    it('labels the month where it starts and in the first cell', async () => {
      const calendar = initCalendar({
        initialView: 'dayGrid',
        initialDate: '2023-01-30',
        duration: { weeks: 2 },
      })
      await waitForSettle()

      expect(getMonthStartLabels(calendar.el)).toEqual([
        ['2023-01-29', 'January 29'],
        ['2023-02-01', 'February 1'],
      ])
    })

    it('formats those labels with monthStartFormat', async () => {
      const calendar = initCalendar({
        initialView: 'dayGrid',
        initialDate: '2023-01-30',
        duration: { weeks: 2 },
        monthStartFormat: { year: 'numeric', month: 'short', day: '2-digit' },
      })
      await waitForSettle()

      expect(getMonthStartLabels(calendar.el)).toEqual([
        ['2023-01-29', 'Jan 29, 2023'],
        ['2023-02-01', 'Feb 01, 2023'],
      ])
    })

    // https://github.com/fullcalendar/fullcalendar/issues/7197
    it('labels every month of a custom 6-month view', async () => {
      const calendar = initCalendar({
        initialView: 'dayGrid',
        initialDate: '2023-01-30',
        duration: { months: 6 },
        monthStartFormat: { year: 'numeric', month: 'short', day: '2-digit' },
      })
      await waitForSettle()

      expect(getMonthStartLabels(calendar.el)).toEqual([
        ['2023-01-01', 'Jan 01, 2023'],
        ['2023-02-01', 'Feb 01, 2023'],
        ['2023-03-01', 'Mar 01, 2023'],
        ['2023-04-01', 'Apr 01, 2023'],
        ['2023-05-01', 'May 01, 2023'],
        ['2023-06-01', 'Jun 01, 2023'],
      ])
    })

    // https://github.com/fullcalendar/fullcalendar/issues/8137
    it('labels the first visible day of each month when weekends are hidden', async () => {
      const calendar = initCalendar({
        initialView: 'dayGrid',
        initialDate: '2026-10-01',
        duration: { months: 3 },
        weekends: false,
      })
      await waitForSettle()

      expect(getMonthStartLabels(calendar.el)).toEqual([
        ['2026-10-01', 'October 1'],
        ['2026-11-02', 'November 2'],
        ['2026-12-01', 'December 1'],
      ])
    })

    it.each([0, 1, 2, 3, 4, 5, 6])('labels months when weekday %i is hidden', async (hiddenDay) => {
      const calendar = initCalendar({
        initialView: 'dayGrid',
        initialDate: '2023-01-01',
        duration: { years: 1 },
        hiddenDays: [hiddenDay],
        monthStartFormat: { month: 'long', day: 'numeric' },
      })
      await waitForSettle()

      const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })
      const expected: [string, string][] = []
      for (let month = 0; month < 12; month++) {
        const date = new Date(Date.UTC(2023, month, 1))
        if (date.getUTCDay() === hiddenDay) {
          date.setUTCDate(2)
        }
        expected.push([date.toISOString().slice(0, 10), formatter.format(date)])
      }
      expect(getMonthStartLabels(calendar.el)).toEqual(expected)
    })

    it('labels months across a year boundary with only one visible weekday', async () => {
      const calendar = initCalendar({
        initialView: 'dayGrid',
        initialDate: '2022-12-01',
        duration: { months: 3 },
        hiddenDays: [0, 1, 2, 3, 4, 6],
        monthStartFormat: { year: 'numeric', month: 'short', day: 'numeric' },
      })
      await waitForSettle()

      expect(getMonthStartLabels(calendar.el)).toEqual([
        ['2022-12-02', 'Dec 2, 2022'],
        ['2023-01-06', 'Jan 6, 2023'],
        ['2023-02-03', 'Feb 3, 2023'],
      ])
    })

    it('labels the first visible date of a partial month', async () => {
      const calendar = initCalendar({
        initialView: 'dayGrid',
        initialDate: '2023-01-28',
        visibleRange: { start: '2023-01-28', end: '2023-02-11' },
        weekends: false,
      })
      await waitForSettle()

      expect(getMonthStartLabels(calendar.el)).toEqual([
        ['2023-01-30', 'January 30'],
        ['2023-02-01', 'February 1'],
      ])
    })

    it('does not move month labels into leading padding days', async () => {
      for (const weekends of [true, false]) {
        const calendar = initCalendar({
          initialView: 'dayGrid',
          initialDate: '2026-11-04',
          duration: { months: 1 },
          dateAlignment: 'day',
          weekends,
        })
        await waitForSettle()

        expect(getMonthStartLabels(calendar.el)).toEqual([
          ...(weekends ? [['2026-11-01', 'November 1']] : []),
          ['2026-11-04', 'November 4'],
          ['2026-12-01', 'December 1'],
        ])
        if (!weekends) {
          expect(getDayNumberText(new DayGridModel(calendar.el), '2026-11-02')).toBe('2')
        }
      }
    })

    it('updates month labels when hidden weekdays change', async () => {
      const calendar = initCalendar({
        initialView: 'dayGrid',
        initialDate: '2026-10-01',
        duration: { months: 3 },
      })
      await waitForSettle()
      expect(getMonthStartLabels(calendar.el)).toEqual([
        ['2026-10-01', 'October 1'],
        ['2026-11-01', 'November 1'],
        ['2026-12-01', 'December 1'],
      ])

      calendar.setOption('weekends', false)
      await waitForSettle()
      expect(getMonthStartLabels(calendar.el)).toEqual([
        ['2026-10-01', 'October 1'],
        ['2026-11-02', 'November 2'],
        ['2026-12-01', 'December 1'],
      ])

      calendar.setOption('weekends', true)
      await waitForSettle()
      expect(getMonthStartLabels(calendar.el)).toEqual([
        ['2026-10-01', 'October 1'],
        ['2026-11-01', 'November 1'],
        ['2026-12-01', 'December 1'],
      ])
    })

    it.each([true, false])('does not label months in a single-month view with weekends=%s', async (weekends) => {
      const calendar = initCalendar({
        initialView: 'dayGridMonth',
        initialDate: '2026-11-01',
        weekends,
      })
      await waitForSettle()

      expect(getMonthStartLabels(calendar.el)).toEqual([])
      expect(getDayNumberText(new DayGridModel(calendar.el), weekends ? '2026-11-01' : '2026-11-02'))
        .toBe(weekends ? '1' : '2')
    })

    it.each([
      [6, false],
      [7, true],
    ])('with %i weeks, overflows its scroller: %s', async (weeks, overflows) => {
      const calendar = initCalendar({
        initialView: 'dayGrid',
        initialDate: '2023-01-25',
        duration: { weeks },
      })
      await waitForSettle()

      const scrollerEl = getVerticalScroller(queryParts(calendar.el, 'dayCell')[0])
      expect(scrollerEl.scrollHeight > scrollerEl.clientHeight).toBe(overflows)
    })
  })

  describe('dayGridYear', () => {
    it('spans the year', async () => {
      const calendar = initCalendar({ initialView: 'dayGridYear', initialDate: '2023-06-25' })
      await waitForSettle()

      expect(calendar.view.currentStart).toEqual(new Date('2023-01-01T00:00:00Z'))
      expect(calendar.view.currentEnd).toEqual(new Date('2024-01-01T00:00:00Z'))
    })

    it.each([
      ['2023-06-25', true],
      ['2028-01-01', false], // a past bug: the date is the last cell in its row (and the first row)
    ])('scrolls %s to the top', async (initialDate, scrolls) => {
      const calendar = initCalendar({ initialView: 'dayGridYear', initialDate })
      await waitForSettle()

      const cellEl = new DayGridModel(calendar.el).getDayCell(initialDate)
      const scrollerEl = getVerticalScroller(cellEl)
      expect(scrollerEl.scrollTop > 0).toBe(scrolls)
      expect(Math.abs(cellEl.getBoundingClientRect().top - scrollerEl.getBoundingClientRect().top)).toBeLessThan(1)
    })
  })

  it('maps clicks to the right day after the container resizes', async () => {
    const el = createCalendarElement()
    el.style.width = '200px'
    const dateClick = vi.fn()
    initCalendar({ initialView: 'dayGridMonth', initialDate: '2019-04-01', dateClick }, el)
    await waitForSettle()

    el.style.width = '400px'
    await waitForSettle()
    await new DayGridModel(el).clickDate('2019-04-02')

    expect(dateClick).toHaveBeenCalledOnce()
    expect(dateClick.mock.calls[0][0].dateStr).toBe('2019-04-02')
  })
})
