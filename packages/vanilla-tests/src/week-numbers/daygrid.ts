import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { DayGridModel } from '../lib/models/day-grid'
import { queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

describe('week numbers in dayGrid', () => {
  it.each([
    [{}, []], // the default: false
    [{ weekNumbers: false }, []],
    [{ weekNumbers: true }, ['W18', 'W19', 'W20', 'W21', 'W22', 'W23']],
  ])('with %j, labels the month view\'s rows %j', async (options, texts) => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2014-05-01', fixedWeekCount: true, ...options })
    await waitForSettle()

    expect(queryParts(calendar.el, 'dayRow').length).toBe(6)
    expect(queryParts(calendar.el, 'inlineWeekNumber').map((el) => el.textContent)).toEqual(texts)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5708
  it('don\'t push down the events of the row\'s first day', async () => {
    const calendar = initCalendar({
      initialView: 'dayGridWeek',
      initialDate: '2020-08-07',
      weekNumbers: true,
      events: [
        { id: '1', title: 'Event 1', start: '2020-08-02' },
        { id: '2', title: 'Event 2', start: '2020-08-03' },
      ],
    })
    await waitForSettle()

    const model = new DayGridModel(calendar.el)
    const [eventEl1] = model.getEventEls('1')
    const [eventEl2] = model.getEventEls('2')
    expect(Math.abs(eventEl1.getBoundingClientRect().top - eventEl2.getBoundingClientRect().top)).toBeLessThan(1)
  })
})
