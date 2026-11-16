import { describe, expect, it } from 'vitest'
import { createCalendarElement, initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { getCoveredDates, getMoreLinkEls, getVisibleEventEls } from '../lib/models/event-content'
import { waitForSettle } from '../lib/settle'

describe('multiMonth event rendering', () => {
  it('renders events in their months, over their days', async () => {
    const calendar = initCalendar({
      initialView: 'multiMonthYear',
      initialDate: '2024-01-15',
      events: [
        { id: 'jan', start: '2024-01-15', end: '2024-01-17' },
        { id: 'mar', start: '2024-03-08' },
      ],
    })
    await waitForSettle()

    const monthEls = queryParts(calendar.el, 'singleMonth')
    expect(monthEls.length).toBe(12)

    const janEventEls = getVisibleEventEls(monthEls[0])
    const marEventEls = getVisibleEventEls(monthEls[2])
    expect(janEventEls.map(getCoveredDates)).toEqual([['2024-01-15', '2024-01-16']])
    expect(marEventEls.map(getCoveredDates)).toEqual([['2024-03-08']])
    expect(getVisibleEventEls(monthEls[1]).length).toBe(0)
  })

  it('splits an event that crosses a month boundary between the two months', async () => {
    const calendar = initCalendar({
      initialView: 'multiMonthYear',
      initialDate: '2024-01-15',
      eventClass: (data) => [data.isStart && 'test-start', data.isEnd && 'test-end'].filter(Boolean).join(' '),
      events: [{ id: 'cross', start: '2024-01-31', end: '2024-02-02' }],
    })
    await waitForSettle()

    const monthEls = queryParts(calendar.el, 'singleMonth')
    const segs = [monthEls[0], monthEls[1]].map((monthEl) => getVisibleEventEls(monthEl).map((el) => ({
      dates: getCoveredDates(el),
      isStart: el.classList.contains('test-start'),
      isEnd: el.classList.contains('test-end'),
    })))
    expect(segs).toEqual([
      [{ dates: ['2024-01-31'], isStart: true, isEnd: false }],
      [{ dates: ['2024-02-01'], isStart: false, isEnd: true }],
    ])
    expect(getVisibleEventEls(calendar.el).length).toBe(2)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/7573
  it('doesn\'t wrongly put events under a +more link', async () => {
    const el = createCalendarElement()
    el.style.width = '1000px'
    el.style.maxWidth = '1000px'
    const calendar = initCalendar({
      initialView: 'multiMonthYear',
      initialDate: '2024-01-15',
      multiMonthMaxColumns: 2,
      events: [
        { title: 'event 1', start: '2024-01-15', end: '2024-01-20' },
        { title: 'event 2', start: '2024-01-15', end: '2024-01-20' },
        { title: 'event 3', start: '2024-01-15' },
      ],
    }, el)
    await waitForSettle()

    const janEl = queryParts(calendar.el, 'singleMonth')[0]
    expect(getVisibleEventEls(janEl).length).toBe(2)
    expect(getMoreLinkEls(janEl).map((moreLinkEl) => moreLinkEl.textContent)).toEqual(['+2 more'])
  })
})
