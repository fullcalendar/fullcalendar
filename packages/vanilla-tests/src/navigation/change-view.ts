import { describe, expect, it } from 'vitest'
import { Calendar } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { getEventEls, queryParts } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'
import { getActiveRange } from '../lib/view-dates'

describe('changeView', () => {
  const options = { initialView: 'dayGridMonth', initialDate: '2017-06-08' }

  it.each([
    ['only a view', ['timeGridWeek'], ['2017-06-04', '2017-06-11']],
    ['a view and a date', ['timeGridDay', '2017-06-26'], ['2017-06-26', '2017-06-27']],
    ['a view and a range', ['timeGrid', { start: '2017-07-04', end: '2017-07-08' }], ['2017-07-04', '2017-07-08']],
  ])('changes the view given %s', async (_desc, args, expectedRange) => {
    const calendar = initCalendar(options)
    await waitForSettle()

    calendar.changeView(...(args as [string, any?]))
    await waitForSettle()

    expect(calendar.view.type).toBe(args[0])
    expect(getActiveRange(calendar)).toEqual(expectedRange)
  })

  it('renders each view fully when switching away and back', async () => {
    const calendar = initCalendar({
      ...options,
      events: [{ id: 'a', start: '2017-06-08T10:00:00', title: 'event' }],
    })
    await waitForSettle()
    expectView(calendar, 'dayGridMonth', 42)

    calendar.changeView('timeGridWeek')
    await waitForSettle()
    expectView(calendar, 'timeGridWeek', 7)
    expect(queryParts(calendar.el, 'dayLane')).toHaveLength(7)

    calendar.changeView('dayGridWeek')
    await waitForSettle()
    expectView(calendar, 'dayGridWeek', 7)

    calendar.changeView('listWeek')
    await waitForSettle()
    expect(calendar.view.type).toBe('listWeek')
    expect(queryParts(calendar.el, 'view')).toHaveLength(1)
    expect(queryParts(calendar.el, 'listDay')).toHaveLength(1)
    expect(getEventEls(calendar.el, 'a')).toHaveLength(1)

    calendar.changeView('dayGridMonth')
    await waitForSettle()
    expectView(calendar, 'dayGridMonth', 42)
  })

  function expectView(calendar: Calendar, viewType: string, dayCellCount: number): void {
    expect(calendar.view.type).toBe(viewType)
    expect(queryParts(calendar.el, 'view')).toHaveLength(1)
    expect(queryParts(calendar.el, 'dayCell')).toHaveLength(dayCellCount)
    expect(getEventEls(calendar.el, 'a')).toHaveLength(1)
  }

  // https://github.com/fullcalendar/fullcalendar/issues/3689
  it('can switch views while events are loading', async () => {
    const fetchCallbacks: (() => void)[] = []
    const calendar = initCalendar({
      initialView: 'timeGridDay',
      initialDate: '2017-06-08',
      events(_info, successCallback) {
        // timed, which used to cause the error
        fetchCallbacks.push(() => successCallback([{ id: 'a', start: '2017-06-08T01:00:00' }]))
      },
    })
    await waitForSettle()

    calendar.changeView('dayGridDay')
    await waitForSettle()
    expect(calendar.view.type).toBe('dayGridDay')

    for (const callback of fetchCallbacks) { // the events arrive after the first switch
      callback()
    }
    await waitForSettle()
    expect(getEventEls(calendar.el, 'a')).toHaveLength(1)

    calendar.changeView('timeGridDay')
    await waitForSettle()
    expect(calendar.view.type).toBe('timeGridDay')
    expect(getEventEls(calendar.el, 'a')).toHaveLength(1)
  })
})
