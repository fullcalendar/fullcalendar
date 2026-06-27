import { MultiMonthViewWrapper } from '../lib/wrappers/MultiMonthViewWrapper'
import { ignoreResizeObserverLoops, waitTimeout } from '../lib/misc'
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

  it('having small singleMonthMinWidth results in side-by-side months', async () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
      singleMonthMinWidth: 100,
    })

    await waitTimeout()

    const monthWrappers = new MultiMonthViewWrapper(calendar).getMonths()
    expect(monthWrappers.length).toBe(12)
    expect(monthWrappers[0].el).toBeLeftOf(monthWrappers[1].el)
  })

  it('having large singleMonthMinWidth results in stacking months', async () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
      singleMonthMinWidth: 600,
    })

    await waitTimeout()

    const monthWrappers = new MultiMonthViewWrapper(calendar).getMonths()
    expect(monthWrappers.length).toBe(12)
    expect(monthWrappers[0].el).not.toBeLeftOf(monthWrappers[1].el)
    expect(monthWrappers[0].el).toBeAbove(monthWrappers[1].el)
  })

  it('can have forced single column with multiMonthMaxColumns', async () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
      multiMonthMaxColumns: 1,
    })

    await waitTimeout()

    const monthWrappers = new MultiMonthViewWrapper(calendar).getMonths()
    expect(monthWrappers[0].el).not.toBeLeftOf(monthWrappers[1].el)
    expect(monthWrappers[0].el).toBeAbove(monthWrappers[1].el)
  })

  it('is scrolled to current date initially', async () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
      multiMonthMaxColumns: 1,
    })

    await ignoreResizeObserverLoops(async () => {
      const viewWrapper = new MultiMonthViewWrapper(calendar)
      const monthWrappers = viewWrapper.getMonths()
      const scrollerEl = viewWrapper.getScrollerEl()

      await waitTimeout()
      expect(
        Math.abs(
          scrollerEl.getBoundingClientRect().top -
          monthWrappers[5].el.getBoundingClientRect().top,
        ),
      ).toBeLessThan(2)

      expect(scrollerEl.scrollTop).not.toBe(0)
      calendar.next()
      await waitTimeout()
      calendar.prev()
      await waitTimeout()

      expect(scrollerEl.scrollTop).toBe(0)
    })
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

  it('has customizable singleMonthTitleFormat', () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
      singleMonthTitleFormat: { month: 'short', year: 'numeric' },
    })

    const monthWrappers = new MultiMonthViewWrapper(calendar).getMonths()
    expect(monthWrappers[0].title).toBe('Jan 2023')
  })

  it('does not accidentally render month-start within cells', () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
      singleMonthTitleFormat: { month: 'short', year: 'numeric' },
    })

    const viewWrapper = new MultiMonthViewWrapper(calendar)
    expect(viewWrapper.el.querySelectorAll('.fc-daygrid-month-start').length).toBe(0)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/7287
  it('renders with validRange', () => {
    const calendar = initCalendar({
      initialDate: '2023-06-01',
      initialView: 'multiMonthYear',
      validRange: {
        start: '2023-04-01',
        end: '2023-09-01',
      },
    })

    // will be rendered, but many days will be greyed out as disabled
    expect(calendar.view.currentStart).toEqualDate('2023-01-01')
    expect(calendar.view.currentEnd).toEqualDate('2024-01-01')
  })
})
