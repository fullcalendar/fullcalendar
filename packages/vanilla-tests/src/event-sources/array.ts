import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { getEventEls } from '../lib/models/events'
import { waitForSettle } from '../lib/settle'

/*
Events from an array.
*/
describe('events as an array', () => {
  const options = {
    initialView: 'dayGridMonth',
    initialDate: '2014-05-01',
  }

  function getEventArray() {
    return [{ title: 'my event', start: '2014-05-21' }]
  }

  it('renders the events', async () => {
    const calendar = initCalendar({ ...options, events: getEventArray() })
    await waitForSettle()

    const eventEls = getEventEls(calendar.el)
    expect(eventEls).toHaveLength(1)
    expect(eventEls[0].textContent).toContain('my event')
  })

  it('renders the events of the extended source form, with its className', async () => {
    const calendar = initCalendar({
      ...options,
      eventSources: [{ className: 'customeventclass', events: getEventArray() }],
    })
    await waitForSettle()

    const eventEls = getEventEls(calendar.el)
    expect(eventEls).toHaveLength(1)
    expect(eventEls[0].textContent).toContain('my event')
    expect(eventEls[0].classList).toContain('customeventclass')
  })

  it('doesn\'t mutate the original array or its objects', async () => {
    const eventArray = getEventArray()
    const origEvent = eventArray[0]
    const calendar = initCalendar({ ...options, events: eventArray })
    await waitForSettle()
    expect(getEventEls(calendar.el)).toHaveLength(1)

    expect(eventArray).toEqual(getEventArray())
    expect(eventArray).toHaveLength(1)
    expect(eventArray[0]).toBe(origEvent)
    expect(origEvent).toEqual({ title: 'my event', start: '2014-05-21' })
  })
})
