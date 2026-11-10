import { describe, expect, it, vi } from 'vitest'
import { DayHeaderInfo } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getVisibleText } from '../lib/text'

/*
The latest render's info for each weekday, in weekday order.
*/
function getLatestInfosByDow(calls: [DayHeaderInfo][]): DayHeaderInfo[] {
  const infosByDow = new Map<number, DayHeaderInfo>()

  for (const [info] of calls) {
    infosByDow.set(info.dow, info)
  }
  return [...infosByDow.keys()].sort().map((dow) => infosByDow.get(dow)!)
}

describe('dayHeaderContent', () => {
  const initialDate = '2014-05-11' // a Sunday

  it.each(['dayGridMonth', 'timeGridDay'])('renders html in %s', async (initialView) => {
    const calendar = initCalendar({
      initialView,
      initialDate,
      dayHeaderContent: (info) => ({
        html: '<div class="custom">' + info.view.calendar.formatDate(info.date, { weekday: 'long' }) + '</div>',
      }),
    })
    await waitForSettle()

    const headerEl = queryParts(calendar.el, 'dayHeader')[0]
    const customEls = headerEl.querySelectorAll('.custom')
    expect(customEls.length).toBe(1)
    expect(customEls[0].textContent).toBe('Sunday')
  })

  it.each(['dayGridMonth', 'timeGridDay'])('escapes a returned string in %s', async (initialView) => {
    const calendar = initCalendar({
      initialView,
      initialDate,
      dayHeaderContent: (info) => '<div>Custom ' + info.view.calendar.formatDate(info.date, { weekday: 'long' }) + '</div>',
    })
    await waitForSettle()

    const headerEl = queryParts(calendar.el, 'dayHeader')[0]
    expect(getVisibleText(headerEl)).toBe('<div>Custom Sunday</div>')
  })

  it.each([
    ['UTC', new Date('2014-05-11T00:00:00Z')],
    ['local', new Date(2014, 4, 11)],
  ])('receives the header\'s date in the %s time zone', async (timeZone, expectedDate) => {
    const dayHeaderContent = vi.fn((_info: DayHeaderInfo) => undefined)
    initCalendar({ initialView: 'timeGridDay', initialDate, timeZone, dayHeaderContent })
    await waitForSettle()

    expect(dayHeaderContent).toHaveBeenCalled()
    for (const [info] of dayHeaderContent.mock.calls) {
      expect(info.date).toEqual(expectedDate)
    }
  })

  it('receives the month of a dated header as monthText', async () => {
    const dayHeaderContent = vi.fn((info: DayHeaderInfo) => info.text)
    initCalendar({
      initialView: 'timeGridDay',
      initialDate,
      dayHeaderFormat: { weekday: 'short', month: 'short', day: 'numeric' },
      dayHeaderContent,
    })
    await waitForSettle()

    const info = dayHeaderContent.mock.calls[0][0]
    expect(info.weekdayText).toBe('Sun')
    expect(info.dayNumberText).toBe('11')
    expect(info.monthText).toBe('May')
  })

  // https://github.com/fullcalendar/fullcalendar/issues/7468
  describe('in a month view, where headers name only the weekday', () => {
    it.each([
      // the first row is 2014-04-27 (Sun) to 2014-05-03 (Sat)
      ['UTC', '2014-04-27T00:00:00Z'],
      ['America/New_York', '2014-04-27T04:00:00Z'], // west of UTC
      ['Asia/Tokyo', '2014-04-26T15:00:00Z'], // east of UTC
    ])('receives a day in view at midnight in the %s time zone', async (timeZone, firstMidnight) => {
      const dayHeaderContent = vi.fn((info: DayHeaderInfo) => info.text)
      const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate, timeZone, dayHeaderContent })
      await waitForSettle()

      const infos = getLatestInfosByDow(dayHeaderContent.mock.calls)
      const firstMs = new Date(firstMidnight).valueOf()

      expect(infos.map((info) => info.dow)).toEqual([0, 1, 2, 3, 4, 5, 6])
      expect(infos.map((info) => info.date.valueOf())).toEqual(
        infos.map((_info, i) => firstMs + i * 86400000),
      )
      expect(infos.map((info) => calendar.formatDate(info.date, { weekday: 'short' }))).toEqual(
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      )
      expect(queryParts(calendar.el, 'dayHeader').map(getVisibleText)).toEqual(
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      )
    })

    it('gets no day number or month from its date, even when the format has them', async () => {
      const dayHeaderContent = vi.fn((info: DayHeaderInfo) => info.text)
      initCalendar({
        initialView: 'dayGridMonth',
        initialDate,
        dayHeaderFormat: { weekday: 'short', month: 'short', day: 'numeric' },
        dayHeaderContent,
      })
      await waitForSettle()

      const info = dayHeaderContent.mock.calls[0][0]
      expect(info.weekdayText).toBe('Sun')
      expect(info.dayNumberText).toBe('')
      expect(info.monthText).toBe('')
    })

    it('receives the first row\'s days, skipping hidden days', async () => {
      const dayHeaderContent = vi.fn((_info: DayHeaderInfo) => undefined)
      initCalendar({ initialView: 'dayGridMonth', initialDate, hiddenDays: [0, 6], dayHeaderContent })
      await waitForSettle()

      const infos = getLatestInfosByDow(dayHeaderContent.mock.calls)

      expect(infos.map((info) => info.date.toISOString().slice(0, 10))).toEqual(
        ['2014-04-28', '2014-04-29', '2014-04-30', '2014-05-01', '2014-05-02'],
      )
    })
  })
})
