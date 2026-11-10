import { describe, expect, it, vi } from 'vitest'
import { EventInput } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { waitForSettle } from '../lib/settle'

type SuccessCallback = (events: EventInput[]) => void

/*
Whether navigating within already-fetched dates fetches again.
*/
describe('lazyFetching', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2017-10-04', // the month shows Oct 1 - Nov 12
  }

  async function navigateWeeks(lazyFetching: boolean) {
    const events = vi.fn((_info, callback: SuccessCallback) => callback([]))
    const calendar = initCalendar({ ...options, lazyFetching, events })
    await waitForSettle()

    calendar.changeView('timeGridWeek')
    for (let i = 0; i < 3; i++) {
      calendar.next()
    }
    await waitForSettle()

    return events.mock.calls.map(([info]) => [info.startStr, info.endStr])
  }

  it('when on, doesn\'t fetch weeks within the range already fetched', async () => {
    expect(await navigateWeeks(true)).toEqual([
      ['2017-10-01T00:00:00Z', '2017-11-12T00:00:00Z'],
    ])
  })

  it('when on, fetches a week beyond the range already fetched', async () => {
    const events = vi.fn((_info, callback: SuccessCallback) => callback([]))
    const calendar = initCalendar({ ...options, lazyFetching: true, events })
    await waitForSettle()

    calendar.changeView('timeGridWeek')
    calendar.gotoDate('2017-11-08') // the last week within the fetched range
    await waitForSettle()
    calendar.next()
    await waitForSettle()

    expect(events.mock.calls.map(([info]) => [info.startStr, info.endStr])).toEqual([
      ['2017-10-01T00:00:00Z', '2017-11-12T00:00:00Z'],
      ['2017-11-12T00:00:00Z', '2017-11-19T00:00:00Z'],
    ])
  })

  it('when off, fetches each week', async () => {
    expect(await navigateWeeks(false)).toEqual([
      ['2017-10-01T00:00:00Z', '2017-11-12T00:00:00Z'],
      ['2017-10-01T00:00:00Z', '2017-10-08T00:00:00Z'],
      ['2017-10-08T00:00:00Z', '2017-10-15T00:00:00Z'],
      ['2017-10-15T00:00:00Z', '2017-10-22T00:00:00Z'],
      ['2017-10-22T00:00:00Z', '2017-10-29T00:00:00Z'],
    ])
  })
})
