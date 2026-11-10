import { describe, expect, it } from 'vitest'
import { Calendar, CalendarOptions } from 'fullcalendar'
import { strictModeFactor } from 'fullcalendar/protected-api'
import { initCalendar } from '../lib/calendar'
import { getEventEls, queryPart } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
How many times content hooks rerun on navigation, view switches and container resizes. Guards
against needless rerendering.
*/
describe('rerender counts', () => {
  function countHooks<Name extends string>(hookNames: Name[]): {
    counts: Record<Name, number>
    options: CalendarOptions
    reset: () => void
  } {
    const counts = {} as Record<Name, number>
    const options: CalendarOptions = {}
    const optionsByName = options as Record<string, unknown>

    for (const hookName of hookNames) {
      counts[hookName] = 0
      optionsByName[hookName] = () => {
        counts[hookName] += 1
        return hookName.endsWith('Content') ? true : undefined // true: render the default content
      }
    }

    return {
      counts,
      options,
      reset() {
        for (const hookName of hookNames) {
          counts[hookName] = 0
        }
      },
    }
  }

  // ex: { a: 2 } -> { a: 2 * strictModeFactor }. mounting is doubled by StrictMode
  function mounted<Counts extends Record<string, number>>(counts: Counts): Counts {
    return Object.fromEntries(Object.entries(counts).map(([key, n]) => [key, n * strictModeFactor])) as Counts
  }

  // back to the event's dates, so the resize has an event that could rerender
  async function returnToEvent(calendar: Calendar): Promise<void> {
    calendar.prev()
    await waitForSettle()
    expect(getEventEls(calendar.el)).toHaveLength(1)
  }

  // the anchor for "no rerenders": the view really does get narrower
  async function resizeContainer(calendar: Calendar): Promise<void> {
    const viewEl = queryPart(calendar.el, 'view')!
    expect(viewEl.getBoundingClientRect().width).toBe(900)

    calendar.el.style.width = '700px'
    await waitForSettle()

    expect(viewEl.getBoundingClientRect().width).toBe(700)
    expect(getEventEls(calendar.el)).toHaveLength(1) // still rendered
  }

  it('in dayGrid month view', async () => {
    const hooks = countHooks(['dayHeaderContent', 'dayCellTopContent', 'eventContent'])
    const calendar = initCalendar({
      ...hooks.options,
      initialView: 'dayGridMonth',
      initialDate: '2017-10-04',
      events: [{ title: 'event 0', start: '2017-10-04' }],
    })
    await waitForSettle()
    expect(hooks.counts).toEqual(mounted({ dayHeaderContent: 7, dayCellTopContent: 42, eventContent: 1 }))

    hooks.reset()
    calendar.next()
    await waitForSettle()
    // the same day-of-week headers, and the event is out of view
    expect(hooks.counts).toEqual({ dayHeaderContent: 0, dayCellTopContent: 42 * strictModeFactor, eventContent: 0 })

    calendar.changeView('listWeek')
    await waitForSettle()
    hooks.reset()
    calendar.changeView('dayGridMonth')
    await waitForSettle()
    expect(hooks.counts).toEqual(mounted({ dayHeaderContent: 7, dayCellTopContent: 42, eventContent: 0 }))

    await returnToEvent(calendar)
    hooks.reset()
    await resizeContainer(calendar)
    expect(hooks.counts).toEqual({ dayHeaderContent: 0, dayCellTopContent: 0, eventContent: 0 })
  })

  it('in timeGrid week view', async () => {
    const hooks = countHooks([
      'dayHeaderContent', 'dayCellDidMount', 'dayLaneDidMount', 'slotHeaderContent', 'slotLaneDidMount', 'eventContent',
    ])
    const calendar = initCalendar({
      ...hooks.options,
      initialView: 'timeGridWeek',
      initialDate: '2017-10-04',
      events: [{ title: 'event 0', start: '2017-10-04T00:00:00' }],
    })
    await waitForSettle()
    const viewCounts = {
      dayHeaderContent: 7,
      dayCellDidMount: 7,
      dayLaneDidMount: 7,
      slotHeaderContent: 24, // one label per two slots
      slotLaneDidMount: 48,
    }
    expect(hooks.counts).toEqual(mounted({ ...viewCounts, eventContent: 1 }))

    hooks.reset()
    calendar.next()
    await waitForSettle()
    // the dated parts rerender, the slots don't, and the event is out of view
    expect(hooks.counts).toEqual(mounted({
      ...viewCounts, slotHeaderContent: 0, slotLaneDidMount: 0, eventContent: 0,
    }))

    calendar.changeView('listWeek')
    await waitForSettle()
    hooks.reset()
    calendar.changeView('timeGridWeek')
    await waitForSettle()
    expect(hooks.counts).toEqual(mounted({ ...viewCounts, eventContent: 0 }))

    await returnToEvent(calendar)
    hooks.reset()
    await resizeContainer(calendar)
    expect(hooks.counts).toEqual({
      dayHeaderContent: 0, dayCellDidMount: 0, dayLaneDidMount: 0, slotHeaderContent: 0, slotLaneDidMount: 0, eventContent: 0,
    })
  })

  it('in list week view', async () => {
    const hooks = countHooks(['listDayHeaderContent', 'eventContent', 'noEventsContent'])
    const calendar = initCalendar({
      ...hooks.options,
      initialView: 'listWeek',
      initialDate: '2017-10-04',
      events: [{ title: 'event 0', start: '2017-10-04' }],
    })
    await waitForSettle()
    // a day header has two content parts (weekday and date)
    expect(hooks.counts).toEqual(mounted({ listDayHeaderContent: 2, eventContent: 1, noEventsContent: 0 }))

    hooks.reset()
    calendar.next()
    await waitForSettle()
    expect(hooks.counts).toEqual(mounted({ listDayHeaderContent: 0, eventContent: 0, noEventsContent: 1 }))

    calendar.changeView('dayGridWeek')
    await waitForSettle()
    hooks.reset()
    calendar.changeView('listWeek')
    await waitForSettle()
    expect(hooks.counts).toEqual(mounted({ listDayHeaderContent: 0, eventContent: 0, noEventsContent: 1 }))

    await returnToEvent(calendar)
    hooks.reset()
    await resizeContainer(calendar)
    expect(hooks.counts).toEqual({ listDayHeaderContent: 0, eventContent: 0, noEventsContent: 0 })
  })
})
