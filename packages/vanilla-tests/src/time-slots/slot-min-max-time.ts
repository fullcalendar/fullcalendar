import { describe, expect, it } from 'vitest'
import { initCalendar } from '../lib/calendar'
import { getMajorSlotLabelTexts } from '../lib/models/slots'
import { waitForSettle } from '../lib/settle'

describe('slotMinTime', () => {
  it.each([
    [{}, '12am'],
    [{ slotMinTime: '01:00' }, '1am'],
    [{ slotMinTime: { hours: 9, minutes: 30 } }, '9:30am'],
  ])('with %j, starts at %s', async (options, label) => {
    const calendar = initCalendar({ initialView: 'timeGridWeek', ...options })
    await waitForSettle()

    expect(getMajorSlotLabelTexts(calendar.el)[0]).toBe(label)
  })

  // root cause of https://github.com/fullcalendar/fullcalendar-vue/issues/88
  it('rerenders when changed with setOption', async () => {
    const calendar = initCalendar({ initialView: 'timeGridDay', slotMinTime: '01:00' })
    await waitForSettle()
    expect(getMajorSlotLabelTexts(calendar.el)[0]).toBe('1am')

    calendar.setOption('slotMinTime', '09:00')
    await waitForSettle()

    expect(getMajorSlotLabelTexts(calendar.el)[0]).toBe('9am')
  })
})

describe('slotMaxTime', () => {
  it.each([
    [{}, '11pm'],
    [{ slotMaxTime: { hours: 12 } }, '11am'],
    [{ slotMaxTime: '17:00' }, '4pm'],
    [{ slotMaxTime: { hours: 24 } }, '11pm'],
    // the exclusive end is past the hour, so the last slot starts on the hour
    [{ slotMaxTime: { hours: 15, minutes: 20 } }, '3pm'],
    [{ slotMaxTime: '24:20' }, '12am'],
  ])('with %j, ends with the %s slot', async (options, label) => {
    const calendar = initCalendar({ initialView: 'timeGridWeek', ...options })
    await waitForSettle()

    expect(getMajorSlotLabelTexts(calendar.el).at(-1)).toBe(label)
  })
})
