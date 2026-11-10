import { describe, expect, it } from 'vitest'
import { CalendarOptions } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { getEventEls, queryPart, queryParts } from '../lib/models/events'
import { getVerticalScroller } from '../lib/models/slots'
import { waitForSettle } from '../lib/settle'

async function initMultiMonth(options: CalendarOptions) {
  const calendar = initCalendar({ initialView: 'multiMonthYear', initialDate: '2023-06-01', ...options })
  await waitForSettle()
  return { calendar, monthEls: queryParts(calendar.el, 'singleMonth') }
}

describe('multiMonth view', () => {
  it('spans the year in multiMonthYear', async () => {
    const { calendar, monthEls } = await initMultiMonth({})

    expect(calendar.view.currentStart).toEqual(new Date('2023-01-01T00:00:00Z'))
    expect(calendar.view.currentEnd).toEqual(new Date('2024-01-01T00:00:00Z'))
    expect(monthEls.map((el) => el.getAttribute('data-date'))).toEqual([
      '2023-01', '2023-02', '2023-03', '2023-04', '2023-05', '2023-06',
      '2023-07', '2023-08', '2023-09', '2023-10', '2023-11', '2023-12',
    ])
  })

  it('can have a custom duration', async () => {
    const { calendar, monthEls } = await initMultiMonth({ initialView: 'multiMonth', duration: { months: 2 } })

    expect(calendar.view.currentStart).toEqual(new Date('2023-06-01T00:00:00Z'))
    expect(calendar.view.currentEnd).toEqual(new Date('2023-08-01T00:00:00Z'))
    expect(monthEls.map((el) => el.getAttribute('data-date'))).toEqual(['2023-06', '2023-07'])
  })

  it('places months side by side when singleMonthMinWidth is small', async () => {
    const { monthEls } = await initMultiMonth({ singleMonthMinWidth: 100 })
    const [rect0, rect1] = [monthEls[0].getBoundingClientRect(), monthEls[1].getBoundingClientRect()]

    expect(rect0.right).toBeLessThanOrEqual(rect1.left)
    expect(rect0.top).toBe(rect1.top)
  })

  it.each([
    ['a large singleMonthMinWidth', { singleMonthMinWidth: 600 }],
    ['multiMonthMaxColumns:1', { multiMonthMaxColumns: 1 }],
  ])('stacks months with %s', async (_desc, options) => {
    const { monthEls } = await initMultiMonth(options)
    const [rect0, rect1] = [monthEls[0].getBoundingClientRect(), monthEls[1].getBoundingClientRect()]

    expect(rect0.bottom).toBeLessThanOrEqual(rect1.top)
    expect(rect0.left).toBe(rect1.left)
  })

  it('is scrolled to the current date initially, and to the top after navigating', async () => {
    const { calendar, monthEls } = await initMultiMonth({ multiMonthMaxColumns: 1 })
    const scrollerEl = getVerticalScroller(monthEls[5])

    expect(scrollerEl.scrollTop).toBeGreaterThan(0)
    expect(Math.abs(scrollerEl.getBoundingClientRect().top - monthEls[5].getBoundingClientRect().top)).toBeLessThan(2)

    calendar.next()
    await waitForSettle()
    calendar.prev()
    await waitForSettle()

    expect(scrollerEl.scrollTop).toBe(0)
  })

  it('renders events with weekends:false', async () => {
    const { calendar, monthEls } = await initMultiMonth({
      initialDate: '2023-01-25',
      weekends: false,
      events: [{ title: 'Conference', start: '2023-01-11', end: '2023-01-13' }],
    })

    expect(monthEls.length).toBe(12)
    expect(queryParts(monthEls[0], 'dayHeader').length).toBe(5)
    expect(getEventEls(calendar.el).length).toBe(1)
  })

  it('formats month titles with singleMonthTitleFormat', async () => {
    const { monthEls } = await initMultiMonth({ singleMonthTitleFormat: { month: 'short', year: 'numeric' } })

    expect(queryPart(monthEls[0], 'singleMonthHeaderInner')!.textContent).toBe('Jan 2023')
  })

  it('doesn\'t label month starts within the day cells', async () => {
    const { monthEls } = await initMultiMonth({})
    const labels = queryParts(monthEls[0], 'dayCellTopInner').map((el) => el.textContent)

    expect(labels.length).toBeGreaterThan(28)
    expect(labels.filter((text) => /\D/.test(text!))).toEqual([])
  })

  // https://github.com/fullcalendar/fullcalendar/issues/7287
  it('renders the whole year with validRange, with the days outside it disabled', async () => {
    const { calendar, monthEls } = await initMultiMonth({
      validRange: { start: '2023-04-01', end: '2023-09-01' },
    })

    expect(calendar.view.currentStart).toEqual(new Date('2023-01-01T00:00:00Z'))
    expect(calendar.view.currentEnd).toEqual(new Date('2024-01-01T00:00:00Z'))
    expect(monthEls.length).toBe(12)

    const datedCellsInMarch = queryParts(monthEls[2], 'dayCell').filter((el) => el.hasAttribute('data-date'))
    const datedCellsInApril = queryParts(monthEls[3], 'dayCell').filter((el) => el.hasAttribute('data-date'))
    expect(datedCellsInMarch).toEqual([])
    expect(datedCellsInApril.length).toBeGreaterThan(0)
  })
})
