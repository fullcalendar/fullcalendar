import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { queryParts } from '../lib/models/events'
import { getSlotLabelTexts, getSlotLaneEls } from '../lib/models/slots'
import { waitForSettle } from '../lib/settle'

describe('slotDuration', () => {
  it.each([
    [{}, 48], // the default: 30 minutes
    [{ slotDuration: { minutes: 15 } }, 96],
    [{ slotDuration: { minutes: 17 } }, 85], // doesn't divide the day evenly
    [{ slotDuration: { minutes: 62 } }, 24],
    [{ slotDuration: { minutes: 300 } }, 5],
  ])('with %j, divides the day into %i slots', async (options, count) => {
    const calendar = initCalendar({ initialView: 'timeGridDay', ...options })
    await waitForSettle()

    expect(getSlotLaneEls(calendar.el).length).toBe(count)
  })

  // https://github.com/fullcalendar/fullcalendar/issues/5952
  it('can render a single day-long slot', async () => {
    const calendar = initCalendar({ initialView: 'timeGridDay', slotDuration: '24:00' })
    await waitForSettle()

    expect(getSlotLaneEls(calendar.el).length).toBe(1)
    expect(getSlotLabelTexts(calendar.el)).toEqual(['12am'])
  })

  describe('with slotLabelInterval', () => {
    const options = {
      initialView: 'timeGridDay',
      initialDate: '2017-07-17',
      locale: 'en-GB', // for 00:00 instead of 24:00
      slotHeaderFormat: { hour: '2-digit', minute: '2-digit', hour12: false },
      slotHeaderInterval: '01:00',
    } as const

    it.each([
      ['01:00', '00:00', '03:00', ['00:00', '01:00', '02:00']],
      ['01:00', '00:20', '03:20', ['00:20', '01:20', '02:20']], // out of alignment with the hour
      ['00:30', '00:00', '03:00', ['00:00', '', '01:00', '', '02:00', '']],
      ['00:30', '00:20', '03:20', ['00:20', '', '01:20', '', '02:20', '']],
    ])('with slotDuration %s from %s to %s, labels the slots %j', async (
      slotDuration,
      slotMinTime,
      slotMaxTime,
      labels,
    ) => {
      const calendar = initCalendar({ ...options, slotDuration, slotMinTime, slotMaxTime })
      await waitForSettle()

      expect(getSlotLabelTexts(calendar.el)).toEqual(labels)
    })

    it('gives every slot header its time, labeled or not, matching its lane', async () => {
      const calendar = initCalendar({ ...options, slotDuration: '00:30', slotMinTime: '00:00', slotMaxTime: '02:00' })
      await waitForSettle()

      const times = ['00:00:00', '00:30:00', '01:00:00', '01:30:00']
      expect(queryParts(calendar.el, 'slotHeader').map((el) => el.getAttribute('data-time'))).toEqual(times)
      expect(getSlotLaneEls(calendar.el).map((el) => el.getAttribute('data-time'))).toEqual(times)
    })
  })
})
