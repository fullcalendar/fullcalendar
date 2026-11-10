import { describe, expect, it } from 'vitest'
import { Calendar, CalendarOptions } from 'fullcalendar'
import { appendTestElement, createCalendarElement, initCalendar } from '../lib/calendar'
import { queryPart, queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

function repeatEvent(start: string, times: number, title = 'event') {
  return Array.from({ length: times }, () => ({ title, start }))
}

// 9 events in each week of an August 2014 month view
const MANY_ROWS_OF_EVENTS = [
  '2014-07-28', '2014-08-04', '2014-08-11', '2014-08-18', '2014-08-25', '2014-09-01',
].flatMap((start) => repeatEvent(start, 9))

// whether something inside the view scrolls vertically
function hasVerticalScroll(calendar: Calendar): boolean {
  const viewEl = queryPart(calendar.el, 'view')!
  return Array.from(viewEl.querySelectorAll<HTMLElement>('*')).some((el) => {
    const { overflowY } = getComputedStyle(el)
    return (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1
  })
}

describe.each(['height', 'contentHeight'] as const)('%s', (heightProp) => {
  // height sizes the whole calendar. contentHeight sizes the view
  function getSizedEl(calendar: Calendar): HTMLElement {
    return heightProp === 'height' ? calendar.el : queryPart(calendar.el, 'view')!
  }

  async function init(heightVal: CalendarOptions['height'], options: CalendarOptions, asSetOption = false): Promise<Calendar> {
    const el = createCalendarElement()
    el.style.width = '900px'

    let calendar: Calendar
    if (asSetOption) {
      calendar = initCalendar({ initialDate: '2014-08-01', ...options }, el)
      await waitForSettle()
      const firstCellEl = queryPart(calendar.el, 'dayCell')
      calendar.setOption(heightProp, heightVal)
      await waitForSettle()
      expect(queryPart(calendar.el, 'dayCell')).toBe(firstCellEl) // resized, not rerendered
    } else {
      calendar = initCalendar({ initialDate: '2014-08-01', ...options, [heightProp]: heightVal }, el)
      await waitForSettle()
    }
    return calendar
  }

  function expectHeight(calendar: Calendar, expected: number): void {
    expect(Math.abs(getSizedEl(calendar).getBoundingClientRect().height - expected)).toBeLessThan(2)
  }

  describe.each([
    ['as an init option', false],
    ['set after init', true],
  ])('%s', (_desc, asSetOption) => {
    it.each([
      ['dayGridMonth', 'no events', {}, false],
      ['dayGridMonth', 'many rows of events', { events: MANY_ROWS_OF_EVENTS }, true],
      ['dayGridWeek', 'no events', {}, false],
      ['dayGridDay', 'many events', { events: repeatEvent('2014-08-01', 100) }, true],
      ['timeGridWeek', 'all the slots', { slotMinTime: '00:00', slotMaxTime: '24:00' }, true],
      ['timeGridDay', 'all-day events and all the slots', { events: repeatEvent('2014-08-01', 6) }, true],
    ])('in %s with %s, as a number, is exact and scrolls: %s', async (initialView, _desc, options, expectScroll) => {
      const calendar = await init(600, { initialView, ...options }, asSetOption)

      expectHeight(calendar, 600)
      expect(hasVerticalScroll(calendar)).toBe(expectScroll)
    })

    it.each([
      ['dayGridMonth', 'many rows of events', { events: MANY_ROWS_OF_EVENTS }, 1000],
      ['dayGridWeek', 'many events', { events: repeatEvent('2014-08-01', 100) }, 1000],
      ['timeGridWeek', 'all the slots', { slotMinTime: '00:00', slotMaxTime: '24:00' }, 900],
    ])('in %s with %s, as "auto", grows without scrolling', async (initialView, _desc, options, minHeight) => {
      const calendar = await init('auto', { initialView, ...options }, asSetOption)

      expect(getSizedEl(calendar).getBoundingClientRect().height).toBeGreaterThan(minHeight)
      expect(hasVerticalScroll(calendar)).toBe(false)
    })
  })

  it('as "auto" with only a few slots, is short', async () => {
    const calendar = await init('auto', { initialView: 'timeGridWeek', slotMinTime: '06:00', slotMaxTime: '10:00' })

    expect(getSizedEl(calendar).getBoundingClientRect().height).toBeLessThan(500)
    expect(hasVerticalScroll(calendar)).toBe(false)
  })

  it('in month view, takes height from other rows for a tall row, without scrolling', async () => {
    const calendar = await init(600, { initialView: 'dayGridMonth', events: repeatEvent('2014-08-04', 9) })

    expectHeight(calendar, 600)
    const rowHeights = queryParts(calendar.el, 'dayRow').map((el) => el.getBoundingClientRect().height)
    const [tallRowHeight] = rowHeights.splice(1, 1)
    for (const rowHeight of rowHeights) {
      expect(Math.abs(rowHeight - rowHeights[0])).toBeLessThan(10) // the others are about the same
    }
    expect(tallRowHeight).toBeGreaterThan(rowHeights[0] * 2)
    expect(hasVerticalScroll(calendar)).toBe(false)
  })
})

describe('height', () => {
  it.each([
    ['as an init option', false],
    ['set after init', true],
  ])('as "100%%", fills the container, %s', async (_desc, asSetOption) => {
    const containerEl = appendTestElement(document.createElement('div'))
    containerEl.style.height = '600px'
    const calendarEl = containerEl.appendChild(document.createElement('div'))
    calendarEl.style.width = '900px'

    const options = { initialView: 'dayGridMonth', initialDate: '2014-08-01' }
    let calendar: Calendar
    if (asSetOption) {
      calendar = initCalendar(options, calendarEl)
      await waitForSettle()
      // sized by aspectRatio at first
      expect(Math.abs(calendar.el.getBoundingClientRect().height - 600)).toBeGreaterThan(20)
      const firstCellEl = queryPart(calendar.el, 'dayCell')

      calendar.setOption('height', '100%')
      await waitForSettle()
      expect(queryPart(calendar.el, 'dayCell')).toBe(firstCellEl) // resized, not rerendered
    } else {
      calendar = initCalendar({ ...options, height: '100%' }, calendarEl)
      await waitForSettle()
    }

    expect(Math.abs(calendar.el.getBoundingClientRect().height - 600)).toBeLessThan(2)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/6034
  it('as a view-specific "auto" in timeGrid, isn\'t squished by aspectRatio', async () => {
    const calendar = initCalendar({
      initialView: 'timeGridWeek',
      aspectRatio: 1.8,
      views: {
        timeGrid: { height: 'auto' },
      },
    })
    await waitForSettle()

    const slotLaneEls = queryParts(calendar.el, 'slotLane')
    const firstRect = slotLaneEls[0].getBoundingClientRect()
    const lastRect = slotLaneEls[slotLaneEls.length - 1].getBoundingClientRect()
    expect(lastRect.bottom - firstRect.top).toBeGreaterThan(900) // all the slots at their natural height
    expect(hasVerticalScroll(calendar)).toBe(false)
  })

  it('doesn\'t oscillate in a scrolling container near the scrollbar threshold', async () => {
    const containerEl = appendTestElement(document.createElement('div'))
    containerEl.style.cssText = 'width:301px;height:300px;overflow-y:auto'
    const calendarEl = containerEl.appendChild(document.createElement('div'))
    calendarEl.style.margin = '0'

    // used to resize in a loop forever
    const calendar = initCalendar({ headerToolbar: false, initialView: 'dayGridMonth', aspectRatio: 1 }, calendarEl)
    await waitForSettle()

    expect(queryParts(calendar.el, 'dayRow')).toHaveLength(6)
  })
})
