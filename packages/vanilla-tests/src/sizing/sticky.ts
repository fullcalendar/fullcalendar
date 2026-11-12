import { describe, expect, it, onTestFinished } from 'vitest'
import { Calendar, CalendarOptions } from 'fullcalendar'
import { appendTestElement, createCalendarElement, initCalendar } from '../lib/calendar'
import { queryPart, queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
Sticky headers: parts that stay at the top of their scroller while the content under them scrolls.
The footer scrollbar (footerScrollbarSticky) needs dayMinWidth, a premium feature:
SEE premium src/sizing/horizontal-scrolling.ts
*/

interface ScrollHost {
  calendarEl: HTMLElement
  scrollTo(top: number): void
  getScrollTop(): number
  getVisibleTop(): number // where the scroller's visible area starts, in client coordinates
}

/*
A calendar element inside something that scrolls vertically: the window or a short container.
A tall spacer after the calendar lets either scroll past the calendar's bottom.
*/
function createScrollHost(kind: 'window' | 'container'): ScrollHost {
  if (kind === 'window') {
    const calendarEl = createCalendarElement()
    const spacerEl = appendTestElement(document.createElement('div'))
    spacerEl.style.height = '2000px'
    onTestFinished(() => {
      window.scrollTo(0, 0)
    })
    return {
      calendarEl,
      scrollTo(top) {
        window.scrollTo(0, top)
      },
      getScrollTop: () => window.scrollY,
      getVisibleTop: () => 0,
    }
  }

  const containerEl = appendTestElement(document.createElement('div'))
  containerEl.style.height = '400px'
  containerEl.style.overflowY = 'auto'
  const calendarEl = containerEl.appendChild(document.createElement('div'))
  const spacerEl = containerEl.appendChild(document.createElement('div'))
  spacerEl.style.height = '1000px'
  return {
    calendarEl,
    scrollTo(top) {
      containerEl.scrollTop = top
    },
    getScrollTop: () => containerEl.scrollTop,
    getVisibleTop: () => containerEl.getBoundingClientRect().top + containerEl.clientTop,
  }
}

// the nearest ancestor that scrolls vertically
function getScrollerEl(el: HTMLElement): HTMLElement {
  for (let ancestor = el.parentElement; ancestor; ancestor = ancestor.parentElement) {
    const { overflowY } = getComputedStyle(ancestor)
    if ((overflowY === 'auto' || overflowY === 'scroll') && ancestor.scrollHeight > ancestor.clientHeight) {
      return ancestor
    }
  }
  throw new Error('No vertical scroller')
}

function getTop(el: HTMLElement): number {
  return el.getBoundingClientRect().top
}

describe('tableHeaderSticky', () => {
  const SCROLL_TOP = 300

  describe.each(['window', 'container'] as const)('when the %s scrolls', (hostKind) => {
    async function initScrolled(options: CalendarOptions): Promise<{ calendar: Calendar, host: ScrollHost, headerTopBefore: number }> {
      const host = createScrollHost(hostKind)
      const calendar = initCalendar({ initialDate: '2023-04-12', ...options }, host.calendarEl)
      await waitForSettle()

      // start the scroller at the calendar's top, so the header is in view
      host.scrollTo(Math.max(0, getTop(calendar.el) - host.getVisibleTop()))
      await waitForSettle()
      const scrollTopBefore = host.getScrollTop()
      const headerTopBefore = getTop(getDayHeader(calendar))

      host.scrollTo(scrollTopBefore + SCROLL_TOP)
      await waitForSettle()
      expect(host.getScrollTop()).toBe(scrollTopBefore + SCROLL_TOP) // the content really scrolled

      return { calendar, host, headerTopBefore }
    }

    function getDayHeader(calendar: Calendar): HTMLElement {
      return queryParts(calendar.el, 'dayHeader')[0]
    }

    it.each([
      ['dayGridMonth', 'height:auto', true, { height: 'auto' }],
      ['dayGridMonth', 'contentHeight:auto', true, { contentHeight: 'auto' }],
      ['dayGridMonth', 'height:auto and tableHeaderSticky:false', false, { height: 'auto', tableHeaderSticky: false }],
      ['dayGridMonth', 'a fixed height', false, { height: 1000 }],
      ['dayGridMonth', 'a fixed height and tableHeaderSticky:true', true, { height: 1000, tableHeaderSticky: true }],
      ['timeGridWeek', 'height:auto', true, { height: 'auto' }],
      ['timeGridWeek', 'height:auto and tableHeaderSticky:false', false, { height: 'auto', tableHeaderSticky: false }],
    ])('in %s with %s, keeps the day header at the top: %s', async (initialView, _desc, isSticky, extraOptions) => {
      const { calendar, host, headerTopBefore } = await initScrolled({ initialView, ...extraOptions })
      const headerTop = getTop(getDayHeader(calendar))

      if (isSticky) {
        expect(headerTop).toBeCloseTo(host.getVisibleTop(), 0)
      } else {
        expect(headerTop).toBeCloseTo(headerTopBefore - SCROLL_TOP, 0)
      }
      // either way, the days under the header scrolled
      expect(getTop(queryPart(calendar.el, 'tableBody')!)).toBeLessThan(host.getVisibleTop())
    })

    it('lets the header scroll away with the bottom of the calendar', async () => {
      const { calendar, host } = await initScrolled({ initialView: 'dayGridMonth', height: 'auto' })
      expect(getTop(getDayHeader(calendar))).toBeCloseTo(host.getVisibleTop(), 0) // stuck

      const viewRect = queryPart(calendar.el, 'view')!.getBoundingClientRect()
      host.scrollTo(host.getScrollTop() + (viewRect.bottom - host.getVisibleTop()) + 10) // past the view's bottom
      await waitForSettle()

      expect(getDayHeader(calendar).getBoundingClientRect().bottom).toBeLessThan(host.getVisibleTop())
    })
  })
})

describe('list view sticky day headers', () => {
  it('keeps the header of the day being scrolled through at the top of the list', async () => {
    const calendar = initCalendar({
      initialView: 'listMonth',
      initialDate: '2023-04-12',
      height: 400,
      events: Array.from({ length: 30 }, (_, i) => ({
        title: `event ${i + 1}`,
        start: `2023-04-${String(i + 1).padStart(2, '0')}T10:00:00`,
      })),
    })
    await waitForSettle()

    const dayEls = queryParts(calendar.el, 'listDay')
    const dayHeaderEls = queryParts(calendar.el, 'listDayHeader')
    expect(dayEls).toHaveLength(30)
    const scrollerEl = getScrollerEl(dayEls[0])
    const scrollerTop = scrollerEl.getBoundingClientRect().top + scrollerEl.clientTop

    // scroll a few pixels into the 10th day
    const dayOffset = getTop(dayEls[9]) - scrollerTop
    scrollerEl.scrollTop += dayOffset + 5
    await waitForSettle()

    expect(getTop(dayEls[9])).toBeCloseTo(scrollerTop - 5, 0) // the day really scrolled
    expect(getTop(dayHeaderEls[9])).toBeCloseTo(scrollerTop, 0) // but its header didn't
    expect(getTop(dayHeaderEls[10])).toBeCloseTo(getTop(dayEls[10]), 0) // the next day's header is in place
  })
})

describe('multiMonth sticky month headers', () => {
  it.each([
    ['a single column', 1, true],
    ['two columns', 2, false],
  ])('with %s, keeps the month title and day header at the top: %s', async (_desc, multiMonthMaxColumns, isSticky) => {
    const calendar = initCalendar({
      initialView: 'multiMonthYear',
      initialDate: '2023-04-12',
      multiMonthMaxColumns,
      height: 600,
    })
    await waitForSettle()

    const aprilEl = queryParts(calendar.el, 'singleMonth').find((el) => el.getAttribute('data-date') === '2023-04')!
    const titleEl = queryPart(aprilEl, 'singleMonthHeader')!
    const tableHeaderEl = queryPart(aprilEl, 'tableHeader')!
    const scrollerEl = getScrollerEl(aprilEl)
    const scrollerTop = scrollerEl.getBoundingClientRect().top + scrollerEl.clientTop
    const titleOffset = getTop(titleEl) - getTop(aprilEl)

    // scroll 100px into April
    scrollerEl.scrollTop += getTop(aprilEl) - scrollerTop + 100
    await waitForSettle()
    expect(getTop(aprilEl)).toBeCloseTo(scrollerTop - 100, 0) // the month really scrolled

    if (isSticky) {
      expect(getTop(titleEl)).toBeCloseTo(scrollerTop, 0)
      expect(getTop(tableHeaderEl)).toBeCloseTo(titleEl.getBoundingClientRect().bottom, 0)
    } else {
      expect(getTop(titleEl)).toBeCloseTo(getTop(aprilEl) + titleOffset, 0) // moved with the month
      expect(getTop(tableHeaderEl)).toBeLessThan(scrollerTop)
    }
  })
})
