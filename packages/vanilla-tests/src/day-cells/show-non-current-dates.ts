import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { waitForSettle } from '../lib/settle'
import { getDatedDays, getDayRange } from '../lib/dated-days'

describe('showNonCurrentDates: false', () => {
  it('leaves out other months\' days in month view', async () => {
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2017-06-01',
      showNonCurrentDates: false,
    })
    await waitForSettle()

    expect(getDatedDays(calendar.el)).toEqual(getDayRange('2017-06-01', '2017-07-01'))
  })

  it('has no effect in week view', async () => {
    const calendar = initCalendar({
      initialView: 'timeGridWeek',
      initialDate: '2017-06-01',
      showNonCurrentDates: false,
    })
    await waitForSettle()

    expect(getDatedDays(calendar.el)).toEqual(getDayRange('2017-05-28', '2017-06-04'))
  })

  it('works when disabling weekends and switching views', async () => {
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2019-06-07', // only shows the problem when the start date is a weekend
      showNonCurrentDates: false,
      weekends: false,
    })
    await waitForSettle()

    calendar.next()
    calendar.setOption('weekends', true)
    await waitForSettle()

    expect(getDatedDays(calendar.el)).toEqual(getDayRange('2019-07-01', '2019-08-01'))
  })

  it('works when switching from a view with the same duration but a different rendered range', async () => {
    const calendar = initCalendar({
      initialView: 'listMonth',
      initialDate: '2019-01-01',
      showNonCurrentDates: false,
    })
    await waitForSettle()

    calendar.changeView('dayGridMonth')
    await waitForSettle()

    expect(getDatedDays(calendar.el)).toEqual(getDayRange('2019-01-01', '2019-02-01'))
  })
})
