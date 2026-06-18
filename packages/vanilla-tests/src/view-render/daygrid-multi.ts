import { DayGridViewWrapper } from '../lib/wrappers/DayGridViewWrapper'
import { waitTimeout } from '../lib/misc'
import '../lib/dom-misc.js'

describe('DayGrid w/ multiple weeks/days', () => {
  it('dayGridYear has correct start/end dates', () => {
    const calendar = initCalendar({
      initialDate: '2023-06-25',
      initialView: 'dayGridYear',
    })

    expect(calendar.view.currentStart).toEqualDate('2023-01-01')
    expect(calendar.view.currentEnd).toEqualDate('2024-01-01')
  })

  it('renders scrollbars when 7 weeks', async () => {
    const calendar = initCalendar({
      initialDate: '2023-01-25',
      initialView: 'dayGrid',
      duration: { weeks: 7 },
    })

    await waitTimeout()
    const dayGridView = new DayGridViewWrapper(calendar)
    expect(dayGridView.getScrollerEl()).toHaveScrollbars()
  })

  it('does NOT render scrollbars when 6 weeks', async () => {
    const calendar = initCalendar({
      initialDate: '2023-01-25',
      initialView: 'dayGrid',
      duration: { weeks: 6 },
    })

    await waitTimeout()
    const dayGridView = new DayGridViewWrapper(calendar)
    expect(dayGridView.getScrollerEl()).not.toHaveScrollbars()
  })

  it('displays month-start text at two points when month break', () => {
    const calendar = initCalendar({
      initialDate: '2023-01-30',
      initialView: 'dayGrid',
      duration: { weeks: 2 },
    })

    const dayGrid = new DayGridViewWrapper(calendar).dayGrid
    const monthStartEls = dayGrid.getMonthStartEls()

    expect(monthStartEls.length).toBe(2)
    expect(monthStartEls[0].innerText).toBe('January 29')
    expect(monthStartEls[1].innerText).toBe('February 1')
  })

  it('scrolls to initialDate', async () => {
    const calendar = initCalendar({
      initialDate: '2023-06-25',
      initialView: 'dayGridYear',
    })

    await waitTimeout()
    const viewWrapper = new DayGridViewWrapper(calendar)
    const scrollerEl = viewWrapper.getScrollerEl()
    const dayGridWrapper = viewWrapper.dayGrid
    const initialDayEl = dayGridWrapper.getDayEl('2023-06-25')

    expect(
      Math.abs(
        initialDayEl.getBoundingClientRect().top -
        scrollerEl.getBoundingClientRect().top,
      ),
    ).toBeLessThan(1)
  })

  /*
  Special-case for a past bug when current day is last cell in row; problems with inclusivity
  */
  it('scrolls to Jan 1 2028 on initial render', async () => {
    const calendar = initCalendar({
      initialDate: '2028-01-01',
      initialView: 'dayGridYear',
    })

    await waitTimeout()
    const viewWrapper = new DayGridViewWrapper(calendar)
    const scrollerEl = viewWrapper.getScrollerEl()
    const dayGridWrapper = viewWrapper.dayGrid
    const initialDayEl = dayGridWrapper.getDayEl('2028-01-01')

    expect(
      Math.abs(
        initialDayEl.getBoundingClientRect().top -
        scrollerEl.getBoundingClientRect().top,
      ),
    ).toBeLessThan(1)
  })

  it('has customizable monthStartFormat', () => {
    const calendar = initCalendar({
      initialDate: '2023-01-30',
      initialView: 'dayGrid',
      duration: { weeks: 2 },
      monthStartFormat: { year: 'numeric', month: 'short', day: '2-digit' },
    })

    const dayGrid = new DayGridViewWrapper(calendar).dayGrid
    const monthStartEls = dayGrid.getMonthStartEls()

    expect(monthStartEls.length).toBe(2)
    expect(monthStartEls[0].innerText).toBe('Jan 29, 2023')
    expect(monthStartEls[1].innerText).toBe('Feb 01, 2023')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/7197
  it('has month-titles for each month in custom 6-month calendar', () => {
    const calendar = initCalendar({
      initialDate: '2023-01-30',
      initialView: 'dayGrid',
      duration: { months: 6 },
      monthStartFormat: { year: 'numeric', month: 'short', day: '2-digit' },
    })

    const dayGrid = new DayGridViewWrapper(calendar).dayGrid
    const monthStartEls = dayGrid.getMonthStartEls()

    expect(monthStartEls.length).toBe(6)
    expect(monthStartEls[0].innerText).toBe('Jan 01, 2023')
    expect(monthStartEls[1].innerText).toBe('Feb 01, 2023')
  })
})
