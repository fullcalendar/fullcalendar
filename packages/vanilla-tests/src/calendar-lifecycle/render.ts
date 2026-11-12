import { describe, expect, it } from 'vitest'
import { Calendar } from 'fullcalendar'
import dayGridPlugin from 'fullcalendar/daygrid'
import { initCalendar } from '../lib/calendar'
import { getEventEls, getEventIdOfEl, queryParts } from '../lib/models/events'
import { ToolbarModel } from '../lib/models/toolbar'
import { waitForSettle } from '../lib/settle'
import { hasPart } from '../lib/parts'

describe('constructor', () => {
  it.each([
    ['options', { initialView: 'timeGridWeek', scrollTime: '09:00:00', slotDuration: { minutes: 45 } }],
    ['the events array', {
      initialView: 'dayGridMonth',
      initialDate: '2014-05-27',
      events: [{ title: 'mytitle', start: '2014-05-27' }],
    }],
    ['the eventSources array', {
      initialView: 'dayGridMonth',
      initialDate: '2014-05-27',
      eventSources: [{ events: [{ title: 'mytitle', start: '2014-05-27' }] }],
    }],
  ])('doesn\'t modify the given %s', async (_desc, options) => {
    const optionsCopy = structuredClone(options)
    const calendar = initCalendar(options)
    await waitForSettle()

    expect(options).toEqual(optionsCopy)
    if ('initialDate' in options) {
      expect(getEventEls(calendar.el)).toHaveLength(1) // the events were used
    }
  })

  it('renders a toolbar and a view into the element', async () => {
    const calendar = initCalendar({ initialView: 'dayGridMonth' })
    await waitForSettle()

    expect(hasPart(calendar.el, 'root')).toBe(true)
    expect(ToolbarModel.header(calendar.el)).toBeTruthy()
    expect(queryParts(calendar.el, 'view')).toHaveLength(1)
    expect(queryParts(calendar.el, 'dayCell')).toHaveLength(42)
  })

  it('renders nothing until render() is called', async () => {
    const el = document.createElement('div')
    const calendar = new Calendar(el, { plugins: [dayGridPlugin], initialView: 'dayGridMonth' })

    expect(el.childNodes).toHaveLength(0)
    expect(calendar.view.type).toBe('dayGridMonth') // the calendar's data is ready, though
  })
})

describe('rendering again', () => {
  it('keeps the sizing', async () => {
    const calendar = initCalendar({
      initialView: 'dayGridMonth',
      initialDate: '2019-08-08',
      dayMaxEventRows: 3,
      events: [
        { date: '2019-08-08', title: 'event' },
        { date: '2019-08-08', title: 'event' },
        { date: '2019-08-08', title: 'event' },
        { date: '2019-08-08', title: 'event' },
      ],
    })
    await waitForSettle()
    expect(queryParts(calendar.el, 'moreLink')).toHaveLength(1) // relies on measuring the cells

    calendar.render()
    await waitForSettle()

    expect(queryParts(calendar.el, 'moreLink')).toHaveLength(1)
    expect(queryParts(calendar.el, 'view')).toHaveLength(1)
  })
})

describe('rerenderDelay', () => {
  it('batches renders together, even when zero', async () => {
    const calendar = initCalendar({
      initialDate: '2016-12-04',
      initialView: 'timeGridDay',
      events: [
        { id: '1', start: '2016-12-04T01:00:00' },
        { id: '2', start: '2016-12-04T02:00:00' },
      ],
      rerenderDelay: 0,
    })
    await waitForSettle()
    expect(getEventEls(calendar.el)).toHaveLength(2)

    calendar.addEventSource([
      { id: '3', start: '2016-12-04T03:00:00' },
      { id: '4', start: '2016-12-04T04:00:00' },
    ])
    calendar.addEvent({ id: '5', start: '2016-12-04T05:00:00' })
    const event6 = calendar.addEvent({ id: '6', start: '2016-12-04T06:00:00' })!
    expect(getEventEls(calendar.el)).toHaveLength(2) // not rendered yet

    event6.remove()
    expect(getEventEls(calendar.el)).toHaveLength(2)

    await waitForSettle()
    expect(getEventEls(calendar.el).map(getEventIdOfEl).sort()).toEqual(['1', '2', '3', '4', '5'])
  })

  it('renders synchronously without it', async () => {
    const calendar = initCalendar({
      initialDate: '2016-12-04',
      initialView: 'timeGridDay',
      events: [{ id: '1', start: '2016-12-04T01:00:00' }],
    })
    await waitForSettle()

    calendar.addEvent({ id: '2', start: '2016-12-04T02:00:00' })

    expect(getEventEls(calendar.el, '2')).toHaveLength(1)
  })
})
