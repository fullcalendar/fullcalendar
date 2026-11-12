import { describe, expect, it } from 'vitest'
import { Calendar, CalendarOptions } from 'fullcalendar'
import { initCalendar } from '../lib/calendar'
import { ToolbarModel } from '../lib/models/toolbar'
import { waitForSettle } from '../lib/settle'

/*
Whether the prev/next/today buttons are enabled, which depends on whether there's anywhere valid to go.
SEE ALSO: visible-range/valid-range.ts
*/
describe('toolbar button state', () => {
  async function isButtonEnabled(options: CalendarOptions, name: 'prev' | 'next' | 'today'): Promise<boolean> {
    const calendar = initCalendar({
      headerToolbar: { left: 'prev,next today' },
      ...options,
    })
    await waitForSettle()

    const buttonEl = getNavButton(calendar, name)
    const buttonState = calendar.getButtonState()[name] as { isDisabled: boolean }
    expect(buttonState.isDisabled).toBe(buttonEl.disabled) // the public API agrees with the DOM
    return !buttonEl.disabled
  }

  function getNavButton(calendar: Calendar, name: string): HTMLButtonElement {
    const label = calendar.getButtonState()[name].hint // ex: "Next Week"
    return ToolbarModel.header(calendar.el)!.getButton(label)
  }

  describe('next button', () => {
    const weekOptions = { initialView: 'timeGridWeek', initialDate: '2017-06-08' }

    it.each([
      ['no validRange', {}, true],
      // a year after the week's start (2017-06-04) is 2018-06-04, in the week 2018-06-03 - 2018-06-10
      ['the next range is within validRange', { validRange: { end: '2018-06-10' }, dateIncrement: { years: 1 } }, true],
      ['the next range is partly within validRange', { validRange: { end: '2018-06-05' }, dateIncrement: { years: 1 } }, true],
      ['the next range is beyond validRange', { validRange: { end: '2018-06-03' }, dateIncrement: { years: 1 } }, false],
      // initialDate is moved forward into validRange, and the week after is valid too
      ['initialDate is constrained forward', { initialDate: '2017-07-17', validRange: { start: '2036-05-03', end: '2036-06-01' } }, true],
    ])('when %s, is enabled: %s', async (_desc, extraOptions, isEnabled) => {
      expect(await isButtonEnabled({ ...weekOptions, ...extraOptions }, 'next')).toBe(isEnabled)
    })

    it('is enabled when the next day is hidden', async () => {
      expect(await isButtonEnabled({
        initialView: 'dayGridDay',
        initialDate: '2017-03-31', // a Friday
        weekends: false,
      }, 'next')).toBe(true)
    })
  })

  describe('prev button', () => {
    const weekOptions = { initialView: 'timeGridWeek', initialDate: '2017-06-08' }

    it.each([
      ['no validRange', {}, true],
      // a year before the week's start (2017-06-04) is 2016-06-04, in the week 2016-05-29 - 2016-06-05
      ['the prev range ends where validRange starts', { validRange: { start: '2016-06-05' }, dateIncrement: { years: 1 } }, false],
      ['the prev range is partly within validRange', { validRange: { start: '2016-06-01' }, dateIncrement: { years: 1 } }, true],
      // initialDate is moved back into validRange, and the week before is valid too
      ['initialDate is constrained backward', { initialDate: '2017-07-17', validRange: { start: '2017-03-20', end: '2017-03-30' } }, true],
    ])('when %s, is enabled: %s', async (_desc, extraOptions, isEnabled) => {
      expect(await isButtonEnabled({ ...weekOptions, ...extraOptions }, 'prev')).toBe(isEnabled)
    })

    it.each([
      // a year earlier is 2016-03
      ['the prev month is partly before validRange', '2016-03-15', true],
      ['the prev month is before validRange', '2017-02-07', false],
    ])('in month view, when %s, is enabled: %s', async (_desc, validStart, isEnabled) => {
      expect(await isButtonEnabled({
        initialView: 'dayGridMonth',
        initialDate: '2017-03-01',
        validRange: { start: validStart },
        dateIncrement: { years: 1 },
      }, 'prev')).toBe(isEnabled)
    })

    it('is enabled when the previous day is hidden', async () => {
      expect(await isButtonEnabled({
        initialView: 'dayGridDay',
        initialDate: '2017-03-27', // a Monday
        weekends: false,
      }, 'prev')).toBe(true)
    })
  })

  describe('today button', () => {
    const monthOptions = { initialView: 'dayGridMonth', now: '2017-06-30' }

    it.each([
      ['now is in the current month', { initialDate: '2017-06-01' }, false],
      ['now is visible but not in the current month', { initialDate: '2017-07-01' }, true],
      ['now is out of view', { initialDate: '2017-08-01' }, true],
      // the previous day is visible in the June view, but June's month is entirely before validRange
      ['now\'s month is before validRange', { initialDate: '2017-08-01', validRange: { start: '2017-07-02' } }, false],
    ])('when %s, is enabled: %s', async (_desc, extraOptions, isEnabled) => {
      expect(await isButtonEnabled({ ...monthOptions, ...extraOptions }, 'today')).toBe(isEnabled)
    })
  })
})
