import { describe, expect, it, vi } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { waitForSettle } from '../lib/settle'

/*
Handlers added with calendar.on() and removed with calendar.off(). Exercised with datesSet, which next() fires.
*/
describe('on and off', () => {
  const options = { initialView: 'dayGridMonth', initialDate: '2014-06-01' }

  it('on() adds a handler, called with the callback\'s arguments', async () => {
    const calendar = initCalendar(options)
    await waitForSettle()

    const handler = vi.fn()
    calendar.on('datesSet', handler)
    calendar.next()
    await waitForSettle()

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler.mock.calls[0][0].startStr).toBe('2014-06-29T00:00:00Z')
  })

  it('off() with a handler removes only that handler', async () => {
    const calendar = initCalendar(options)
    await waitForSettle()

    const removed = vi.fn()
    const kept = vi.fn()
    calendar.on('datesSet', removed)
    calendar.on('datesSet', kept)
    calendar.next()
    await waitForSettle()

    calendar.off('datesSet', removed)
    calendar.next()
    await waitForSettle()

    expect(removed).toHaveBeenCalledTimes(1)
    expect(kept).toHaveBeenCalledTimes(2)
  })

  it('off() without a handler removes all of the name\'s handlers, but not the option\'s', async () => {
    const optionHandler = vi.fn()
    const calendar = initCalendar({ ...options, datesSet: optionHandler })
    await waitForSettle()
    optionHandler.mockClear()

    const handler1 = vi.fn()
    const handler2 = vi.fn()
    calendar.on('datesSet', handler1)
    calendar.on('datesSet', handler2)
    calendar.next()
    await waitForSettle()

    calendar.off('datesSet')
    calendar.next()
    await waitForSettle()

    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1)
    expect(optionHandler).toHaveBeenCalledTimes(2)
  })
})
