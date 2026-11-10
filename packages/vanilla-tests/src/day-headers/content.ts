import { describe, expect, it, vi } from 'vitest'
import { DayHeaderInfo } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getVisibleText } from '../lib/text'

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
})
