import { describe, expect, it } from 'vitest'
import { EventInput } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getRenderedEventTitles } from '../lib/event-sources'

type SuccessCallback = (events: EventInput[]) => void

/*
Fetching while navigating between dates.
*/
describe('event fetching while navigating', () => {
  // https://github.com/fullcalendar/fullcalendar/issues/4975
  it('renders the current range\'s events when a fetch for a range navigated away from finishes late', async () => {
    const fetches: { startStr: string, respond: () => void }[] = []
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2020-02-11',
      events(info, callback: SuccessCallback) {
        const title = info.startStr.startsWith('2020-01-26') ? 'feb' : 'mar'
        const start = title === 'feb' ? '2020-02-15' : '2020-03-15' // mid-month, so only in one range
        fetches.push({ startStr: info.startStr, respond: () => callback([{ title, start }]) })
      },
    })
    fetches[0].respond()
    await waitForSettle()
    expect(getRenderedEventTitles(calendar.el)).toEqual(['feb'])

    calendar.next()
    calendar.prev() // before March's fetch finishes
    expect(fetches.map((fetch) => fetch.startStr)).toEqual([
      '2020-01-26T00:00:00Z',
      '2020-03-01T00:00:00Z',
      '2020-01-26T00:00:00Z',
    ])

    fetches[1].respond() // March's, now stale
    fetches[2].respond()
    await waitForSettle()

    expect(getEventEls(calendar.el)).toHaveLength(1)
    expect(getRenderedEventTitles(calendar.el)).toEqual(['feb'])
  })
})
