import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { getEventIdOfEl, queryParts } from '../lib/models/events'
import { getVisibleEventEls } from '../lib/models/event-content'
import { waitForSettle } from '../lib/settle'

/*
Printed pages follow DOM order, so events must be in DOM order by start time, even when they're
positioned absolutely on screen.
*/
describe('event DOM order for printing', () => {
  const options = {
    initialDate: '2019-04-08',
    scrollTime: '00:00',
    events: [
      { id: '2', start: '2019-04-08T05:00:00' },
      { id: '1', start: '2019-04-08T01:00:00' },
    ],
  }

  it.each([
    { view: 'timeGridDay' },
    { view: 'dayGridDay' },
  ])('orders events by start time in $view', async ({ view }) => {
    const calendar = initCalendar({ ...options, initialView: view })
    await waitForSettle()

    expect(getVisibleEventEls(calendar.el).map(getEventIdOfEl)).toEqual(['1', '2'])
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5709
  it.each([
    { view: 'timeGridWeek' },
    { view: 'dayGridDay' },
  ])('orders events by start time while printing in $view', async ({ view }) => {
    const calendar = initCalendar({ ...options, initialView: view })
    await waitForSettle()

    calendar.trigger('_beforeprint')
    await waitForSettle()

    expect(getVisibleEventEls(calendar.el).map(getEventIdOfEl)).toEqual(['1', '2'])
  })
})

/*
While printing, dayGrid renders a real <table>, which takes over tableClass and the table part from
the screen layout's container.
*/
describe('dayGrid table while printing', () => {
  it('has one table part, the printed table, with tableClass', async () => {
    const calendar = initCalendar({ initialView: 'dayGridMonth', initialDate: '2019-04-08', tableClass: 'my-table' })
    await waitForSettle()

    calendar.trigger('_beforeprint')
    await waitForSettle()

    const tableEls = queryParts(calendar.el, 'table')
    expect(tableEls.map((el) => el.tagName)).toEqual(['TABLE'])
    expect(tableEls[0].classList).toContain('my-table')
    expect(calendar.el.querySelectorAll('.my-table')).toHaveLength(1)
  })
})
