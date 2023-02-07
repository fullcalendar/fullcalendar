import { MultiMonthViewWrapper } from '../lib/wrappers/MultiMonthViewWrapper.js'
import '../lib/dom-geom.js'

describe('multimonth view', () => {
  it('computes start/end for multiMonthYear', () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
    })

    expect(calendar.view.currentStart).toEqualDate('2023-01-01')
    expect(calendar.view.currentEnd).toEqualDate('2024-01-01')
  })

  it('can have custom duration', () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonth',
      duration: { months: 2 },
    })

    expect(calendar.view.currentStart).toEqualDate('2023-06-01')
    expect(calendar.view.currentEnd).toEqualDate('2023-08-01')
  })

  it('having small multiMonthMinWidth results in side-by-side months', () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
      multiMonthMinWidth: 100,
    })

    const monthWrappers = new MultiMonthViewWrapper(calendar).getMonths()
    expect(monthWrappers.length).toBe(12)
    expect(monthWrappers[0].el).toBeLeftOf(monthWrappers[1].el)
  })

  it('having large multiMonthMinWidth results in stacking months', () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
      multiMonthMinWidth: 600,
    })

    const monthWrappers = new MultiMonthViewWrapper(calendar).getMonths()
    expect(monthWrappers.length).toBe(12)
    expect(monthWrappers[0].el).not.toBeLeftOf(monthWrappers[1].el)
    expect(monthWrappers[0].el).toBeAbove(monthWrappers[1].el)
  })

  it('can have forced single column with multiMonthMaxColumns', () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
      multiMonthMaxColumns: 1,
    })

    const monthWrappers = new MultiMonthViewWrapper(calendar).getMonths()
    expect(monthWrappers[0].el).not.toBeLeftOf(monthWrappers[1].el)
    expect(monthWrappers[0].el).toBeAbove(monthWrappers[1].el)
  })

  it('is scrolled to current date initially', () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
      multiMonthMaxColumns: 1,
    })

    const viewWrapper = new MultiMonthViewWrapper(calendar)
    const monthWrappers = viewWrapper.getMonths()
    const scrollerEl = viewWrapper.getScrollerEl()

    expect(
      Math.abs(
        scrollerEl.getBoundingClientRect().top -
        monthWrappers[5].el.getBoundingClientRect().top,
      ),
    ).toBeLessThan(2)

    expect(scrollerEl.scrollTop).not.toBe(0)
    calendar.next()
    calendar.prev()
    expect(scrollerEl.scrollTop).toBe(0)
  })

  it('renders events when weekends: false', () => {
    const calendar = initCalendar({
      initialDate: '2023-01-25',
      initialView: 'multiMonthYear',
      weekends: false,
      events: [
        {
          title: 'Conference',
          start: '2023-01-11',
          end: '2023-01-13',
        },
      ],
    })

    const viewWrapper = new MultiMonthViewWrapper(calendar)
    const monthWrappers = viewWrapper.getMonths()
    expect(monthWrappers.length).toBe(12)
    expect(monthWrappers[0].columnCnt).toBe(5)
    expect(viewWrapper.getEventEls().length).toBe(1)
  })

  it('has customizable multiMonthTitleFormat', () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
      multiMonthTitleFormat: { month: 'short', year: 'numeric' },
    })

    const monthWrappers = new MultiMonthViewWrapper(calendar).getMonths()
    expect(monthWrappers[0].title).toBe('Jan 2023')
  })

  it('does not accidentally render month-start within cells', () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
      multiMonthTitleFormat: { month: 'short', year: 'numeric' },
    })

    const viewWrapper = new MultiMonthViewWrapper(calendar)
    expect(viewWrapper.el.querySelectorAll('.fc-daygrid-month-start').length).toBe(0)
  })
})
